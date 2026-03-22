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
        name: "friends",
        path: "friends",
        component: () => import("pages/FriendsPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "auth",
        path: "auth",
        component: () => import("pages/AuthenticationPage.vue"),
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
