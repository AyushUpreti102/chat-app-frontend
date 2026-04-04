<template>
  <div class="row no-wrap full-height">
    <!-- Left: User contacts -->
    <div class="col-3 bg-grey-2">
      <UserFriendsList @select-user="selectUser" />
    </div>

    <!-- Right: Chats -->
    <div class="col-9">
      <div v-if="!$route.params.userId" class="flex flex-center text-grey">
        Select a user to start chatting
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import UserFriendsList from "src/components/UserFriendsList.vue";
import { useUserStore } from "src/stores/userStore";
import { useWebSdkStore } from "src/stores/webSdkStore";
import { computed, nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute()
const webSdkStore = useWebSdkStore()
const userStore = useUserStore()

const currentChatUserId = computed(() => route.params.userId);

const scrollChatContainerToBottom = async () => {
  await nextTick()
  const bottomEl = document.getElementById("chatContainerBottom")
  if (bottomEl) bottomEl.scrollIntoView({ behavior: 'smooth' })
}

watch(() => webSdkStore.eventDetails, (data) => {
  if (data) {
    userStore.getUserFriendsList()
    if (
      data.from === currentChatUserId.value ||
      data.from === userStore.getCurrentLoggedUserId
    ) {
      userStore.addMessageToCurrentChat({
        isSender: data.from === userStore.getCurrentLoggedUserId,
        text: data.text,
      })
      scrollChatContainerToBottom()
    }
  }
})

onMounted(() => {
  webSdkStore.initiateWebSocket(userStore.getCurrentLoggedUserId)
})

function selectUser(user) {
  router.push({ name: "userChat", params: { userId: user._id } });
}
</script>
