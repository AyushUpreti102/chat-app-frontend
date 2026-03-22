<template>
  <div class="row no-wrap full-height">
    <!-- Left: User contacts -->
    <div class="col-3 bg-grey-2">
      <UserContactList @select-user="selectUser" />
    </div>

    <!-- Right: Chats -->
    <div class="col-9">
      <div v-if="!$route.params.userId" class="flex flex-center text-grey">
        Select a user to start chatting
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import UserContactList from "src/components/UserContactList.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function selectUser(user) {
  router.push({ name: "userChat", params: { userId: user._id } });
}
</script>
