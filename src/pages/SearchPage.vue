<template>
  <div class="search-page">
    <div class="search-inner">
      <div class="search-head">
        <div class="text-h6 text-weight-bold text-grey-9">Find people</div>
        <div class="text-body2 text-grey-6 q-mt-xs">
          Search by username, then open a chat.
        </div>
      </div>

      <q-input
        v-model="query"
        outlined
        dense
        clearable
        debounce="400"
        placeholder="Username…"
        class="search-field q-mt-md"
        :loading="loading"
        @update:model-value="onQueryUpdate"
      >
        <template #prepend>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>

      <q-linear-progress
        v-if="loading && trimmedQuery.length >= 2"
        indeterminate
        color="primary"
        rounded
        class="q-mt-sm"
        size="2px"
      />

      <div v-if="hint" class="hint text-body2 text-grey-6 q-mt-xl text-center">
        {{ hint }}
      </div>

      <q-list v-else-if="results.length" separator class="result-list q-mt-md">
        <q-item
          v-for="u in results"
          :key="u._id"
          class="result-item"
          clickable
          :disable="openingId === u._id"
          @click="openChatWithUser(u._id)"
        >
          <q-item-section avatar>
            <q-avatar class="avatar">
              {{ initialFor(u.username) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="username ellipsis">{{ u.username }}</q-item-label>
            <q-item-label v-if="u.email" caption class="ellipsis text-grey-6">
              {{ u.email }}
            </q-item-label>
            <q-item-label v-else caption class="text-grey-6">
              {{ isExistingChat(u._id) ? "In your chats" : "Tap to start chatting" }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-spinner v-if="openingId === u._id" color="primary" size="1.4em" />
            <q-icon v-else name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/userStore";
import { searchUsers, startConversationWithUser } from "src/services/user";
import { useToast } from "src/composables/useToast";

const router = useRouter();
const userStore = useUserStore();
const { toastError } = useToast();

const query = ref("");
const results = ref([]);
const loading = ref(false);
const openingId = ref(null);

const trimmedQuery = computed(() => query.value.trim());

function initialFor(username) {
  return username ? String(username).charAt(0).toUpperCase() : "?";
}

function isExistingChat(userId) {
  return Boolean(userStore.getFriend(userId));
}

async function onQueryUpdate() {
  const q = trimmedQuery.value;
  if (q.length < 2) {
    results.value = [];
    return;
  }

  loading.value = true;
  try {
    const list = await searchUsers(q);
    const self = userStore.currentUserId;
    results.value = (list || []).filter((u) => u && u._id && String(u._id) !== String(self));
  } catch (err) {
    results.value = [];
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Search failed. Try again.";
    toastError(msg);
  } finally {
    loading.value = false;
  }
}

const hint = computed(() => {
  if (trimmedQuery.value.length === 0) {
    return "Search for someone by username (at least 2 characters).";
  }
  if (trimmedQuery.value.length === 1) {
    return "Enter at least one more character.";
  }
  if (loading.value) {
    return null;
  }
  if (results.value.length === 0) {
    return "No users match your search.";
  }
  return null;
});

async function openChatWithUser(userId) {
  if (openingId.value) return;
  openingId.value = userId;
  try {
    if (!userStore.getFriend(userId)) {
      await startConversationWithUser(userId);
      await userStore.fetchChatList();
      if (!userStore.getFriend(userId)) {
        toastError("Chat could not be started. Try again later.");
        return;
      }
    }
    await userStore.openConversation(userId);
    await router.push({ name: "userChat", params: { userId } });
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Could not open chat.";
    toastError(msg);
  } finally {
    openingId.value = null;
  }
}
</script>

<style scoped>
.search-page {
  height: 100%;
  min-height: 100%;
  background: #f5f7fb;
  overflow: auto;
}

.search-inner {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 16px 32px;
}

.search-field {
  border-radius: 12px;
}

.search-field :deep(.q-field__control) {
  border-radius: 12px;
  background: #fff;
}

.result-list {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
  padding: 4px 0;
}

.result-item {
  border-radius: 12px;
  margin: 4px 8px;
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 56px;
}

.result-item:hover {
  background: #f4f5fb;
}

.avatar {
  background: #6c63ff;
  color: #fff;
  font-weight: 700;
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hint {
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.45;
}
</style>
