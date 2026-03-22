import axios from "../api";

export async function getUserContactsList(userId) {
  const res = await axios.get(`/user/contacts/${userId}`);
  return res.data;
}
