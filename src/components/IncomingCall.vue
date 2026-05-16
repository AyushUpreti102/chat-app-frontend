<template>
  <div v-if="call" class="incoming-call">
    <div class="call-card">
      <div class="caller-avatar">
        {{ callerInitial }}
      </div>

      <div class="call-info">
        <div class="name">{{ callerName }}</div>
        <div class="type">
          Incoming {{ call.isVideo ? "Video" : "Audio" }} Call...
        </div>
      </div>

      <div class="actions">
        <q-btn round color="red" icon="call_end" @click="rejectCall" />

        <q-btn
          round
          color="green"
          :icon="call.isVideo ? 'videocam' : 'call'"
          @click="acceptCallHandler"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useWebSdkStore } from "src/stores/webSdkStore";
import { acceptCall } from "src/utils/webRtc";

const webSdkStore = useWebSdkStore();

const call = computed(() => webSdkStore.incomingCall);

const callerName = computed(() => call.value?.name);
const callerInitial = computed(() =>
  callerName.value?.charAt(0)?.toUpperCase() ?? "?",
);

let audio = new Audio("/ringtone.mp3");

watch(call, (val) => {
  if (val) {
    audio.loop = true;
    audio.play().catch(() => {});
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
});

const acceptCallHandler = async () => {
  if (!call.value) return;

  const { offer, isVideo, from, name } = call.value;

  webSdkStore.setCallPeer(from);

  webSdkStore.$patch({
    activeCall: {
      isVideo,
      started: true,
      status: "connecting",
      userId: from,
      name,
    },
  });

  const answer = await acceptCall({
    offer,
    isVideo,

    onLocalStream: (stream, mediaState) => {
      webSdkStore.$patch({
        localStream: stream,

        isVideoCall: mediaState.isVideoCall,
        isCameraEnabled: mediaState.isCameraEnabled,
      });
    },

    onRemoteStream: (stream) => {
      webSdkStore.$patch({ remoteStream: stream });
      webSdkStore.markCallConnected();
    },
  });

  if (answer) {
    webSdkStore.sendCallAnswer(from, answer);
  }

  webSdkStore.$patch({
    incomingCall: null,
  });
};

const rejectCall = () => {
  if (!call.value) return;

  webSdkStore.hangUp(call.value.from);
};
</script>

<style scoped>
.incoming-call {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.call-card {
  width: 260px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.caller-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #6c63ff;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.call-info .name {
  font-weight: 600;
}

.call-info .type {
  font-size: 12px;
  color: #666;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>
