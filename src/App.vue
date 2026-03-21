<script setup>
import { onMounted, ref, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import BottomNav from './components/layout/BottomNav.vue';
import ModalPortal from './components/modals/ModalPortal.vue';
import { 
    apiLogin, apiLogout, apiForgotPassword, apiGrantAdmin,
    apiCreateAddress, apiUpdateAddress, apiDeleteAddress,
    apiCreateShippingRecord, apiCreateCar, apiJoinCar, apiAddBalance
} from './api';
import { generateResult } from './utils';

const router = useRouter();
const userStore = useUserStore();

const modal = ref(null);
const joinCount = ref(1);
const selectedAddressId = ref(null);
const selectedInventory = ref([]);
const shippingMethod = ref('express');
const tempAddress = ref({ name: '', phone: '', detail: '', isDefault: false, id: null });
const tempStore = ref({ name: '', address: '', hours: '09:00 - 21:00' });
const form = ref({ name: '', totalSeats: 10, price: 68, discount: 100, description: '', prizes: [] });

onMounted(async () => {
  await userStore.loadInitialData();
  if (userStore.addresses.length > 0) {
    selectedAddressId.value = userStore.addresses[0].id;
  }
});

const checkAuth = () => {
    if (!userStore.user.isLoggedIn) {
        modal.value = { type: 'login' };
        return false;
    }
    return true;
};

const handleAuth = async (action, phone, code) => {
    let res;
    if (action === 'login') res = await apiLogin(phone, code);
    else if (action === 'forgot') res = await apiForgotPassword(phone, code);

    if (res.success) {
        if (action === 'forgot') {
            modal.value = { type: 'info', title: '操作成功', content: res.message };
        } else {
            userStore.setUserData(res.data);
            modal.value = null; // Close login modal on success
        }
    }
    return res;
};

const handleGrantAdmin = async (phone) => {
    const res = await apiGrantAdmin(phone);
    if (res.success) {
        modal.value = { type: 'info', title: '授权成功', content: res.message };
    } else {
        modal.value = { type: 'info', title: '操作失败', content: res.message };
    }
};

const handleLogout = async () => {
    const res = await apiLogout();
    if (res.success) {
        userStore.logout();
        router.push({ name: 'home' });
        selectedInventory.value = [];
    }
};

const toggleSelection = (t) => {
    if (selectedInventory.value.includes(t)) {
        selectedInventory.value = selectedInventory.value.filter(x => x !== t);
    } else {
        selectedInventory.value.push(t);
    }
};

const handleSelectAll = () => {
    if (selectedInventory.value.length === userStore.user.items.length) {
        selectedInventory.value = [];
    } else {
        selectedInventory.value = userStore.user.items.map(i => i.timestamp);
    }
};

const deleteAddress = async (id) => {
    const res = await apiDeleteAddress(id);
    if (res.success) {
        userStore.setAddresses(userStore.addresses.filter(a => a.id !== id));
    }
};

const editAddress = (a) => {
    tempAddress.value = { ...a };
    modal.value = { type: 'address_form' };
};

const handleSaveAddress = async () => {
    let updated;
    if (tempAddress.value.id) {
        const res = await apiUpdateAddress(tempAddress.value.id, tempAddress.value);
        if (res.success) {
            updated = userStore.addresses.map(a => a.id === tempAddress.value.id ? { ...tempAddress.value } : a);
        }
    } else {
        const res = await apiCreateAddress(tempAddress.value);
        if (res.success) {
            updated = [...userStore.addresses, res.data];
        }
    }

    if (updated) {
        if (tempAddress.value.isDefault) {
             const targetId = tempAddress.value.id || updated[updated.length - 1].id;
             updated = updated.map(a => a.id === targetId ? a : { ...a, isDefault: false });
        }
        userStore.setAddresses(updated);
        modal.value = null;
        tempAddress.value = { name: '', phone: '', detail: '', isDefault: false, id: null };
    }
};

const handleConfirmShipping = async () => {
    const selectedItems = userStore.user.items.filter(item => selectedInventory.value.includes(item.timestamp));
    if (selectedItems.length === 0) return;

    let receiverInfo = '';
    if (shippingMethod.value === 'express') {
        // Use selected id, or fallback to first address if any exist
        const addr = userStore.addresses.find(a => a.id === selectedAddressId.value) || userStore.addresses[0];
        if (addr) {
            receiverInfo = `${addr.name} ${addr.phone} ${addr.detail}`;
            // Sync selectedAddressId if it was fallback
            if (!selectedAddressId.value) selectedAddressId.value = addr.id;
        }
    } else {
        // Default to the first store if any exist
        const store = userStore.stores[0];
        if (store) {
            receiverInfo = `${store.name} (${store.address})`;
        } else {
             receiverInfo = '自提据点1号 (秋叶原 1-1-1)';
        }
    }

    if (!receiverInfo) {
        modal.value = { type: 'info', title: '信号丢失', content: '请先确认传送坐标或据点信息。' };
        return;
    }

    const res = await apiCreateShippingRecord(selectedItems, shippingMethod.value, receiverInfo);
    if (res.success) {
        // Ensure the record is prepended to history
        userStore.setShippingHistory([res.data, ...userStore.shippingHistory]);
        userStore.updateItems(userStore.user.items.filter(item => !selectedInventory.value.includes(item.timestamp)));
        selectedInventory.value = [];
        modal.value = { type: 'info', title: '申请传送!', content: '物资正在打包中！' };
        router.push({ name: 'warehouse' });
    } else {
        modal.value = { type: 'info', title: '传送失败', content: res.message };
    }
};

const handleCreateCar = async () => {
    const total = form.value.prizes.reduce((acc, p) => acc + parseInt(p.count || 0), 0);
    if (total !== parseInt(form.value.totalSeats)) {
        modal.value = { type: 'info', title: '配置错误!', content: `奖品总数(${total})必须等于车位数(${form.value.totalSeats})。` };
        return;
    }
    const carData = { ...form.value, totalSeats: parseInt(form.value.totalSeats), occupiedSeats: {}, status: 'open', results: generateResult(form.value.prizes) };
    const res = await apiCreateCar(carData);
    if (res.success) {
        // Here you might want to refresh active cars or emit a refresh event
        router.push({ name: 'home' });
    }
};

const handleJoinByCount = async (carId, count) => {
    // Logic similar to React implementation
    const totalPrice = (modal.value.data.price * (modal.value.data.discount / 100) * count).toFixed(2);
    const res = await apiJoinCar(carId, count, totalPrice);
    if (res.success) {
        modal.value = null;
        // Navigation or refreshing might be needed depending on your data fetching strategy
        await userStore.loadInitialData();
    }
};

const handleAddBalance = async () => {
    const res = await apiAddBalance(1000);
    if (res.success) {
        userStore.updateBalance(userStore.user.balance + 1000);
    }
};

// Providing context and methods to child components if necessary (though using store is better)
provide('appActions', {
    setModal: (m) => modal.value = m,
    checkAuth,
    handleAuth,
    handleLogout,
    handleGrantAdmin,
    deleteAddress,
    editAddress,
    handleSaveAddress,
    handleConfirmShipping,
    handleCreateCar,
    handleJoinByCount,
    handleAddBalance,
    toggleSelection,
    handleSelectAll,
    setJoinCount: (c) => joinCount.value = c,
    setSelectedAddressId: (id) => selectedAddressId.value = id,
    setShippingMethod: (m) => shippingMethod.value = m,
    setForm: (f) => form.value = f
});

</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden select-none pb-20">
    <div v-if="userStore.isLoading" class="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-black">
      <div class="w-16 h-16 border-4 border-black border-t-indigo-500 rounded-full animate-spin shadow-brutal mb-6"></div>
      <h1 class="text-2xl italic tracking-widest animate-pulse">正在连接次元...</h1>
    </div>

    <router-view v-else v-bind="{ 
        user: userStore.user, 
        addresses: userStore.addresses, 
        stores: userStore.stores,
        shippingHistory: userStore.shippingHistory,
        selectedInventory,
        shippingMethod,
        selectedAddressId,
        modal,
        joinCount,
        tempAddress,
        form
    }" />

    <BottomNav :user-role="userStore.user.role" />
    
    <ModalPortal 
        v-if="modal" 
        :modal="modal" 
        :user="userStore.user" 
        :addresses="userStore.addresses"
        :selected-address-id="selectedAddressId"
        :join-count="joinCount"
        :temp-address="tempAddress"
    />
  </div>
</template>

<style>
/* CSS imported in main.js */
</style>
