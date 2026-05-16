<template>
  <div class="chat-layout" v-if="!isSetupInProgress">
    <!-- Desktop -->
    <div v-if="$q.screen.gt.sm" class="row no-wrap full-height">
      <div class="col-3 sidebar">
        <UserFriendsList />
      </div>

      <div class="col-9 chat-area">
        <div
          v-if="!$route.params.userId"
          class="flex flex-center text-grey full-height"
        >
          Select a user to start chatting 💬
        </div>

        <RouterView />
      </div>
    </div>

    <!-- Mobile -->
    <div v-else class="mobile-container">
      <UserFriendsList v-if="!$route.params.userId" />
      <RouterView v-else />
    </div>
    <incoming-call />
    <active-call v-if="webSdkStore.activeCall" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import UserFriendsList from "src/components/UserFriendsList.vue";
import IncomingCall from "src/components/IncomingCall.vue";
import ActiveCall from "src/components/ActiveCall.vue";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";
import { useRoute } from "vue-router";
import { registerSignaling, serializeIceCandidate } from "src/utils/webRtc";

const route = useRoute();

const userStore = useUserStore();
const webSdkStore = useWebSdkStore();

const isSetupInProgress = ref(false);

onMounted(async () => {
  isSetupInProgress.value = true;
  await userStore.fetchChatList();
  if (route.params.userId) {
    await userStore.openConversation(route.params.userId);
  }
  webSdkStore.connect(userStore.currentUserId);

  registerSignaling({
    sendIceCandidate: (candidate) => {
      const peerId = webSdkStore.callPeerId;

      if (!peerId) return;

      webSdkStore.sendIceCandidate(
        peerId,
        serializeIceCandidate(candidate),
      );
    },
    sendOffer: (offer, isVideo) => {
      const peerId = webSdkStore.callPeerId;

      if (peerId) webSdkStore.sendCallOffer(peerId, offer, isVideo);
    },
  });

  isSetupInProgress.value = false;
});
</script>

<style scoped>
.chat-layout {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.row.no-wrap {
  height: 100%;
}

/* Sidebar */
.sidebar {
  border-right: 1px solid #eee;
  background: #fff;
  overflow-y: auto;
}

/* Chat Area */
.chat-area {
  background: #f5f7fb;
  overflow: hidden;
}

/* Mobile */
.mobile-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
