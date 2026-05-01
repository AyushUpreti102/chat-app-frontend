const isProd = import.meta.env.VITE_NODE_ENV === "PROD";

const webSocketUrl = isProd
  ? import.meta.env.VITE_WS_PROD_URL
  : import.meta.env.VITE_WS_DEV_URL;

export const createWebSocket = (userId) => {
  const ws = new WebSocket(webSocketUrl + `?userId=${userId}`);
  return ws;
};
