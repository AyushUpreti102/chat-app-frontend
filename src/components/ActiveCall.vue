<template>
  <div class="active-call">
    <!-- REMOTE VIDEO -->
    <div class="remote-video-wrapper">
      <video ref="remoteVideo" autoplay playsinline class="remote-video" />

      <!-- FALLBACK -->
      <div v-if="!hasRemoteVideo" class="call-placeholder">
        <q-avatar size="90px" class="placeholder-avatar">
          {{ webSdkStore.activeCall?.name?.[0] || "U" }}
        </q-avatar>

        <div class="call-name">
          {{ webSdkStore.activeCall?.name || "Connecting..." }}
        </div>

        <div class="call-status">
          {{
            webSdkStore.activeCall?.status === "connected"
              ? "Connected"
              : "Connecting..."
          }}
        </div>
      </div>

      <!-- LOCAL VIDEO -->
      <div class="local-video-card" v-if="hasLocalVideo">
        <video
          ref="localVideo"
          autoplay
          muted
          playsinline
          class="local-video"
        />
      </div>
    </div>

    <!-- CONTROLS -->
    <div class="controls-wrapper">
      <div class="controls">
        <!-- MIC -->
        <q-btn
          round
          unelevated
          size="18px"
          :color="micEnabled ? 'white' : 'red'"
          :text-color="micEnabled ? 'dark' : 'white'"
          :icon="micEnabled ? 'mic' : 'mic_off'"
          @click="toggleMicHandler"
        />

        <!-- VIDEO (only after video call is active; audio-only uses "Request video") -->
        <q-btn
          v-if="isVideoCall"
          round
          unelevated
          size="18px"
          :color="isCameraEnabled ? 'white' : 'red'"
          :text-color="isCameraEnabled ? 'dark' : 'white'"
          :icon="isCameraEnabled ? 'videocam' : 'videocam_off'"
          @click="toggleVideoHandler"
        />

        <!-- REQUEST VIDEO -->
        <q-btn
          v-if="!isVideoCall"
          round
          unelevated
          size="18px"
          color="deep-purple"
          text-color="white"
          icon="video_call"
          @click="switchVideoHandler"
        />

        <!-- END -->
        <q-btn
          round
          unelevated
          size="18px"
          color="red"
          icon="call_end"
          @click="endCallHandler"
        />
      </div>
    </div>

    <!-- AUDIO -->
    <audio ref="remoteAudio" autoplay playsinline />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

import { toggleMic, toggleVideo, switchToVideo } from "src/utils/webRtc";

import { useWebSdkStore } from "src/stores/webSdkStore";

const webSdkStore = useWebSdkStore();

const micEnabled = ref(true);
const videoEnabled = ref(true);

const localVideo = ref(null);
const remoteVideo = ref(null);
const remoteAudio = ref(null);
const hasRemoteVideo = ref(false);
const hasLocalVideo = ref(false);

const localStream = computed(() => webSdkStore.localStream);
const remoteStream = computed(() => webSdkStore.remoteStream);
const isVideoCall = computed(() => webSdkStore.isVideoCall);
const isCameraEnabled = computed(() => webSdkStore.isCameraEnabled);

watch(
  localStream,
  async (stream) => {
    const hasVideo = !!stream?.getVideoTracks()?.length;
    hasLocalVideo.value = hasVideo;

    await nextTick();

    if (localVideo.value) {
      localVideo.value.srcObject = stream || null;

      localVideo.value.muted = true;

      localVideo.value.play?.().catch(() => {});
    }
  },
  { immediate: true },
);

watch(
  remoteStream,
  async (stream) => {
    await nextTick();

    if (!stream) {
      hasRemoteVideo.value = false;

      if (remoteVideo.value) remoteVideo.value.srcObject = null;
      if (remoteAudio.value) remoteAudio.value.srcObject = null;

      return;
    }

    hasRemoteVideo.value = stream.getVideoTracks().length > 0;

    if (remoteVideo.value) {
      remoteVideo.value.srcObject = stream;

      remoteVideo.value.play?.().catch(() => {});
    }

    if (remoteAudio.value) {
      remoteAudio.value.srcObject = stream;

      remoteAudio.value.play?.().catch(() => {});
    }
  },
  { immediate: true },
);

function toggleMicHandler() {
  micEnabled.value = !micEnabled.value;

  toggleMic(micEnabled.value);
}

function toggleVideoHandler() {
  const stream = localStream.value;

  if (!stream) return;

  const track = stream.getVideoTracks()[0];

  if (!track) return;

  const enabled = !track.enabled;

  toggleVideo(enabled);

  webSdkStore.$patch({ isCameraEnabled: enabled });
}

async function switchVideoHandler() {
  await switchToVideo(
    (stream) => {
      webSdkStore.$patch({
        localStream: stream,
      });
    },

    ({ isVideoCall, isCameraEnabled }) => {
      webSdkStore.$patch({
        isVideoCall,
        isCameraEnabled,
      });
    },
  );

  videoEnabled.value = true;
}

function detachMediaElements() {
  if (localVideo.value) localVideo.value.srcObject = null;
  if (remoteVideo.value) remoteVideo.value.srcObject = null;
  if (remoteAudio.value) remoteAudio.value.srcObject = null;

  hasLocalVideo.value = false;
  hasRemoteVideo.value = false;
  micEnabled.value = true;
}

function endCallHandler() {
  const peerId = webSdkStore.activeCall?.userId;

  webSdkStore.hangUp(peerId);
  detachMediaElements();
}

function handleState(event) {
  const state = event.detail;

  if (state === "connected") {
    webSdkStore.activeCall.status = "connected";
  }

  if (state === "failed" || state === "closed" || state === "disconnected") {
    endCallHandler();
  }
}

onMounted(() => {
  window.addEventListener("webrtc-state", handleState);
});

onUnmounted(() => {
  window.removeEventListener("webrtc-state", handleState);
  detachMediaElements();
});
</script>

<style scoped>
.active-call {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;

  background: #f5f5f5;

  overflow: hidden;
}

/* MAIN VIDEO AREA */
.remote-video-wrapper {
  position: relative;

  flex: 1;

  margin: 16px;
  margin-bottom: 110px;

  border-radius: 24px;

  overflow: hidden;

  background: linear-gradient(135deg, #0f172a, #111827, #172554);

  display: flex;
  align-items: center;
  justify-content: center;
}

/* REMOTE VIDEO */
.remote-video {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;
}

/* EMPTY CALL SCREEN */
.call-placeholder {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  z-index: 2;

  color: white;
}

.placeholder-avatar {
  background: #6c63ff;
  color: white;

  font-size: 34px;
  font-weight: 700;
}

.call-name {
  margin-top: 18px;

  font-size: 24px;
  font-weight: 600;
}

.call-status {
  margin-top: 8px;

  font-size: 14px;

  color: rgba(255, 255, 255, 0.7);
}

/* LOCAL VIDEO */
.local-video-card {
  position: absolute;

  top: 18px;
  right: 18px;

  width: 190px;
  height: 140px;

  border-radius: 18px;

  overflow: hidden;

  background: black;

  border: 2px solid rgba(255, 255, 255, 0.08);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);

  z-index: 5;
}

.local-video {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transform: scaleX(-1);
}

/* CONTROLS */
.controls-wrapper {
  position: absolute;

  left: 50%;
  bottom: 28px;

  transform: translateX(-50%);

  z-index: 20;
}

.controls {
  display: flex;
  align-items: center;
  gap: 18px;

  padding: 16px 24px;

  border-radius: 999px;

  background: rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(12px);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* BUTTON SIZE */
.controls :deep(.q-btn) {
  width: 58px;
  height: 58px;
}

/* MOBILE */
@media (max-width: 768px) {
  .remote-video-wrapper {
    margin: 8px;
    margin-bottom: 100px;

    border-radius: 18px;
  }

  .local-video-card {
    width: 120px;
    height: 170px;

    right: 12px;
    top: 12px;
  }

  .controls {
    gap: 12px;

    padding: 12px 18px;
  }

  .controls :deep(.q-btn) {
    width: 52px;
    height: 52px;
  }
}
</style>
