const webSocketUrl = import.meta.env.VITE_WS_PROD_URL || "ws://localhost:3000/ws";

export const createWebSocket = (userId) => {
  const ws = new WebSocket(webSocketUrl + `?userId=${userId}`);
  return ws;
};
