<template>
  <div class="user-list full-height">
    <q-list bordered separator>
      <q-item v-for="user in userFriends" :key="user._id" clickable @click="$emit('select-user', user)">
        <q-item-section>
          <q-item-label>{{ user.username }}</q-item-label>
          <q-item-label caption>
            {{ user.lastMessage || "No messages yet" }}
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>
            {{ formatTime(user.lastMessageTime) }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { useUserStore } from "src/stores/userStore";
import { onMounted, computed } from "vue";

const userStore = useUserStore()
const userFriends = computed(() => userStore.friendsList)

const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

onMounted(() => {
  userStore.getUserFriendsList();
});
</script>

<style scoped>
.user-list {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}
</style>
