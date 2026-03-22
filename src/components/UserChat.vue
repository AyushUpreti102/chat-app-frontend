<template>
  <div class="column full-height">
    <div class="chat-container column full-height">
      <!-- Chat messages -->
      <div class="chat-messages col scroll">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="msg.isSender ? 'text-right' : 'text-left'"
        >
          <q-chip
            :color="msg.isSender ? 'green-3' : 'blue-3'"
            text-color="black"
          >
            {{ msg.text }}
          </q-chip>
        </div>
      </div>

      <!-- Separator -->
      <q-separator />

      <!-- Input -->
      <div class="chat-input row items-center q-pa-sm">
        <q-input
          filled
          v-model="message"
          label="Type a message..."
          @keyup.enter="sendMessage"
          class="col"
        />
        <q-btn flat label="Send" color="primary" @click="sendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createWebSocket } from "src/utils/webSocket";
import { useRoute } from "vue-router";
import { getChatHistory } from "src/services/chat";

const route = useRoute();

const message = ref("");
const messages = ref([]);

const ws = ref(null);
const currentChatUserId = computed(() => route.params.userId);

const localStorageData = localStorage.getItem("user");
const currentLoggedUser = localStorageData
  ? JSON.parse(localStorageData)
  : null;

const initiateWebSocket = () => {
  if (currentLoggedUser) {
    ws.value = createWebSocket(currentLoggedUser._id);

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messages.value.push({
        isSender: data.from === currentLoggedUser._id,
        text: data.text,
      });
    };

    ws.value.onopen = () => console.log("✅ Connected to WebSocket");
    ws.value.onclose = () => console.log("❌ Disconnected");
  }
};

// Load history when switching user
const loadChatHistory = async () => {
  if (currentLoggedUser && currentChatUserId.value) {
    messages.value = []; // clear before reload
    const history = await getChatHistory(
      currentLoggedUser._id,
      currentChatUserId.value
    );
    messages.value = history.map((msg) => ({
      isSender: msg.from === currentLoggedUser._id,
      text: msg.text,
    }));
  }
};

function sendMessage() {
  if (message.value.trim() && ws.value?.readyState === WebSocket.OPEN) {
    const payload = {
      to: currentChatUserId.value,
      text: message.value,
    };

    // show locally first
    messages.value.push({ isSender: true, text: message.value });

    ws.value.send(JSON.stringify(payload));
    message.value = "";
  }
}

onMounted(async () => {
  initiateWebSocket();
  await loadChatHistory();
});

watch(
  () => route.params.userId,
  async () => {
    initiateWebSocket();
    await loadChatHistory();
  }
);

onBeforeUnmount(() => {
  if (ws.value) ws.value.close();
});
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
</style>
