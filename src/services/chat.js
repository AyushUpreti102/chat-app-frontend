import axios from "../api";

/* ================= MESSAGES ================= */

// Get messages by conversationId
export async function getMessages(conversationId) {
  const res = await axios.get(`/chat/messages/${conversationId}`);
  return res.data;
}

/* ================= READ ================= */

// Mark messages as read
export async function markAsRead(conversationId) {
  const res = await axios.post("/chat/read", {
    conversationId,
  });
  return res.data;
}

/* ================= OPTIONAL (ONLY if REST sending exists) ================= */

// export async function sendMessage(payload) {
//   const res = await axios.post("/chat/send", payload);
//   return res.data;
// }
