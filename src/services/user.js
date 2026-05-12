import axios from "../api";

/* ================= CHAT LIST ================= */

export async function getChatList() {
  const res = await axios.get("/user/getChatList");
  return res.data;
}

/* ================= SEARCH ================= */

export async function searchUsers(query) {
  const q = String(query ?? "").trim();
  if (q.length < 2) return [];

  const res = await axios.get("/user/search", { params: { query: q } });
  const data = res.data;
  return Array.isArray(data) ? data : data?.users ?? [];
}

/** Creates or returns existing DM; refresh chat list after success. */
export async function startConversationWithUser(peerId) {
  const res = await axios.post("/user/startConversation", { peerId });
  return res.data;
}
