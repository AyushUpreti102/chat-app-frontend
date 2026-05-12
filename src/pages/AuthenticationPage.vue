<template>
  <div class="login-page">

    <div class="auth-container">

      <!-- LEFT SIDE (Desktop only) -->
      <div class="auth-left">
        <div class="brand">
          <div class="text-h4 text-weight-bold text-primary">
            ChatFlow 💬
          </div>

          <div class="text-subtitle1 q-mt-md text-grey-7">
            Connect with friends in a modern way.
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="auth-right">
        <q-card class="login-card">

          <!-- Title -->
          <q-card-section class="text-center q-pb-none">
            <div class="text-h5 text-weight-bold">
              {{ isLogin ? "Welcome Back 👋" : "Create Account 🚀" }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ isLogin ? "Login to continue" : "Signup to get started" }}
            </div>
          </q-card-section>

          <!-- Form -->
          <q-form @submit="handleSubmit">
            <q-card-section class="q-pt-md">

              <q-input v-if="!isLogin" v-model="username" label="Username" filled dense class="q-mb-md input-style">
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input v-model="email" :label="!isLogin ? 'Email' : 'Username or Email'" filled dense
                class="q-mb-md input-style">
                <template #prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>

              <q-input v-model="password" label="Password" type="password" filled dense class="input-style">
                <template #prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

            </q-card-section>

            <!-- Button -->
            <q-card-actions class="q-px-md q-pb-md">
              <q-btn class="full-width login-btn" type="submit" :label="isLogin ? 'Login' : 'Signup'" unelevated />
            </q-card-actions>
          </q-form>

          <!-- Error -->
          <q-card-section v-if="error" class="text-negative text-center q-pt-none">
            {{ error }}
          </q-card-section>

          <!-- Toggle -->
          <q-card-section class="text-center q-pt-none">
            <q-btn flat class="text-primary" @click="redirectToLoginOrSignup" :label="isLogin
              ? 'Don’t have an account? Signup'
              : 'Already have an account? Login'" />
          </q-card-section>

        </q-card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { login, register } from "../services/auth";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "src/composables/useToast";

const router = useRouter();
const route = useRoute();
const { toastSuccess } = useToast();

const username = ref("");
const email = ref("");
const password = ref("");
const error = ref("");

const isLogin = computed(() => route.path.includes("login"));

const redirectToLoginOrSignup = () => {
  const routeName = isLogin.value ? "signup" : "login";
  router.push({ name: routeName });
};

async function handleSubmit() {
  error.value = "";

  try {
    if (isLogin.value) {
      const emailOrUsername = username.value || email.value;
      await login(emailOrUsername, password.value);
      toastSuccess("Signed in successfully");
      router.push({ name: "chat" });
    } else {
      await register(username.value, email.value, password.value);
      toastSuccess("Account created. You can log in now.");
      router.push({ name: "login" });
    }
  } catch (err) {
    error.value = err?.message || "Something went wrong!";
  }
}
</script>

<style scoped>
/* PAGE */
.login-page {
  position: relative;
  height: 100dvh;
  overflow: hidden;

  background: linear-gradient(135deg,
      #f5f5f9 0%,
      #ececf3 40%,
      #e6e6ef 100%);
}

.login-page::before,
.login-page::after {
  pointer-events: none;
  /* safety */
}

.login-page::before {
  background: rgba(108, 99, 255, 0.2);
  top: -100px;
  left: -100px;
}

.login-page::after {
  background: rgba(147, 51, 234, 0.2);
  bottom: -100px;
  right: -100px;
}

.auth-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-left {
  flex: 1;
  display: none;
  justify-content: center;
  padding: 60px;
}

.auth-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  padding-top: 10px;

  background: white;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

.input-style {
  background: #f4f5fb;
  border-radius: 10px;
}

.login-btn {
  background: #6c63ff;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  height: 44px;
}

/* DESKTOP */
@media (min-width: 1024px) {
  .auth-left {
    display: flex;
  }

  .auth-container {
    max-width: 1200px;
    margin: auto;
  }
}

/* MOBILE */
@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }

  .login-card {
    max-width: 100%;
  }
}
</style>