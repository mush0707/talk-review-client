import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

import LoginPage from "@/pages/auth/LoginPage.vue";
import RegisterPage from "@/pages/auth/RegisterPage.vue";
import EmailVerifiedPage from "@/pages/EmailVerifiedPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";

import ProposalListPage from "@/pages/proposals/ProposalListPage.vue";
import ProposalCreatePage from "@/pages/proposals/ProposalCreatePage.vue";
import ProposalDetailPage from "@/pages/proposals/ProposalDetailPage.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/login", component: LoginPage, meta: { guestOnly: true } },
        { path: "/register", component: RegisterPage, meta: { guestOnly: true } },
        { path: "/email-verified", component: EmailVerifiedPage },

        // keep dashboard if you want, but it won't be primary
        { path: "/dashboard", component: DashboardPage, meta: { authOnly: true } },

        { path: "/", redirect: "/proposals" },

        { path: "/proposals", component: ProposalListPage, meta: { authOnly: true } },
        { path: "/proposals/new", component: ProposalCreatePage, meta: { authOnly: true } },
        { path: "/proposals/:id", component: ProposalDetailPage, meta: { authOnly: true } },
    ],
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();
    await auth.bootstrap();

    if (to.meta.authOnly && !auth.isLoggedIn) return "/login";
    if (to.meta.guestOnly && auth.isLoggedIn) return "/proposals";

    return true;
});
