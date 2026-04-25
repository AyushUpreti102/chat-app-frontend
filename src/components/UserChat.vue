<template>
  <div class="chat-wrapper">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-left">
        <q-btn
          v-if="!$q.screen.gt.sm"
          flat
          round
          icon="arrow_back"
          @click="back"
        />

        <q-avatar class="header-avatar">
          {{ selectedUser?.username?.charAt(0).toUpperCase() }}
        </q-avatar>

        <div class="user-info">
          <div class="username">{{ selectedUser?.username }}</div>
          <div class="status">
            {{ selectedUser?.isOnline ? "Online" : "Last seen recently" }}
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-messages">
      <div
        v-for="msg in messages"
        :key="msg._id"
        class="message-row"
        :class="msg.isSender ? 'sent' : 'received'"
      >
        <div class="message-bubble">
          {{ msg.text }}
        </div>
      </div>

      <div ref="bottomRef" />
    </div>

    <!-- Typing -->
    <div v-if="isTyping" class="typing-indicator">typing...</div>

    <!-- Input -->
    <div class="chat-input">
      <q-input
        v-model="message"
        dense
        outlined
        class="input-box"
        placeholder="Type message..."
        @keyup.enter="sendMessage"
        @update:model-value="onTyping"
      />

      <q-btn icon="send" color="primary" round @click="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const webSdkStore = useWebSdkStore();

const message = ref("");
const bottomRef = ref(null);

const selectedUser = computed(() => userStore.currentChatUser);
const messages = computed(() => userStore.currentChatMessages);

const isTyping = computed(
  () => webSdkStore.typingUser === selectedUser.value?.user._id,
);

watch(
  () => route.params.userId,
  (id) => {
    if (id) {
      userStore.openConversation(id);
    }
  },
  { immediate: true },
);

watch(messages, scrollBottom, { deep: true });

function onTyping() {
  if (!selectedUser.value) return;
  webSdkStore.sendTyping(selectedUser.value.user._id);
}

function sendMessage() {
  const text = message.value.trim();
  if (!text) return;

  const to = selectedUser.value.user._id;

  webSdkStore.send({
    type: "message",
    data: { to, text },
  });

  userStore.outgoingMessage({
    receiver: to,
    text,
    createdAt: new Date(),
  });

  message.value = "";
}

async function scrollBottom() {
  await nextTick();
  bottomRef.value?.scrollIntoView({ behavior: "smooth" });
}

function back() {
  userStore.clearConversation();
  router.push({ name: "chat" });
}
</script>

<style scoped>
.chat-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: white;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  background: #6c63ff;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
}

.status {
  font-size: 12px;
  color: #6b7280;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
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
}

.sent .message-bubble {
  background: #6c63ff;
  color: white;
}

.received .message-bubble {
  background: white;
}

/* Input */
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: white;
  border-top: 1px solid #eee;
}

.input-box {
  flex: 1;
}

/* Typing */
.typing-indicator {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 12px;
}
</style>
