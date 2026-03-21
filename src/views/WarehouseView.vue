<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { Package, Lock, Zap, CheckSquare, Square } from 'lucide-vue-next';
import Sticker from '../components/ui/Sticker.vue';
import CardFrame from '../components/ui/CardFrame.vue';
import { PRIZE_TYPES } from '../constants';
import { useUserStore } from '../stores/user';

const props = defineProps(['selectedInventory']);
const router = useRouter();
const userStore = useUserStore();
const { setModal, toggleSelection, handleSelectAll } = inject('appActions');

const gotoShipping = () => {
    router.push({ name: 'shipping-summary' });
};
</script>

<template>
  <div class="p-6 mb-24 animate-in fade-in duration-500 text-black font-black">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-black italic underline decoration-rose-400 decoration-4 text-black">
        <Package class="inline-block text-rose-400 mb-1" /> 我的宝库
      </h1>
      <div class="flex items-center gap-3">
        <Sticker 
          v-if="userStore.user.isLoggedIn && Object.keys(userStore.groupedWarehouse).length > 0" 
          @click="handleSelectAll" 
          class="bg-white text-black border-black h-10 flex items-center justify-center">
          全选
        </Sticker>
        <button 
          v-if="selectedInventory.length > 0" 
          @click="gotoShipping" 
          class="bg-rose-500 text-white border-4 border-black px-4 py-2 rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce active:shadow-none">
          申请传送 ({{ selectedInventory.length }})
        </button>
      </div>
    </div>

    <CardFrame v-if="!userStore.user.isLoggedIn" class="p-20 text-center border-dashed" @click="setModal({ type: 'login' })">
      <Lock class="mx-auto mb-4 opacity-10 text-black" size={60} />
      <p class="font-black text-sm text-black">请登录以开启行囊</p>
      <button class="mt-4 bg-black text-white px-6 py-2 rounded-xl text-xs font-black">前往登录</button>
    </CardFrame>

    <CardFrame v-else-if="Object.keys(userStore.groupedWarehouse).length === 0" class="p-16 text-center opacity-30 text-black">
      <Zap size={60} class="mx-auto mb-4" />
      <p class="font-black">仓库目前空空如也</p>
    </CardFrame>

    <div v-else class="space-y-12">
      <div v-for="(items, carName) in userStore.groupedWarehouse" :key="carName">
        <div class="flex items-center gap-4 mb-5 text-black">
          <Sticker class="bg-yellow-300 min-w-[120px] text-center italic cursor-default active:translate-y-0">{{ carName }}</Sticker>
          <div class="h-1 flex-1 bg-black rounded-full opacity-20"></div>
        </div>
        <div class="grid gap-5">
          <CardFrame 
            v-for="item in items" 
            :key="item.timestamp" 
            :class="`p-4 flex items-center gap-4 border-2 ${selectedInventory.includes(item.timestamp) ? 'bg-indigo-50 border-indigo-500 shadow-none translate-x-1' : ''}`" 
            @click="toggleSelection(item.timestamp)"
          >
            <div class="shrink-0">
              <CheckSquare v-if="selectedInventory.includes(item.timestamp)" class="text-indigo-600" :stroke-width="3" />
              <Square v-else class="text-slate-300" :stroke-width="3" />
            </div>
            <div :class="`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center text-white text-lg font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${PRIZE_TYPES[item.type]?.color}`">{{ item.type }}</div>
            <div class="flex-1 font-black text-black text-sm truncate">{{ item.name }} <span class="text-[10px] text-slate-400 ml-2">#{{ item.seat }}</span></div>
          </CardFrame>
        </div>
      </div>
    </div>
  </div>
</template>
