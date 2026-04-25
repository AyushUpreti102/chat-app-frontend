import axios from "../api";

/* ================= SUGGESTIONS ================= */

// Get chat list (left panel)
export async function getChatList() {
  const res = await axios.get("/user/getChatList");
  return res.data;
}
