import { defineStore, acceptHMRUpdate } from "pinia";
import { getUserFriends } from "src/services/user";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    userId: null,
    isAuthenticated: false,
    friendsList: [],
    currentChatMessages: [],
  }),
  getters: {
    getCurrentLoggedUserId: (state) => state.userId,
  },
  actions: {
    setIsAuthenticated(val) {
      this.isAuthenticated = val;
    },
    setUserId(id) {
      this.userId = id;
    },
    async getUserFriendsList() {
      const res = await getUserFriends();
      this.friendsList = res.friends;
    },
    addMessageToCurrentChat(data) {
      console.log(data);
      this.currentChatMessages.push(data);
    },
    setCurrentChatMessages(val) {
      this.currentChatMessages = val;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
