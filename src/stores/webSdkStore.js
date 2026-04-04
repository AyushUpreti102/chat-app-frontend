import { defineStore, acceptHMRUpdate } from "pinia";
import { createWebSocket } from "src/utils/webSocket";

export const useWebSdkStore = defineStore("webSdkStore", {
  state: () => ({
    ws: null,
    eventDetails: null,
    isWebSocketConnectionOpen: false,
  }),
  getters: {
    /** Add getters if needed */
  },
  actions: {
    initiateWebSocket(currentLoggedUserId) {
      this.ws = createWebSocket(currentLoggedUserId);

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.eventDetails = data;
      };

      this.ws.onerror = (error) => {
        console.log(error);
      };

      this.ws.onopen = () => {
        console.log("✅ Connected to WebSocket");
        this.onWebSocketConnectionOpen();
      };

      this.ws.onclose = () => {
        console.log("❌ Disconnected");
        this.onWebSocketConnectionClose();
      };
    },
    onWebSocketConnectionOpen() {
      this.isWebSocketConnectionOpen = true;
    },
    onWebSocketConnectionClose() {
      this.isWebSocketConnectionOpen = false;
    },
    sendMessage(payload) {
      if (this.isWebSocketConnectionOpen) {
        this.ws.send(JSON.stringify(payload));
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWebSdkStore, import.meta.hot));
}
