<template>
  <div class="user-list full-height">
    <q-list bordered separator>
      <q-item
        v-for="user in usersContacts"
        :key="user._id"
        clickable
        @click="$emit('select-user', user)"
      >
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
import { getUserFriends } from "src/services/user";
import { ref, onMounted } from "vue";

const usersContacts = ref([]);

const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getUserContacts = async () => {
  let currentUser = localStorage.getItem("user");
  if (currentUser) {
    currentUser = JSON.parse(currentUser);
    const res = await getUserFriends(currentUser._id);
    usersContacts.value = res.friends;
  }
};

onMounted(() => {
  getUserContacts();
});
</script>

<style scoped>
.user-list {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}
</style>
