import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

import LoginPage from "@/pages/auth/LoginPage.vue";
import RegisterPage from "@/pages/auth/RegisterPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import EmailVerifiedPage from "@/pages/EmailVerifiedPage.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login", component: LoginPage, meta: { guestOnly: true } },
        { path: "/register", component: RegisterPage, meta: { guestOnly: true } },

        // landing after backend redirects from verify-url
        { path: "/email-verified", component: EmailVerifiedPage },

        { path: "/", component: DashboardPage, meta: { authOnly: true } },
    ],
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();
    await auth.bootstrap();

    if (to.meta.authOnly && !auth.isLoggedIn) return "/login";
    if (to.meta.guestOnly && auth.isLoggedIn) return "/";

    return true;
});
