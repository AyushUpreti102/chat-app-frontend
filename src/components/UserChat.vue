<template>
  <div class="column full-height">
    <div class="chat-container column full-height">
      <!-- Chat messages -->
      <div class="chat-messages col scroll">
        <div v-for="(msg, i) in messages" :key="i" :class="msg.isSender ? 'text-right' : 'text-left'">
          <q-chip :color="msg.isSender ? 'green-3' : 'blue-3'" text-color="black">
            {{ msg.text }}
          </q-chip>
        </div>
        <div id="chatContainerBottom" ref="bottomRef" />
      </div>

      <!-- Separator -->
      <q-separator />

      <!-- Input -->
      <div class="chat-input row items-center q-pa-sm">
        <q-input filled v-model="message" label="Type a message..." @keyup.enter="sendMessage" class="col" />
        <q-btn flat label="Send" color="primary" @click="sendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getChatHistory } from "src/services/chat";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";

const route = useRoute();
const userStore = useUserStore()
const webSdkStore = useWebSdkStore()

const bottomRef = ref(null)
const message = ref("");

const currentChatUserId = computed(() => route.params.userId);
const messages = computed(() => userStore.currentChatMessages)

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
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
</style>
