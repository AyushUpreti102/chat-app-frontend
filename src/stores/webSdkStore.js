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
    if (ws.value?.readyState === 1) return;

    const userStore = useUserStore();

    ws.value = createWebSocket(userId);

    ws.value.onopen = () => {
      isConnected.value = true;
    };

    ws.value.onmessage = ({ data }) => {
      const event = JSON.parse(data);

      switch (event.type) {
        case "message":
          if (String(event.data.sender) === String(userStore.currentUserId)) {
            return;
          }
          userStore.incomingMessage(event.data);
          break;

        case "online":
          userStore.updateUserOnlineStatus(
            event.data.userId,
            event.data.isOnline,
          );
          break;

        case "typing":
          typingUser.value = event.data.from;

          clearTimeout(typingTimer);

          typingTimer = setTimeout(() => {
            typingUser.value = null;
          }, 1500);
          break;
      }
    };

    ws.value.onclose = () => {
      isConnected.value = false;
    };
  };

  const send = (payload) => {
    if (ws.value?.readyState === 1) {
      ws.value.send(JSON.stringify(payload));
    }
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
