<script setup>
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight, Truck, MapPin, Map } from 'lucide-vue-next';
import CardFrame from '../components/ui/CardFrame.vue';
import { useUserStore } from '../stores/user';

const props = defineProps(['shippingMethod', 'selectedAddressId']);
const router = useRouter();
const userStore = useUserStore();
const { setModal, setShippingMethod, handleConfirmShipping } = inject('appActions');

const activeAddr = computed(() => {
    return userStore.addresses.find(a => a.id === props.selectedAddressId) || userStore.addresses[0];
});

const goBack = () => {
    router.push({ name: 'warehouse' });
};
</script>

<template>
  <div class="p-6 mb-24 animate-in slide-in-from-right duration-300 text-black font-black">
    <div class="flex items-center gap-4 mb-8">
      <button @click="goBack" class="border-4 border-black p-1 rounded-xl active:bg-slate-100">
        <ChevronRight :size="24" class="rotate-180" />
      </button>
      <h1 class="text-2xl font-black italic">确认传送</h1>
    </div>

    <CardFrame class="p-6 mb-6">
      <h3 class="font-black text-sm mb-4 flex items-center gap-2">
        <Truck :size="18" /> 物流协议
      </h3>
      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="setShippingMethod('express')" 
          :class="`p-4 rounded-2xl border-4 border-black font-black text-xs shadow-brutal ${shippingMethod === 'express' ? 'bg-indigo-500 text-white' : 'bg-white'}`"
        >
          快递
        </button>
        <button 
          @click="setShippingMethod('pickup')" 
          :class="`p-4 rounded-2xl border-4 border-black font-black text-xs shadow-brutal ${shippingMethod === 'pickup' ? 'bg-indigo-500 text-white' : 'bg-white'}`"
        >
          自提
        </button>
      </div>
    </CardFrame>

    <CardFrame v-if="shippingMethod === 'express'" class="p-6 mb-6" @click="setModal({ type: 'select_address' })">
      <div class="flex justify-between items-center mb-4 font-black">
        <h3 class="font-black text-sm flex items-center gap-2">
          <MapPin :size="18" /> 收货坐标
        </h3>
        <div class="flex items-center gap-1 text-[10px] text-blue-500 underline">切换坐标</div>
      </div>
      <div v-if="activeAddr" class="bg-slate-50 p-4 rounded-2xl border-2 border-black/5">
        <div class="font-black text-sm mb-1">{{ activeAddr.name }} {{ activeAddr.phone }}</div>
        <div class="text-[10px] text-slate-500">{{ activeAddr.detail }}</div>
        <span v-if="activeAddr.isDefault" class="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold mt-2 inline-block">默认</span>
      </div>
      <div v-else class="text-center py-4 text-xs font-bold text-slate-400">请点击选择传送点</div>
    </CardFrame>

    <CardFrame v-else class="p-6 mb-6 text-black font-black">
      <h3 class="font-black text-sm mb-4 flex items-center gap-2">
        <Map :size="18" /> 选择据点
      </h3>
      <div class="space-y-3">
        <div 
          v-for="s in userStore.stores" 
          :key="s.id" 
          class="bg-slate-50 p-4 rounded-2xl border-2 border-black/5 active:border-indigo-500"
        >
          <div class="font-black text-sm">{{ s.name }}</div>
          <div class="text-[10px] text-slate-500">{{ s.address }}</div>
        </div>
      </div>
    </CardFrame>

    <button 
      @click="handleConfirmShipping" 
      class="w-full mt-8 bg-black text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] active:translate-y-1 transition-all"
    >
      确认传送指令
    </button>
  </div>
</template>
