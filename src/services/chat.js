import axios from "../api";

// Fetch chat history between logged-in user and another user
export async function getChatHistory(otherUserId) {
  const res = await axios.get(`/chat/history/${otherUserId}`);
  return res.data;
}

export async function getAllConversations() {
  const res = await axios.get(`/chat/conversations`);
  return res.data;
}
