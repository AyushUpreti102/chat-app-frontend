<template>
  <div class="chat-layout">

    <!-- 💻 DESKTOP VIEW -->
    <div v-if="$q.screen.gt.sm" class="row no-wrap full-height">

      <!-- Left Sidebar -->
      <div class="col-3 sidebar">
        <UserFriendsList @select-user="selectUser" />
      </div>

      <!-- Right Chat -->
      <div class="col-9 chat-area">
        <div v-if="!$route.params.userId" class="flex flex-center text-grey q-mt-md">
          Select a user to start chatting 💬
        </div>
        <RouterView />
      </div>

    </div>

    <!-- 📱 MOBILE VIEW -->
    <div v-else class="mobile-container">

      <UserFriendsList v-if="!$route.params.userId" @select-user="selectUser" />
      <div class="full-height" v-else>
        <RouterView />
      </div>

    </div>

  </div>
</template>

<script setup>
import UserFriendsList from "src/components/UserFriendsList.vue";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";
import { nextTick, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const webSdkStore = useWebSdkStore()
const userStore = useUserStore()

const scrollChatContainerToBottom = async () => {
  await nextTick()
  const bottomEl = document.getElementById("chatContainerBottom")
  if (bottomEl) bottomEl.scrollIntoView({ behavior: 'smooth' })
}

function selectUser(user) {
  userStore.setCurrentChatUser(user)
  router.push({ name: "userChat", params: { userId: user._id } });
}

watch(() => webSdkStore.eventDetails, (data) => {
  if (!data) return;

  const isMe =
    data.from === userStore.getCurrentLoggedUserId;

  const otherUserId = isMe ? data.to : data.from;

  const isCurrentChat =
    userStore.currentChatUser &&
    userStore.currentChatUser._id === otherUserId;

  if (isCurrentChat) {
    userStore.addMessageToCurrentChat({
      isSender: isMe,
      text: data.text,
    });

    scrollChatContainerToBottom();
  }

  userStore.updateFriendLastMessage({
    userId: otherUserId,
    text: data.text,
    isSender: isMe,
  });
});

onMounted(() => {
  webSdkStore.initiateWebSocket(userStore.getCurrentLoggedUserId)
})
</script>

<style scoped>
.chat-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.chat-layout {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.row.no-wrap {
  min-width: 0;
}

/* Sidebar */
.sidebar {
  min-width: 0;
  overflow: hidden;

  border-right: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.chat-area {
  min-width: 0;
  overflow: hidden;

  background: #f9fafb;
}

.mobile-container {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-container>* {
  min-width: 0;
  overflow: auto;
}
</style>
