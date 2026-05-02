// src/services/webrtcService.js

let pc = null;
let localStream = null;
let remoteStream = null;

let iceQueue = [];
let isRemoteDescSet = false;

// 🔥 Replace with your signaling functions
let sendIceCandidateFn = null;
let sendOfferFn = null;
let sendAnswerFn = null;

export function registerSignaling({ sendIceCandidate, sendOffer, sendAnswer }) {
  sendIceCandidateFn = sendIceCandidate;
  sendOfferFn = sendOffer;
  sendAnswerFn = sendAnswer;
}

// ----------------------------
// INIT PEER CONNECTION
// ----------------------------
export function createPeerConnection(onRemoteStream) {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  remoteStream = new MediaStream();

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });

    if (onRemoteStream) {
      onRemoteStream(remoteStream);
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && sendIceCandidateFn) {
      sendIceCandidateFn(event.candidate);
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log("ICE State:", pc.iceConnectionState);
  };

  return pc;
}

// ----------------------------
// START CALL (CALLER)
// ----------------------------
export async function startCall({ isVideo, onRemoteStream }) {
  createPeerConnection(onRemoteStream);

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: isVideo,
  });

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  sendOfferFn(offer, isVideo);
}

// ----------------------------
// ACCEPT CALL (RECEIVER)
// ----------------------------
export async function acceptCall({ offer, isVideo, onRemoteStream }) {
  createPeerConnection(onRemoteStream);

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: isVideo,
  });

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  isRemoteDescSet = true;

  await flushIceQueue();

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  sendAnswerFn(answer);
}

// ----------------------------
// HANDLE ANSWER (CALLER)
// ----------------------------
export async function handleAnswer(answer) {
  if (!pc) return;

  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  isRemoteDescSet = true;

  await flushIceQueue();
}

// ----------------------------
// HANDLE ICE
// ----------------------------
export async function handleIceCandidate(candidate) {
  if (!pc) {
    console.warn("⚠️ PC not ready, queueing ICE");
    iceQueue.push(candidate);
    return;
  }

  if (!isRemoteDescSet) {
    console.log("⏳ Queue ICE (waiting for remote SDP)");
    iceQueue.push(candidate);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("✅ ICE added");
  } catch (err) {
    console.error("❌ ICE error:", err);
  }
}

// ----------------------------
// FLUSH ICE QUEUE
// ----------------------------
async function flushIceQueue() {
  for (const candidate of iceQueue) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("❌ Flush ICE error:", err);
    }
  }
  iceQueue = [];
}

// ----------------------------
// END CALL
// ----------------------------
export function endCall() {
  if (pc) {
    pc.close();
    pc = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }

  remoteStream = null;
  iceQueue = [];
  isRemoteDescSet = false;
}
