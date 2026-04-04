<template>
  <div class="app column">
    <div class="app-header row items-center q-pa-sm">
      <div class="text-h6">Chat App</div>
      <q-space />
      <div v-if="isAuthenticated">
        <router-link to="/friends">
          <q-btn>Manage friends</q-btn>
        </router-link>
        <q-btn @click="logout">Logout</q-btn>
      </div>
    </div>

    <!-- This fills the remaining space under the header -->
    <div class="app-body col">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { logout } from "src/services/auth";
import { useUserStore } from "src/stores/userStore";
import { computed } from "vue";

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
</script>

<style>
.app {
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.app-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* critical */
</style>
