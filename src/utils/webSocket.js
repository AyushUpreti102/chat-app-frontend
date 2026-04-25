const isProd = process.env.ENV === "PROD";

const webSocketUrl = isProd ? process.env.WS_PROD_URL : process.env.WS_DEV_URL;

export const createWebSocket = (userId) => {
  const ws = new WebSocket(webSocketUrl + `?userId=${userId}`);
  return ws;
};
