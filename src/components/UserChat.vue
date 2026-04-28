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
        <message-bubble
          :msg="msg"
          :isImage="isImage"
          :downloadFile="downloadFile"
        />
      </div>

      <!-- Typing -->
      <div v-if="isTyping" class="message-row received">
        <div class="message-bubble typing-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <div ref="bottomRef" />
    </div>

    <!-- Input -->
    <div class="chat-input">
      <!-- Hidden file input -->
      <input
        type="file"
        ref="fileInput"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />

      <div class="input-container">
        <!-- 📎 FILE / IMAGE PREVIEW -->
        <div v-if="selectedFiles.length" class="message-bubble">
          <!-- IMAGE GROUP -->
          <div class="image-group">
            <div v-for="(file, index) in selectedFiles" :key="index">
              <template v-if="file.type.startsWith('image/')">
                <div class="image-wrapper">
                  <img :src="file.preview" class="chat-image" />

                  <q-linear-progress
                    v-if="
                      uploadProgress[index] &&
                      uploadProgress[index].progress < 100
                    "
                    :value="uploadProgress[index].progress / 100"
                    size="3px"
                    class="upload-bar"
                  />

                  <q-btn
                    icon="close"
                    flat
                    dense
                    round
                    size="sm"
                    class="download-btn"
                    @click="removeFile(index)"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- FILE GROUP -->
          <div class="file-group">
            <template
              v-for="(file, index) in selectedFiles"
              :key="'file-' + index"
            >
              <div v-if="!file.type.startsWith('image/')" class="file-item">
                📎
                <span class="file-name ellipsis">{{ file.name }}</span>

                <q-linear-progress
                  v-if="
                    uploadProgress[index] &&
                    uploadProgress[index].progress < 100
                  "
                  :value="uploadProgress[index].progress / 100"
                  size="3px"
                  class="upload-bar"
                />

                <q-btn
                  icon="close"
                  flat
                  dense
                  round
                  size="sm"
                  @click="removeFile(index)"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- TEXT INPUT -->
        <q-input
          v-model="message"
          dense
          borderless
          class="input-box"
          placeholder="Type message..."
          :disabled="!isSendingInProgress"
          @keyup.enter="sendMessage"
          @update:model-value="onTyping"
        />
      </div>

      <!-- Attach -->
      <q-btn icon="attach_file" flat round @click="triggerFile" />

      <!-- Send -->
      <q-btn icon="send" color="primary" round @click="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";
import { uploadMultipleFiles } from "src/services/chat";
import MessageBubble from "./MessageBubble.vue";

let scrollTimeout;

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const webSdkStore = useWebSdkStore();

const message = ref("");
const bottomRef = ref(null);
const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadProgress = ref([]);
const isSendingInProgress = ref(false);

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

watch([messages, isTyping], scrollBottom, { deep: true, immediate: true });

function isImage(fileName = "") {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
}

function triggerFile() {
  fileInput.value.click();
}

function removeFile(index) {
  const file = selectedFiles.value[index];

  if (file?.preview) {
    URL.revokeObjectURL(file.preview);
  }

  selectedFiles.value.splice(index, 1);
  uploadProgress.value.splice(index, 1);
}

async function downloadFile(file) {
  try {
    const response = await fetch(file.fileUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName || "file";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed", err);
  }
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  const maxFiles = 5;

  const newFiles = files
    .slice(0, maxFiles - selectedFiles.value.length)
    .map((file) => ({
      raw: file,
      name: file.name,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));

  selectedFiles.value.push(...newFiles);

  // ✅ initialize progress properly
  uploadProgress.value.push(...newFiles.map(() => ({ progress: 0 })));

  // ✅ reset input (important)
  event.target.value = "";
}

function onTyping() {
  if (!selectedUser.value) return;
  webSdkStore.sendTyping(selectedUser.value.user._id);
}

async function sendMessage() {
  isSendingInProgress.value = true;
  if (!selectedUser.value) return;

  const text = message.value.trim();
  const to = selectedUser.value.user._id;

  let uploadedFiles = [];

  if (selectedFiles.value.length) {
    try {
      const results = await uploadMultipleFiles(
        selectedFiles.value,
        (index, progress) => {
          if (uploadProgress.value[index]) {
            uploadProgress.value[index].progress = progress;
          }
        },
      );

      uploadedFiles = results.map((res, i) => ({
        fileUrl: res.url,
        fileName: selectedFiles.value[i].name,
      }));
    } catch (err) {
      console.error("Upload failed", err);
      return;
    }
  }

  if (!text && uploadedFiles.length === 0) return;

  const payload = {
    to,
    text: text || null,
    files: uploadedFiles,
  };

  webSdkStore.send({
    type: "message",
    data: payload,
  });

  userStore.outgoingMessage({
    receiver: to,
    text: payload.text,
    files: payload.files,
    createdAt: new Date(),
  });

  // ✅ cleanup previews (IMPORTANT)
  selectedFiles.value.forEach((file) => {
    if (file.preview) URL.revokeObjectURL(file.preview);
  });

  // reset
  message.value = "";
  selectedFiles.value = [];
  uploadProgress.value = [];
  isSendingInProgress.value = false;
}

async function scrollBottom() {
  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(async () => {
    await nextTick();
    bottomRef.value?.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

function back() {
  userStore.clearConversation();
  router.push({ name: "chat" });
}

onBeforeUnmount(() => {
  selectedFiles.value.forEach((file) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
});
</script>

<style scoped>
/* WRAPPER */
.chat-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 12px;
  background: white;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0; /* 🔥 for ellipsis */
}

.header-avatar {
  background: #6c63ff;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.username {
  font-weight: 600;
}

.status {
  font-size: 12px;
  color: #6b7280;
}

/* MESSAGES */
.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* MESSAGE ROW */
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

/* BUBBLE CONTAINER ONLY */
.message-bubble {
  display: flex;
  max-width: 70%;
  border-radius: 16px;
  padding: 10px 14px;
}

.message-bubble.typing-bubble {
  height: 40px;
  gap: 4px;
  align-items: center;
}

/* COLORS */
.sent .message-bubble {
  background: #6c63ff;
  color: white;
}

.received .message-bubble {
  background: white;
  color: #111827;
}

.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  padding: 10px;
  background: white;
  border-top: 1px solid #eee;
}

/* INPUT CONTAINER */
.input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  background: #f5f5f5;
  border-radius: 14px;
  padding: 8px;
}

/* IMAGE GROUP */
.image-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* IMAGE WRAPPER */
.image-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  width: 70px;
  height: 70px;
}

/* IMAGE */
.chat-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* PROGRESS BAR */
.upload-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

/* CLOSE BUTTON */
.download-btn {
  position: absolute;
  top: 4px;
  right: 4px;

  background: rgba(0, 0, 0, 0.5);
  color: white;
}

/* FILE GROUP */
.file-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* FILE ITEM */
.file-item {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px 10px;
  border-radius: 10px;

  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
}

/* FILE NAME */
.file-name {
  flex: 1;
}

/* TEXT INPUT */
.input-box {
  font-size: 14px;
}

/* ELLIPSIS */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dot {
  width: 6px;
  height: 6px;
  background: #555;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
