import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getChatList } from "src/services/user";
import { getMessages, markAsRead } from "src/services/chat";
import { notify } from "src/utils/notify";

export const useUserStore = defineStore("userStore", () => {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const friendsList = ref([]);
  const currentChatUser = ref(null);
  const currentChatMessages = ref([]);

  const currentUserId = computed(() => user.value?._id);

  let requestToken = 0;

  /* ================= AUTH ================= */

  const setUser = (data) => {
    user.value = data;
  };

  const setIsAuthenticated = (val) => {
    isAuthenticated.value = val;
  };

  /* ================= CHAT LIST ================= */

  const fetchChatList = async () => {
    try {
      const res = await getChatList();
      friendsList.value = res;
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HELPERS ================= */

  const getFriend = (userId) =>
    friendsList.value.find((f) => f.user._id === userId);

  const moveToTop = (userId) => {
    const index = friendsList.value.findIndex((f) => f.user._id === userId);
    if (index <= 0) return;

    const item = friendsList.value.splice(index, 1)[0];
    friendsList.value.unshift(item);
  };

  /* ================= OPEN CHAT ================= */

  const openConversation = async (userId) => {
    const friend = getFriend(userId);
    if (!friend) return;

    const isSameConversation =
      currentChatUser.value?.conversationId === friend.conversationId;
    if (isSameConversation && currentChatMessages.value.length) return;

    currentChatUser.value = friend;
    currentChatMessages.value = [];

    resetUnread(userId);

    const token = ++requestToken;

    try {
      await markAsRead(friend.conversationId);

      const history = await getMessages(friend.conversationId);

      if (token !== requestToken) return;

      currentChatMessages.value = history.map((msg) => ({
        _id: msg._id,
        isSender: String(msg.sender) === String(currentUserId.value),
        text: msg.text || "",
        files: msg.files || [],
        createdAt: msg.createdAt,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const setCurrentChatUser = (userId) => {
    const friend = getFriend(userId);
    if (friend) currentChatUser.value = friend;
  };

  const clearConversation = () => {
    currentChatUser.value = null;
    currentChatMessages.value = [];
  };

  function getPreview(text, files) {
    if (text) return text;

    if (files?.length) {
      return files.length === 1
        ? "📎 Attachment"
        : `📎 ${files.length} attachments`;
    }

    return "";
  }

  /* ================= MESSAGE EVENTS ================= */

  const incomingMessage = (msg) => {
    if (String(msg.sender) === String(currentUserId.value)) return;

    const senderId = String(msg.sender);
    const from = getFriend(senderId);

    notify(from.user.username, msg.text);

    const isCurrent = String(currentChatUser.value?.user._id) === senderId;
    if (isCurrent) {
      currentChatMessages.value.push({
        _id: msg._id,
        isSender: false,
        text: msg.text || "",
        files: msg.files || [],
        createdAt: msg.createdAt,
      });

      resetUnread(senderId);

      markAsRead(currentChatUser.value.conversationId).catch(console.error);
    }

    updateSidebar({
      userId: senderId,
      text: getPreview(msg.text, msg.files),
      isSender: false,
      incrementUnread: !isCurrent,
      createdAt: msg.createdAt,
    });
  };

  const outgoingMessage = (msg) => {
    currentChatMessages.value.push({
      _id: msg._id || Date.now(),
      isSender: true,
      text: msg.text || "",
      files: msg.files || [],
      createdAt: msg.createdAt,
    });

    updateSidebar({
      userId: msg.receiver,
      text: getPreview(msg.text, msg.files),
      isSender: true,
      createdAt: msg.createdAt,
    });
  };

  /* ================= SIDEBAR ================= */

  const updateSidebar = ({
    userId,
    text,
    isSender,
    incrementUnread = false,
    createdAt,
  }) => {
    const friend = getFriend(userId);
    if (!friend) return;

    friend.lastMessage = isSender ? `You: ${text}` : text;
    friend.lastMessageTime = createdAt;

    if (incrementUnread) {
      friend.unreadCount = (friend.unreadCount || 0) + 1;
    }

    moveToTop(userId);
  };

  const resetUnread = (userId) => {
    const friend = getFriend(userId);
    if (friend) friend.unreadCount = 0;
  };

  const updateUserOnlineStatus = (userId, isOnline) => {
    const friend = getFriend(userId);
    if (friend) friend.isOnline = isOnline;

    if (currentChatUser.value?.user._id === userId) {
      currentChatUser.value.isOnline = isOnline;
    }
  };

  return {
    user,
    isAuthenticated,
    friendsList,
    currentChatUser,
    currentChatMessages,
    currentUserId,

    setUser,
    setIsAuthenticated,
    getFriend,
    fetchChatList,
    setCurrentChatUser,
    openConversation,
    clearConversation,
    incomingMessage,
    outgoingMessage,
    updateUserOnlineStatus,
  };
});
