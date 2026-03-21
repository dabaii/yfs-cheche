<script setup>
import { inject } from 'vue';
import { Zap, Heart, Trophy } from 'lucide-vue-next';
import Sticker from '../components/ui/Sticker.vue';
import CardFrame from '../components/ui/CardFrame.vue';
import { PRIZE_TYPES } from '../constants';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { setModal, checkAuth } = inject('appActions');

const getMySeatsCount = (car) => {
    if (!userStore.user.isLoggedIn) return 0;
    return Object.values(car.occupiedSeats).filter(s => s.uid === userStore.user.id).length;
};
</script>

<template>
  <div class="p-5 mb-24 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] animate-in fade-in duration-500">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-black flex items-center gap-2 text-black">
          <Zap class="text-yellow-400 fill-yellow-400" /> 一番开车
        </h1>
        <Sticker class="bg-cyan-300 mt-2 cursor-default active:translate-y-0">冒险布告栏</Sticker>
      </div>
      <CardFrame @click="!userStore.user.isLoggedIn && setModal({ type: 'login' })" class="px-4 py-2 bg-yellow-300 text-center min-w-[100px]">
        <span class="text-[10px] font-black block text-black/50 text-center">当前金币</span>
        <span class="text-sm font-black block text-center">{{ userStore.user.isLoggedIn ? `¥${userStore.user.balance.toLocaleString()}` : '前往登录' }}</span>
      </CardFrame>
    </div>

    <div class="space-y-10">
      <CardFrame v-for="car in userStore.activeCars" :key="car.id" class="p-0 overflow-hidden relative">
        <div class="absolute -top-3 -right-3">
          <div :class="`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center ${car.status !== 'open' ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'}`">
            <Trophy v-if="car.status !== 'open'" :size="20" />
            <Heart v-else class="fill-white" :size="20" />
          </div>
        </div>

        <div class="p-6 text-black">
          <h3 class="font-black text-xl mb-1 text-black underline decoration-indigo-400 decoration-4">{{ car.name }}</h3>
          <p class="text-[10px] font-bold text-slate-500 mb-4 line-clamp-1">{{ car.description }}</p>
          
          <div class="flex items-center gap-3 mb-6 bg-slate-50 p-2 rounded-2xl border-2 border-black/5">
            <div class="flex-1 bg-white border-2 border-black h-3 rounded-full overflow-hidden">
              <div 
                :class="`${car.status !== 'open' ? 'bg-indigo-400' : 'bg-rose-400'} h-full border-r-2 border-black transition-all duration-700`" 
                :style="{ width: `${(Object.keys(car.occupiedSeats).length / car.totalSeats) * 100}%` }" 
              />
            </div>
            <span class="font-black text-[10px] text-black">{{ Object.keys(car.occupiedSeats).length }}/{{ car.totalSeats }} 人集结</span>
            <Sticker v-if="getMySeatsCount(car) > 0" class="bg-emerald-400 py-0.5 ml-1">我的:{{ getMySeatsCount(car) }}</Sticker>
          </div>

          <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <div v-for="(p, idx) in car.prizes" :key="idx" @click="setModal({ type: 'preview', data: p })" class="flex-shrink-0 w-24 cursor-pointer group">
              <div class="relative border-4 border-black rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform mb-2">
                <img :src="p.img || 'https://via.placeholder.com/100'" class="w-full aspect-square object-cover" :alt="p.name" />
                <div :class="`absolute top-1 left-1 px-1.5 py-0.5 border-2 border-black rounded-lg text-[8px] font-black text-white ${PRIZE_TYPES[p.type]?.color}`">{{ p.type }}赏</div>
                <div class="absolute bottom-1 right-1 bg-black text-white text-[9px] font-black px-1.5 rounded-md">x{{ p.count }}</div>
              </div>
              <div class="text-[10px] font-black truncate text-center text-black group-hover:text-blue-500">{{ p.name }}</div>
            </div>
          </div>

          <div class="flex items-end justify-between mt-2 border-t-2 border-black pt-4">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-slate-400 uppercase">集结单价</span>
              <span class="text-3xl font-black text-rose-500 leading-none">¥{{ (car.price * car.discount / 100).toFixed(1) }}</span>
            </div>
            <button 
              @click="car.status !== 'open' ? setModal({ type: 'results', data: car }) : (checkAuth() && setModal({ type: 'join', data: car }))" 
              :class="`border-4 border-black px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all ${car.status !== 'open' ? 'bg-indigo-400 text-white' : 'bg-yellow-400 text-black'}`"
            >
              {{ car.status !== 'open' ? '狩猎成功' : '立即加入' }}
            </button>
          </div>
        </div>
      </CardFrame>
    </div>
  </div>
</template>
