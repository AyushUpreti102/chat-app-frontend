<template>
  <div class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isLogin ? "Login" : "Signup" }}</div>
      </q-card-section>

      <q-form @submit="handleSubmit">
        <q-card-section>
          <!-- Username (only for signup) -->
          <q-input
            v-if="!isLogin"
            v-model="username"
            label="Username"
            filled
            class="q-mb-md"
            required
          />

          <q-input
            v-model="email"
            :label="!isLogin ? 'Email' : 'Username or email'"
            :type="!isLogin ? 'email' : 'text'"
            filled
            class="q-mb-md"
            required
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            filled
            required
          />
        </q-card-section>

        <q-card-actions class="block">
          <q-btn
            class="full-width"
            type="submit"
            :label="isLogin ? 'Login' : 'Signup'"
            color="primary"
          />
        </q-card-actions>
      </q-form>

      <q-card-section v-if="error" class="text-negative">
        {{ error }}
      </q-card-section>

      <q-card-section class="text-center">
        <q-btn
          flat
          color="secondary"
          @click="isLogin = !isLogin"
          :label="
            isLogin
              ? 'Don’t have an account? Signup'
              : 'Already have an account? Login'
          "
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login, register } from "../services/auth";
import { useRouter } from "vue-router";

const isLogin = ref(true);
const username = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function handleSubmit() {
  if (isLogin.value) {
    const emailOrUsername = username.value ? username.value : email.value;
    // 🔑 LOGIN
    const res = await login(emailOrUsername, password.value);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    console.log("✅ Logged in:", res.data.user);
    router.replace("/");
  } else {
    // 📝 SIGNUP
    const res = await register(username.value, email.value, password.value);
    console.log("✅ Signed up successfully");
    if (!res.error) {
      isLogin.value = true;
    }
  }
}
</script>
