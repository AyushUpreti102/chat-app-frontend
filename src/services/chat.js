import axios from "../api";

// Fetch chat history between logged-in user and another user
export async function getChatHistory(userId, otherUserId) {
  const res = await axios.get(`/chat/${userId}/${otherUserId}`);
  return res.data;
}

export async function getAllConversations(userId) {
  const res = await axios.get(`/chat/conversations/${userId}`);
  return res.data;
}
