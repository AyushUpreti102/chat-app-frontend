<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- ✅ Friends List -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Your Friends</div>
          </q-card-section>

          <q-list bordered separator>
            <q-item v-for="friend in friends" :key="friend._id">
              <q-item-section>
                <q-item-label>{{ friend.username }}</q-item-label>
                <q-item-label caption>{{ friend.email }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn color="negative" label="Remove" size="sm" @click="handleRemove(friend._id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- ✅ Suggestions -->
      <div class="col-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Suggestions</div>
          </q-card-section>

          <q-list bordered separator>
            <q-item v-for="user in suggestions" :key="user._id">
              <q-item-section>
                <q-item-label>{{ user.username }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn color="primary" label="Add" size="sm" @click="handleAdd(user._id)" />
              </q-item-section>
            </q-item>
          </q-list>
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
