import { defineStore, acceptHMRUpdate } from "pinia";
import { getUserFriends } from "src/services/user";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    friendsList: [],
    currentChatMessages: [],
    currentChatUser: null,
  }),

  getters: {
    getCurrentLoggedUserId: (state) => state.user.id,
  },

  actions: {
    setIsAuthenticated(val) {
      this.isAuthenticated = val;
    },

    setUser(user) {
      this.user = user;
    },

    async getUserFriendsList() {
      const res = await getUserFriends();

      this.friendsList = res.friends.map((friend) => ({
        ...friend,
        unreadCount: 0,
      }));

      this.sortFriendsList();
    },

    addMessageToCurrentChat(data) {
      this.currentChatMessages.push(data);
    },

    setCurrentChatMessages(val) {
      this.currentChatMessages = val;
    },

    setCurrentChatUser(user) {
      if (user) {
        this.currentChatUser = user;

        const friend = this.friendsList.find((f) => f._id === user._id);

        if (friend) {
          friend.unreadCount = 0;
        }
      }
    },

    updateFriendLastMessage({ userId, text, isSender }) {
      const friend = this.friendsList.find((f) => f._id === userId);

      if (!friend) return;

      // Update last message
      friend.lastMessage = isSender ? `You: ${text}` : text;
      friend.lastMessageTime = new Date();

      const isCurrentChat =
        this.currentChatUser && this.currentChatUser._id === userId;

      if (!isCurrentChat && !isSender) {
        friend.unreadCount = (friend.unreadCount || 0) + 1;
      }

      this.sortFriendsList();
    },

    sortFriendsList() {
      this.friendsList.sort(
        (a, b) =>
          new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0),
      );
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
