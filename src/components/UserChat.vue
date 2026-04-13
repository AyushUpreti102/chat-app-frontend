<template>
  <div class="chat-wrapper">

    <div class="chat-container">

      <div class="chat-header">

        <!-- LEFT -->
        <div class="header-left">

          <!-- Mobile back -->
          <q-btn v-if="!$q.screen.gt.sm" flat round dense icon="arrow_back" @click="onBackButtonClick" />

          <!-- Avatar -->
          <q-avatar class="header-avatar">
            {{ selectedUser?.username?.charAt(0).toUpperCase() }}
          </q-avatar>

          <!-- Name + Status -->
          <div class="user-info">
            <div class="username ellipsis">
              {{ selectedUser?.username || "User" }}
            </div>

            <div class="status">
              {{ selectedUser?.isOnline ? "Online" : "Last seen recently" }}
            </div>
          </div>

        </div>

        <!-- RIGHT ACTIONS -->
        <div class="header-actions">
          <q-btn flat round icon="call" />
          <q-btn flat round icon="videocam" />
          <q-btn flat round icon="more_vert" />
        </div>

      </div>

      <div class="chat-messages">

        <div v-if="!messages.length" class="empty-state">
          <div class="text-grey-5">
            Start a conversation 💬
          </div>
        </div>

        <!-- MESSAGES -->
        <template v-else>
          <div v-for="(msg, i) in messages" :key="i" class="message-row" :class="msg.isSender ? 'sent' : 'received'">
            <div class="message-bubble">
              {{ msg.text }}
            </div>
          </div>

          <div ref="bottomRef" />
        </template>

      </div>

      <!-- INPUT -->
      <div class="chat-input">
        <q-input v-model="message" placeholder="Type a message..." dense borderless class="input-box"
          @keyup.enter="sendMessage" />

        <q-btn round icon="send" color="primary" class="send-btn" @click="sendMessage" />
      </div>

    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getChatHistory } from "src/services/chat";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore()
const webSdkStore = useWebSdkStore()

const bottomRef = ref(null)
const message = ref("");

const currentChatUserId = computed(() => route.params.userId);
const messages = computed(() => userStore.currentChatMessages)
const selectedUser = computed(() => userStore.currentChatUser);

const setCurrentChatMessages = (val) => userStore.setCurrentChatMessages(val)

// Load history when switching user
const loadChatHistory = async () => {
  if (userStore.getCurrentLoggedUserId && currentChatUserId.value) {
    setCurrentChatMessages([]); // clear before reload
    const history = await getChatHistory(
      currentChatUserId.value,
    );
    const oldMessages = history.map((msg) => ({
      isSender: msg.from === userStore.getCurrentLoggedUserId,
      text: msg.text,
    }));
    setCurrentChatMessages(oldMessages)
  }
};

function sendMessage() {
  if (message.value.trim()) {
    const payload = {
      to: currentChatUserId.value,
      text: message.value,
    };
    // Add locally
    userStore.addMessageToCurrentChat({ isSender: true, text: message.value })
    webSdkStore.sendMessage(payload)
    message.value = "";
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const onBackButtonClick = () => {
  router.push({ name: "chat" });
  userStore.setCurrentChatUser(null);
};

onMounted(async () => {
  await loadChatHistory();
  scrollToBottom()
});

watch(
  () => route.params.userId,
  async () => {
    await loadChatHistory();
    scrollToBottom()
  },
);
</script>

<style scoped>
/* HEADER */
.chat-header {
  flex: 0 0 auto;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 12px;

  background: white;
  border-bottom: 1px solid #eee;
}

/* LEFT SECTION */
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;

  min-width: 0;
  /* 🔥 required for ellipsis */
}

/* AVATAR */
.header-avatar {
  background: #6c63ff;
  color: white;
  font-weight: bold;
}

/* USER INFO */
.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* USERNAME */
.username {
  font-weight: 600;
  font-size: 14px;
}

/* STATUS */
.status {
  font-size: 12px;
  color: #6b7280;
}

/* ACTIONS */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ELLIPSIS */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-wrapper {
  height: 100%;
  display: flex;
  min-width: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  background: #f5f7fb;
}

.chat-messages {
  flex: 1;
  /* 🔥 THIS FIXES YOUR ISSUE */
  overflow-y: auto;
  overflow-x: hidden;

  padding: 16px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-row {
  display: flex;
  margin-bottom: 10px;
}

.sent {
  justify-content: flex-end;
}

.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;

  word-break: break-word;
}

.sent .message-bubble {
  background: #6c63ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.received .message-bubble {
  background: white;
  color: #111827;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 10px 12px;
  background: white;
  border-top: 1px solid #eee;
}

/* INPUT BOX */
.input-box {
  flex: 1;
  min-width: 0;
  background: #f1f3f8;
  border-radius: 20px;
  padding: 0 10px;
}

.send-btn {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
}
</style>
