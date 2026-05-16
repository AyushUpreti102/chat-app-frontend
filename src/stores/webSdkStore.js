import { defineStore } from "pinia";
import { ref } from "vue";
import { createWebSocket } from "src/utils/webSocket";
import { useUserStore } from "./userStore";
import {
  handleAnswer,
  handleIceCandidate,
  handleRenegotiation,
  endCall as endCallService,
} from "src/utils/webRtc";

export const useWebSdkStore = defineStore("webSdkStore", () => {
  const userStore = useUserStore();

  const ws = ref(null);
  const isConnected = ref(false);
  const typingUser = ref(null);
  const incomingCall = ref(null);
  const activeCall = ref(null);
  const localStream = ref(null);
  const remoteStream = ref(null);
  const isVideoCall = ref(false);
  const isCameraEnabled = ref(false);
  const callPeerId = ref(null);

  let typingTimer = null;

  const setCallPeer = (peerId) => {
    callPeerId.value = peerId ? String(peerId) : null;
  };

  const resetCallState = () => {
    incomingCall.value = null;
    activeCall.value = null;
    localStream.value = null;
    remoteStream.value = null;
    isVideoCall.value = false;
    isCameraEnabled.value = false;
    callPeerId.value = null;
    endCallService();
  };

  const markCallConnected = () => {
    if (!activeCall.value) return;

    activeCall.value = {
      ...activeCall.value,
      status: "connected",
    };
  };

  const hangUp = (peerId) => {
    if (peerId) {
      send({
        type: "call-end",
        data: { to: peerId },
      });
    }

    resetCallState();
  };

  const connect = (userId) => {
    if (ws.value && [0, 1].includes(ws.value.readyState)) return;

    ws.value = createWebSocket(userId);

    ws.value.onopen = () => {
      isConnected.value = true;
    };

    ws.value.onmessage = async ({ data }) => {
      const event = JSON.parse(data);

      switch (event.type) {
        case "message": {
          const isOwnMessage =
            String(event.data.sender) === String(userStore.currentUserId);

          if (isOwnMessage) return;

          userStore.incomingMessage(normalizeMessage(event.data));
          break;
        }

        case "online":
          userStore.updateUserOnlineStatus(
            event.data.userId,
            event.data.isOnline,
          );
          break;

        case "typing":
          if (typingUser.value !== event.data.from) {
            typingUser.value = event.data.from;
          }

          clearTimeout(typingTimer);

          typingTimer = setTimeout(() => {
            typingUser.value = null;
          }, 1200);
          break;

        case "call-offer": {
          const { from, offer, isVideo } = event.data || {};

          console.log("CALL OFFER:", event.data);

          if (!from || !offer) return;
          // --------------------------------
          // RENEGOTIATION
          // --------------------------------
          if (activeCall.value) {
            const answer = await handleRenegotiation(offer, (stream) => {
              localStream.value = stream;
              const vt = stream?.getVideoTracks?.()?.[0];
              if (vt) {
                isVideoCall.value = true;
                isCameraEnabled.value = vt.enabled;
              }
            });

            if (answer) {
              sendCallAnswer(from, answer);
            }

            return;
          }

          // ---------------------------------
          // ALREADY RINGING
          // ---------------------------------
          if (incomingCall.value) {
            send({
              type: "call-busy",
              data: { to: from },
            });

            return;
          }

          // ---------------------------------
          // ALREADY IN ACTIVE CALL
          // ---------------------------------
          const alreadyInCall =
            activeCall.value &&
            ["calling", "ringing", "connecting", "connected"].includes(
              activeCall.value.status,
            );

          if (alreadyInCall) {
            send({
              type: "call-busy",
              data: { to: from },
            });
            resetCallState();
            return;
          }

          // ---------------------------------
          // SAVE INCOMING CALL
          // ---------------------------------
          setCallPeer(from);

          incomingCall.value = {
            from,
            offer,
            isVideo,
            name: userStore.getFriend(from)?.user.username,
          };

          break;
        }

        case "call-answer": {
          const answer = event.data?.answer ?? event.answer;

          if (!answer) break;

          await handleAnswer(answer);

          if (activeCall.value) {
            activeCall.value = {
              ...activeCall.value,
              status: "connecting",
            };
          }

          break;
        }

        case "ice-candidate": {
          const candidate = event.data?.candidate ?? event.candidate;

          handleIceCandidate(candidate);
          break;
        }

        case "call-end":
          resetCallState();
          break;
      }
    };

    ws.value.onclose = () => {
      isConnected.value = false;

      // auto reconnect
      setTimeout(() => {
        if (userId) connect(userId);
      }, 2000);
    };
  };

  function normalizeMessage(data) {
    return {
      _id: data._id || Date.now(),
      sender: data.sender,
      receiver: data.to,

      text: data.text || null,

      files:
        data.files ||
        (data.fileUrl
          ? [{ fileUrl: data.fileUrl, fileName: data.fileName }]
          : []),

      createdAt: data.createdAt || new Date(),

      isSender: false,
    };
  }

  const send = (payload) => {
    if (!ws.value || ws.value.readyState !== 1) {
      console.warn("WebSocket not connected");
      return;
    }

    ws.value.send(JSON.stringify(payload));
  };

  const sendTyping = (to) => {
    send({
      type: "typing",
      data: { to },
    });
  };

  const sendCallOffer = (to, offer, isVideo) => {
    if (!to || !offer) return;

    send({
      type: "call-offer",
      data: { to: String(to), offer, isVideo },
    });
  };

  const sendCallAnswer = (to, answer) => {
    if (!to || !answer) return;

    send({
      type: "call-answer",
      data: { to: String(to), answer },
    });
  };

  const sendIceCandidate = (to, candidate) => {
    if (!to || !candidate?.candidate) return;

    send({
      type: "ice-candidate",
      data: { to: String(to), candidate },
    });
  };

  const close = () => {
    ws.value?.close();
    ws.value = null;
  };

  return {
    isConnected,
    isVideoCall,
    isCameraEnabled,
    typingUser,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    connect,
    send,
    sendTyping,
    sendCallOffer,
    sendCallAnswer,
    sendIceCandidate,
    callPeerId,
    setCallPeer,
    markCallConnected,
    hangUp,
    resetCallState,
    close,
  };
});
