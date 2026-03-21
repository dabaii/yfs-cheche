import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import WarehouseView from '../views/WarehouseView.vue';
import ShippingSummaryView from '../views/ShippingSummaryView.vue';
import ProfileView from '../views/ProfileView.vue';
import ShippingHistoryView from '../views/ShippingHistoryView.vue';
import AdminView from '../views/AdminView.vue';
import AgreementView from '../views/AgreementView.vue';
import PrivacyView from '../views/PrivacyView.vue';
import { useUserStore } from '../stores/user';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/warehouse',
        name: 'warehouse',
        component: WarehouseView
    },
    {
        path: '/shipping-summary',
        name: 'shipping-summary',
        component: ShippingSummaryView,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView
    },
    {
        path: '/shipping-history',
        name: 'shipping-history',
        component: ShippingHistoryView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: { requiresAdmin: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    
    if (to.meta.requiresAuth && !userStore.user.isLoggedIn) {
        next({ name: 'home' });
    } else if (to.meta.requiresAdmin && userStore.user.role !== 'admin') {
        next({ name: 'home' });
    } else {
        next();
    }
});

export default router;
