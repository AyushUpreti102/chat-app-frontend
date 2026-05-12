const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        name: "chat",
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
        children: [
          {
            name: "userChat",
            path: ":userId",
            component: () => import("components/UserChat.vue"),
            meta: { requiresAuth: true },
          },
        ],
      },
      {
        name: "login",
        path: "/login",
        component: () => import("pages/AuthenticationPage.vue"),
      },
      {
        name: "signup",
        path: "/signup",
        component: () => import("pages/AuthenticationPage.vue"),
      },
      {
        name: "search",
        path: "/search",
        component: () => import("pages/SearchPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "profile",
        path: "/profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
