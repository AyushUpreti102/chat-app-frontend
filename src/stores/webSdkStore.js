import { defineStore } from "pinia";
import { ref } from "vue";
import { createWebSocket } from "src/utils/webSocket";
import { useUserStore } from "./userStore";

export const useWebSdkStore = defineStore("webSdkStore", () => {
  const ws = ref(null);
  const isConnected = ref(false);
  const typingUser = ref(null);

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

  const close = () => {
    ws.value?.close();
    ws.value = null;
  };

  return {
    isConnected,
    typingUser,
    connect,
    send,
    sendTyping,
    close,
  };
});
