<template>
  <div>
    <router-view />
    <incoming-call />
    <audio id="remoteAudio" autoplay playsinline></audio>
  </div>
</template>

<script setup>
import IncomingCall from "./components/IncomingCall.vue";
</script>
