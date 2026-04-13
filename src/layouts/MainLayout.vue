<template>
  <div class="app">

    <div class="app-header row no-wrap items-center q-px-md q-py-sm">

      <div class="row no-wrap items-center q-gutter-sm" style="flex: 1; min-width: 0;">
        <q-avatar size="32px" class="bg-primary text-white">
          💬
        </q-avatar>

        <div class="username text-subtitle1 text-weight-bold">
          <router-link to="/chat" class="header-text">
            Chat App
          </router-link>
        </div>
      </div>

      <div v-if="isAuthenticated" class="row no-wrap items-center q-gutter-sm" style="flex: 0 0 auto;">
        <router-link to="/friends">
          <q-btn flat round icon="group" />
        </router-link>

        <q-avatar size="32px" class="bg-primary text-white">
          {{ userInitial }}
        </q-avatar>

        <q-btn flat round icon="logout" @click="logout" />
      </div>

    </div>

    <div class="app-body">
      <router-view />
    </div>

    <MobileFooter v-if="!$q.screen.gt.sm" />

  </div>
</template>

<script setup>
import { logout } from "src/services/auth";
import { useUserStore } from "src/stores/userStore";
import { computed } from "vue";
import MobileFooter from "src/components/MobileFooter.vue";

const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);

const userInitial = computed(() => {
  return userStore.user
    ? userStore.user.username.charAt(0).toUpperCase()
    : "U";
});
</script>

<style scoped>
.app {
  height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 10;

  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #4f46e5, #9333ea);
  color: white;
}

.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.app-body>* {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.username {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-text {
  text-decoration: none;
  color: white;
}

@media (min-width: 1024px) {
  .app {
    background: linear-gradient(135deg, #7db3d9, #5fa8d3);
  }

  .app-header {
    background: white;
    color: #1f2937;
    border-bottom: 1px solid #eee;
  }

  .header-text {
    color: #4f46e5;
  }
}
</style>