<template>
  <div class="sidebar-list">
    <q-item
      v-for="{ user, ...userObj } in userStore.friendsList"
      :key="user._id"
      clickable
      @click="openChat(user._id)"
      class="chat-item"
      :class="{ active: route.params.userId === user._id }"
    >
      <q-item-section avatar>
        <q-avatar class="avatar">
          {{ user.username.charAt(0).toUpperCase() }}
        </q-avatar>
      </q-item-section>

      <q-item-section class="content">
        <q-item-label class="username ellipsis">
          {{ user.username }}
        </q-item-label>

        <q-item-label caption class="message ellipsis">
          {{ userObj.lastMessage || "No messages yet" }}
        </q-item-label>
      </q-item-section>

      <q-item-section side top class="meta">
        <q-item-label caption class="time">
          {{ formatTime(userObj.lastMessageTime) }}
        </q-item-label>

        <q-badge v-if="userObj.unreadCount > 0" class="unread-badge">
          {{ userObj.unreadCount }}
        </q-badge>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const openChat = async (userId) => {
  await userStore.openConversation(userId);

  router.push({
    name: "userChat",
    params: { userId },
  });
};

const formatTime = (val) => {
  if (!val) return "";
  return new Date(val).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.sidebar-list {
  padding: 8px;
}

.chat-item {
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 6px;
  transition: 0.2s;
}

.chat-item:hover {
  background: #f4f5fb;
}

.chat-item.active {
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
  font-size: 12px;
  color: #6b7280;
}

.meta {
  align-items: flex-end;
}

.time {
  font-size: 11px;
  color: #9ca3af;
}

.unread-badge {
  margin-top: 4px;
  background: #6c63ff;
  color: white;
  font-size: 10px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
