<template>
  <div class="sidebar-list">

    <q-item v-for="user in userFriends" :key="user._id" clickable @click="selectUser(user)" class="chat-item"
      :class="{ 'active-chat': $route.params.userId === user._id }">

      <!-- Avatar -->
      <q-item-section avatar>
        <q-avatar class="avatar">
          {{ user.username.charAt(0).toUpperCase() }}
        </q-avatar>
      </q-item-section>

      <!-- Name + Message -->
      <q-item-section class="content">

        <q-item-label class="username ellipsis">
          {{ user.username }}
        </q-item-label>

        <q-item-label caption class="message ellipsis" :class="{ unread: user.unreadCount > 0 }">
          {{ user.lastMessage || "No messages yet" }}
        </q-item-label>

      </q-item-section>

      <!-- Time + Badge -->
      <q-item-section side top class="meta">

        <q-item-label caption class="time">
          {{ formatTime(user.lastMessageTime) }}
        </q-item-label>

        <q-badge v-if="user.unreadCount > 0" class="unread-badge">
          {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
        </q-badge>

      </q-item-section>

    </q-item>

  </div>
</template>

<script setup>
import { useUserStore } from "src/stores/userStore";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const emits = defineEmits(["select-user"])

const route = useRoute()
const userStore = useUserStore()
const userFriends = computed(() => userStore.friendsList)

const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const selectUser = (user) => {
  emits("select-user", user)
}

const setCurrentChatUser = () => {
  const userId = route.params.userId
  if (userId) {
    const currentChatUser = userStore.friendsList.find(friend => friend?._id === userId)
    selectUser(currentChatUser)
  }
}

onMounted(async () => {
  await userStore.getUserFriendsList();
  setCurrentChatUser()
});
</script>

<style scoped>
.sidebar-list {
  padding: 8px;
}

.chat-item {
  border-radius: 14px;
  padding: 10px 8px;
  margin-bottom: 6px;

  transition: all 0.2s ease;
}

.chat-item:hover {
  background: #f4f5fb;
}

.active-chat {
  background: #eef0ff;
}

.avatar {
  background: #6c63ff;
  color: white;
  font-weight: bold;
}

.content {
  min-width: 0;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.message {
  color: #6b7280;
  font-size: 12px;
}

.message.unread {
  color: #111827;
  font-weight: 600;
}

.meta {
  flex: 0 0 auto;
  align-items: flex-end;
}

.time {
  font-size: 11px;
  color: #9ca3af;
}

.unread-badge {
  background: #6c63ff;
  color: white;
  font-size: 10px;
  margin-top: 4px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
