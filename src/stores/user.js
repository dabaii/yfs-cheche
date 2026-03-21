import { defineStore } from 'pinia';
import { fetchUser, fetchAddresses, fetchStores, fetchShippingHistory, fetchActiveCars } from '../api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: { id: null, name: '访客', balance: 0, items: [], isLoggedIn: false, role: 'user' },
    addresses: [],
    stores: [],
    shippingHistory: [],
    activeCars: [],
    isLoading: true
  }),
  actions: {
    async loadInitialData() {
      try {
        const [userData, addressesData, storesData, historyData, carsData] = await Promise.all([
          fetchUser(),
          fetchAddresses(),
          fetchStores(),
          fetchShippingHistory(),
          fetchActiveCars()
        ]);
        
        if (userData.success) this.user = userData.data;
        if (addressesData.success) this.addresses = addressesData.data;
        if (storesData.success) this.stores = storesData.data;
        if (historyData.success) this.shippingHistory = historyData.data;
        if (carsData.success) this.activeCars = carsData.data;
      } catch (error) {
        console.error("加载初始数据失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    // ...
    setUserData(data) {
      this.user = data;
    },
    logout() {
      this.user = { id: null, name: '访客', balance: 0, items: [], isLoggedIn: false, role: 'user' };
    },
    updateBalance(newBalance) {
      this.user.balance = newBalance;
    },
    updateItems(newItems) {
      this.user.items = newItems;
    },
    setAddresses(newAddresses) {
      this.addresses = newAddresses;
    },
    setShippingHistory(newHistory) {
      this.shippingHistory = newHistory;
    }
  },
  getters: {
    groupedWarehouse: (state) => {
      if (!state.user.isLoggedIn || !state.user.items) return {};
      return state.user.items.reduce((acc, item) => {
          const key = item.carName || "未知车队";
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
      }, {});
    }
  }
});
