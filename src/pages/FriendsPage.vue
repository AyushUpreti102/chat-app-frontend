<template>
  <div class="friends-page q-pa-md">

    <div class="row q-col-gutter-md">

      <!-- ✅ Friends List -->
      <div class="col-12 col-md-6">
        <q-card class="glass-card">

          <q-card-section class="row items-center">
            <q-icon name="group" class="q-mr-sm" />
            <div class="text-h6">Your Friends</div>
          </q-card-section>

          <q-separator />

          <q-list v-if="friends.length" separator>

            <q-item v-for="friend in friends" :key="friend._id" class="friend-item">
              <!-- Avatar -->
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ friend.username.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>

              <!-- Info -->
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ friend.username }}
                </q-item-label>
                <q-item-label caption>
                  {{ friend.email }}
                </q-item-label>
              </q-item-section>

              <!-- Action -->
              <q-item-section side>
                <q-btn flat round icon="person_remove" color="negative" @click="handleRemove(friend._id)">
                  <q-tooltip>Remove Friend</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>

          </q-list>

          <!-- Empty State -->
          <div v-else class="text-center q-pa-md text-grey">
            No friends yet 😔
          </div>

        </q-card>
      </div>

      <!-- ✅ Suggestions -->
      <div class="col-12 col-md-6">
        <q-card class="glass-card">

          <q-card-section class="row items-center">
            <q-icon name="person_add" class="q-mr-sm" />
            <div class="text-h6">Suggestions</div>
          </q-card-section>

          <q-separator />

          <q-list v-if="suggestions.length" separator>

            <q-item v-for="user in suggestions" :key="user._id" class="friend-item">
              <!-- Avatar -->
              <q-item-section avatar>
                <q-avatar color="secondary" text-color="white">
                  {{ user.username.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>

              <!-- Info -->
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ user.username }}
                </q-item-label>
                <q-item-label caption>
                  {{ user.email }}
                </q-item-label>
              </q-item-section>

              <!-- Action -->
              <q-item-section side>
                <q-btn flat round icon="person_add" color="primary" @click="handleAdd(user._id)">
                  <q-tooltip>Add Friend</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>

          </q-list>

          <!-- Empty State -->
          <div v-else class="text-center q-pa-md text-grey">
            No suggestions available 🤔
          </div>

        </q-card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getUserFriends,
  getSuggestions,
  addFriend,
  removeFriend,
} from "src/services/user";

const friends = ref([]);
const suggestions = ref([]);

const loadData = async () => {
  const friendsRes = await getUserFriends();
  const suggestionsRes = await getSuggestions();

  friends.value = friendsRes.friends;
  suggestions.value = suggestionsRes.suggestions;
};

const handleAdd = async (friendId) => {
  await addFriend(friendId);
  await loadData();
};

const handleRemove = async (friendId) => {
  await removeFriend(friendId);
  await loadData();
};

onMounted(loadData);
</script>

<style scoped>
.friends-page {
  min-height: 100%;
}

/* Glass card */
.glass-card {
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

/* Friend item hover */
.friend-item {
  transition: all 0.2s ease;
}

.friend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>