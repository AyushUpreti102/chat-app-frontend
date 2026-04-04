import axios from "../api";

export async function getUserFriends() {
  const res = await axios.get(`/user/friends`);
  return res.data;
}

export async function getSuggestions() {
  const res = await axios.get(`/user/suggestions`);
  return res.data;
}

export async function addFriend(friendId) {
  const res = await axios.post(`/user/add-friend/${friendId}`);
  return res.data;
}

export async function removeFriend(friendId) {
  const res = await axios.delete(`/user/remove-friend/${friendId}`);
  return res.data;
}
