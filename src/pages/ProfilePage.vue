<template>
  <div class="profile-page">
    <div class="profile-inner">
      <q-card class="profile-card" flat>
        <q-card-section class="text-center q-pt-lg q-pb-md">
          <q-avatar size="88px" class="avatar">
            {{ userInitial }}
          </q-avatar>

          <div class="text-h6 text-weight-bold q-mt-md text-grey-9">
            {{ user?.username ?? "User" }}
          </div>

          <div v-if="user?.email" class="text-body2 text-grey-7 q-mt-xs">
            {{ user.email }}
          </div>
          <div v-else class="text-caption text-grey-6 q-mt-xs">
            Your account
          </div>
        </q-card-section>

        <q-separator class="q-mx-none" />

        <q-card-actions class="q-pa-md">
          <q-btn
            outline
            color="negative"
            icon="logout"
            label="Log out"
            class="full-width logout-btn"
            :loading="loggingOut"
            @click="handleLogout"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { logout } from "src/services/auth";
import { useUserStore } from "src/stores/userStore";
import { useToast } from "src/composables/useToast";

const userStore = useUserStore();
const { toastSuccess } = useToast();

const user = computed(() => userStore.user);

const userInitial = computed(() =>
  user.value?.username ? user.value.username.charAt(0).toUpperCase() : "U",
);

const loggingOut = ref(false);

async function handleLogout() {
  loggingOut.value = true;
  try {
    await logout();
    toastSuccess("You've been logged out");
    new Promise((r) => setTimeout(r, 1000)).then(() => {
      location.reload();
    });
  } catch (err) {
    console.error(err);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  height: 100%;
  min-height: 100%;
  background: #f5f7fb;
  overflow: auto;
}

.profile-inner {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px 16px 32px;
}

.profile-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

.avatar {
  background: #6c63ff;
  color: #fff;
  font-weight: 700;
  font-size: 2rem;
}

.logout-btn {
  border-radius: 10px;
  font-weight: 600;
  min-height: 44px;
}
</style>
