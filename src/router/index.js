import { defineRouter } from "#q-app/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";
import routes from "./routes";
import { checkAuth } from "src/services/auth";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const isAuth = await checkAuth();

    // 🔐 Protected route
    if (to.meta.requiresAuth && !isAuth) {
      return next({ name: "login" });
    }

    // 🚫 Prevent logged-in user from going to login/signup
    if ((to.name === "auth" || to.name === "signup") && isAuth) {
      return next({ name: "chat" });
    }

    next();
  });

  return Router;
});
