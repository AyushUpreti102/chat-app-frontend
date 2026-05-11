let pc = null;

let localStream = null;
let remoteStream = null;

let iceQueue = [];
let isRemoteDescSet = false;

let sendIceCandidateFn = null;
let sendOfferFn = null;
let sendAnswerFn = null;

// -----------------------------------
// SIGNALING
// -----------------------------------
export function registerSignaling({ sendIceCandidate, sendOffer, sendAnswer }) {
  sendIceCandidateFn = sendIceCandidate;
  sendOfferFn = sendOffer;
  sendAnswerFn = sendAnswer;
}

export function getPeerConnection() {
  return pc;
}

// -----------------------------------
// CLEANUP
// -----------------------------------
export function cleanup() {
  try {
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;

      pc.getSenders().forEach((sender) => {
        try {
          sender.track?.stop();
        } catch {
          //
        }
      });

      pc.close();
    }
  } catch (err) {
    console.error("cleanup error:", err);
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        //
      }
    });
  }

  pc = null;
  localStream = null;
  remoteStream = null;

  iceQueue = [];
  isRemoteDescSet = false;
}

// -----------------------------------
// CREATE PEER CONNECTION
// -----------------------------------
export function createPeerConnection(onRemoteStream) {
  if (pc) cleanup();

  const currentPc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });

  pc = currentPc;

  remoteStream = new MediaStream();

  // -----------------------------------
  // REMOTE TRACK
  // -----------------------------------
  currentPc.ontrack = (event) => {
    if (currentPc !== pc) return;

    console.log("REMOTE TRACK:", event.track.kind);

    const exists = remoteStream
      ?.getTracks()
      ?.find((t) => t.id === event.track.id);

    if (!exists) {
      remoteStream.addTrack(event.track);
    }

    // IMPORTANT:
    // NEW REFERENCE FOR VUE REACTIVITY
    remoteStream = new MediaStream(remoteStream.getTracks());

    onRemoteStream?.(remoteStream);
  };

  // -----------------------------------
  // ICE
  // -----------------------------------
  currentPc.onicecandidate = (event) => {
    if (currentPc !== pc) return;

    if (event.candidate) {
      sendIceCandidateFn?.(event.candidate);
    }
  };

  // -----------------------------------
  // CONNECTION STATE
  // -----------------------------------
  currentPc.onconnectionstatechange = () => {
    if (currentPc !== pc) return;

    console.log("CONNECTION:", currentPc.connectionState);

    window.dispatchEvent(
      new CustomEvent("webrtc-state", {
        detail: currentPc.connectionState,
      }),
    );
  };

  return currentPc;
}

// -----------------------------------
// LOCAL STREAM
// -----------------------------------
async function createLocalStream(isVideo) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: isVideo,
  });

  localStream = new MediaStream(stream.getTracks());

  return localStream;
}

// -----------------------------------
// ADD LOCAL TRACKS
// -----------------------------------
function addLocalTracks(currentPc) {
  if (!localStream) return;

  localStream.getTracks().forEach((track) => {
    const exists = currentPc.getSenders().find((s) => s.track?.id === track.id);

    if (!exists) {
      currentPc.addTrack(track, localStream);
    }
  });
}

// -----------------------------------
// START CALL
// -----------------------------------
export async function startCall({ isVideo, onRemoteStream, onLocalStream }) {
  cleanup();

  const currentPc = createPeerConnection(onRemoteStream);

  await createLocalStream(isVideo);

  if (currentPc !== pc) return;

  onLocalStream?.(localStream, {
    isVideoCall: isVideo,
    isCameraEnabled: isVideo,
  });

  addLocalTracks(currentPc);

  const offer = await currentPc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: isVideo,
  });

  if (currentPc !== pc) return;

  await currentPc.setLocalDescription(offer);

  sendOfferFn?.(offer, isVideo);
}

// -----------------------------------
// ACCEPT CALL
// -----------------------------------
export async function acceptCall({
  offer,
  isVideo,
  onRemoteStream,
  onLocalStream,
}) {
  cleanup();

  const currentPc = createPeerConnection(onRemoteStream);

  await createLocalStream(isVideo);

  if (currentPc !== pc) return;

  onLocalStream?.(localStream, {
    isVideoCall: isVideo,
    isCameraEnabled: isVideo,
  });

  addLocalTracks(currentPc);

  await currentPc.setRemoteDescription(new RTCSessionDescription(offer));

  isRemoteDescSet = true;

  await flushIceQueue(currentPc);

  const answer = await currentPc.createAnswer();

  if (currentPc !== pc) return;

  await currentPc.setLocalDescription(answer);

  sendAnswerFn?.(answer);
}

// -----------------------------------
// HANDLE ANSWER
// -----------------------------------
export async function handleAnswer(answer) {
  const currentPc = pc;

  if (!currentPc) return;

  try {
    if (currentPc.signalingState !== "have-local-offer") {
      console.warn("Skipping answer in state:", currentPc.signalingState);

      return;
    }

    await currentPc.setRemoteDescription(new RTCSessionDescription(answer));

    isRemoteDescSet = true;

    await flushIceQueue(currentPc);

    console.log("REMOTE ANSWER APPLIED");
  } catch (err) {
    console.error("handleAnswer error:", err);
  }
}

// -----------------------------------
// HANDLE RENEGOTIATION
// -----------------------------------
export async function handleRenegotiation(offer, onLocalStream) {
  const currentPc = pc;

  if (!currentPc) return null;

  try {
    const wantsVideo = offer.sdp.includes("m=video");

    // -----------------------------------
    // ADD VIDEO TRACK
    // -----------------------------------
    if (wantsVideo) {
      const hasVideo = localStream?.getVideoTracks()?.length > 0;

      if (!hasVideo) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (currentPc !== pc) return null;

        const videoTrack = stream.getVideoTracks()[0];

        stream.getAudioTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            //
          }
        });

        localStream.addTrack(videoTrack);

        // IMPORTANT
        localStream = new MediaStream(localStream.getTracks());

        onLocalStream?.(localStream);

        const sender = currentPc
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        } else {
          currentPc.addTrack(videoTrack, localStream);
        }
      }
    }

    await currentPc.setRemoteDescription(new RTCSessionDescription(offer));

    isRemoteDescSet = true;

    await flushIceQueue(currentPc);

    const answer = await currentPc.createAnswer();

    if (currentPc !== pc) return null;

    await currentPc.setLocalDescription(answer);

    return answer;
  } catch (err) {
    console.error("Renegotiation error:", err);

    return null;
  }
}

// -----------------------------------
// ICE
// -----------------------------------
export async function handleIceCandidate(candidate) {
  const currentPc = pc;

  if (!currentPc || !isRemoteDescSet) {
    iceQueue.push(candidate);
    return;
  }

  try {
    await currentPc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.error("ICE ERROR:", err);
  }
}

async function flushIceQueue(currentPc) {
  for (const candidate of iceQueue) {
    try {
      await currentPc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error(err);
    }
  }

  iceQueue = [];
}

// -----------------------------------
// TOGGLE MIC
// -----------------------------------
export function toggleMic(enabled) {
  if (!localStream) return;

  localStream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

// -----------------------------------
// TOGGLE VIDEO
// -----------------------------------
export function toggleVideo(enabled) {
  if (!localStream) return;

  localStream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

// -----------------------------------
// SWITCH TO VIDEO
// -----------------------------------
export async function switchToVideo(onLocalStream, onVideoStateChange) {
  const currentPc = pc;

  if (!currentPc || !localStream) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (currentPc !== pc) return;

    const videoTrack = stream.getVideoTracks()[0];

    stream.getAudioTracks().forEach((t) => {
      try {
        t.stop();
      } catch {
        //
      }
    });

    const existing = localStream.getVideoTracks()[0];

    if (existing) {
      existing.stop();
      localStream.removeTrack(existing);
    }

    localStream.addTrack(videoTrack);

    // IMPORTANT
    localStream = new MediaStream(localStream.getTracks());

    onLocalStream?.(localStream);

    onVideoStateChange?.({
      isVideoCall: true,
      isCameraEnabled: true,
    });

    const sender = currentPc
      .getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender) {
      await sender.replaceTrack(videoTrack);
    } else {
      currentPc.addTrack(videoTrack, localStream);
    }

    if (currentPc.signalingState !== "stable") {
      console.warn("Cannot renegotiate:", currentPc.signalingState);

      return;
    }

    const offer = await currentPc.createOffer({
      offerToReceiveVideo: true,
    });

    if (currentPc !== pc) return;

    await currentPc.setLocalDescription(offer);

    sendOfferFn?.(offer, true);
  } catch (err) {
    console.error("switchToVideo error:", err);
  }
}

// -----------------------------------
// END CALL
// -----------------------------------
export function endCall() {
  cleanup();
}
