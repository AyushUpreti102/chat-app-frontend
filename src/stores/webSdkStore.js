import { defineStore } from "pinia";
import { ref } from "vue";
import { createWebSocket } from "src/utils/webSocket";
import { useUserStore } from "./userStore";
import { handleAnswer, handleIceCandidate } from "src/utils/webRtc";

export const useWebSdkStore = defineStore("webSdkStore", () => {
  const ws = ref(null);
  const isConnected = ref(false);
  const typingUser = ref(null);
  const incomingCall = ref(null);

  let typingTimer = null;

  const connect = (userId) => {
    if (ws.value && [0, 1].includes(ws.value.readyState)) return;

    const userStore = useUserStore();

    ws.value = createWebSocket(userId);

    ws.value.onopen = () => {
      isConnected.value = true;
    };

    ws.value.onmessage = ({ data }) => {
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
          console.log(event.data, "offer");
          if (!from || !offer) return;

          // 🔥 reject if already busy
          if (incomingCall.value) {
            send({
              type: "call-end",
              data: { to: from },
            });
            return;
          }
          incomingCall.value = { from, offer, isVideo };
          break;
        }

        case "call-answer":
          handleAnswer(event.data.answer);
          break;

        case "ice-candidate":
          handleIceCandidate(event.data.candidate);
          break;

        case "call-end":
          incomingCall.value = null;

          window.dispatchEvent(
            new CustomEvent("call-end", { detail: event.data }),
          );
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
    send({
      type: "call-offer",
      data: { to, offer, isVideo },
    });
  };

  const sendCallAnswer = (to, answer) => {
    send({
      type: "call-answer",
      data: { to, answer },
    });
  };

  const sendIceCandidate = (to, candidate) => {
    send({
      type: "ice-candidate",
      data: { to, candidate },
    });
  };

  const endCall = (to) => {
    send({
      type: "call-end",
      data: { to },
    });
  };

  const close = () => {
    ws.value?.close();
    ws.value = null;
  };

  return {
    isConnected,
    typingUser,
    incomingCall,
    connect,
    send,
    sendTyping,
    sendCallOffer,
    sendCallAnswer,
    sendIceCandidate,
    endCall,
    close,
  };
});
