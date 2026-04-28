<template>
  <div class="message-bubble">
    <!-- 🖼️ IMAGES -->
    <div v-if="imageFiles.length" class="image-group">
      <div v-for="(file, i) in imageFiles" :key="i" class="image-wrapper">
        <img :src="file.fileUrl" class="chat-image" />

        <q-btn
          icon="download"
          flat
          dense
          round
          class="download-btn"
          @click="download(file)"
        />
      </div>
    </div>

    <!-- 📎 FILES -->
    <div v-if="otherFiles.length" class="file-group">
      <div
        v-for="(file, i) in otherFiles"
        :key="i"
        class="file-item"
        @click="download(file)"
      >
        <q-icon name="attach_file" />
        <span class="file-name ellipsis">{{ file.fileName }}</span>
      </div>
    </div>

    <!-- 💬 TEXT -->
    <div v-if="msg.text" class="message-text">
      {{ msg.text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  msg: Object,
  isImage: Function,
  downloadFile: Function,
});

/* Separate files */
const imageFiles = computed(
  () => props.msg.files?.filter((f) => props.isImage(f.fileName)) || [],
);

const otherFiles = computed(
  () => props.msg.files?.filter((f) => !props.isImage(f.fileName)) || [],
);

const download = (file) => {
  props.downloadFile(file);
};
</script>

<style scoped>
/* BUBBLE */
.message-bubble {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 🖼️ IMAGE GROUP */
.image-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* IMAGE WRAPPER */
.image-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  max-width: 220px;
}

/* IMAGE */
.chat-image {
  width: 100%;
  display: block;
  border-radius: 12px;
}

/* DOWNLOAD BUTTON */
.download-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;

  background: rgba(0, 0, 0, 0.5);
  color: white;
}

/* 📎 FILE GROUP */
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
  cursor: pointer;

  transition: background 0.2s;
}

.file-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* FILE NAME */
.file-name {
  font-size: 12px;
}

/* TEXT */
.message-text {
  font-size: 14px;
  line-height: 1.4;
}

/* ELLIPSIS */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
