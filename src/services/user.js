import axios from "../api";

export async function getUserFriends(userId) {
  const res = await axios.get(`/user/friends/${userId}`);
  return res.data;
}

export async function getSuggestions(userId) {
  const res = await axios.get(`/user/suggestions/${userId}`);
  return res.data;
}

export async function addFriend(userId, friendId) {
  const res = await axios.post(`/user/${userId}/add-friend/${friendId}`);
  return res.data;
}

export async function removeFriend(userId, friendId) {
  const res = await axios.delete(`/user/${userId}/remove-friend/${friendId}`);
  return res.data;
}
