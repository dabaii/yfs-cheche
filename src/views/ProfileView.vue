<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, History, ChevronRight, Plus, Pencil, Trash2, Award, LogIn } from 'lucide-vue-next';
import Sticker from '../components/ui/Sticker.vue';
import CardFrame from '../components/ui/CardFrame.vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const { setModal, handleLogout, deleteAddress, editAddress, handleAddBalance } = inject('appActions');

const gotoHistory = () => {
    router.push({ name: 'shipping-history' });
};
</script>

<template>
  <div class="p-6 mb-24 overflow-y-auto animate-in fade-in duration-500 text-black font-black">
    <CardFrame 
      class="bg-indigo-600 p-8 text-white relative overflow-hidden mb-8 border-indigo-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="flex items-center gap-6 relative z-10">
        <div class="w-20 h-20 bg-white border-4 border-black rounded-[2rem] flex items-center justify-center text-black font-black text-3xl shadow-brutal">
          {{ userStore.user.isLoggedIn ? userStore.user.role === 'admin' ? 'BOSS' : 'LV.40' : null }}
          <Lock v-if="!userStore.user.isLoggedIn" :size="40" />
        </div>
        <div>
          <h2 class="text-3xl font-black tracking-tighter uppercase">{{ userStore.user.isLoggedIn ? userStore.user.name : '神秘访客' }}</h2>
          <Sticker class="bg-white text-black border-black mt-2">
            {{ userStore.user.isLoggedIn ? (userStore.user.role === 'admin' ? '次元管理员' : '资深勇者') : '尚未登录' }}
          </Sticker>
        </div>
      </div>
      <div v-if="userStore.user.isLoggedIn" class="grid grid-cols-2 gap-4 relative z-10 mt-8 text-center">
        <div class="bg-black/40 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20">
          <p class="text-indigo-200 text-[9px] font-black uppercase mb-1">金币能量</p>
          <p class="text-xl font-black text-yellow-400 leading-none">¥{{ userStore.user.balance.toLocaleString() }}</p>
        </div>
        <div class="bg-black/40 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20">
          <p class="text-indigo-200 text-[9px] font-black uppercase mb-1">稀有掉落</p>
          <p class="text-xl font-black text-emerald-400 leading-none">{{ userStore.user.items.length }}</p>
        </div>
      </div>
    </CardFrame>

    <div v-if="userStore.user.isLoggedIn" class="space-y-8">
      <CardFrame class="p-6" @click="gotoHistory">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-rose-100 border-4 border-black rounded-2xl flex items-center justify-center shadow-brutal">
              <History :size="24" :stroke-width="3" />
            </div>
            <span class="font-black text-xl underline decoration-rose-500 decoration-4 underline-offset-4">传送记录</span>
          </div>
          <ChevronRight :size="32" :stroke-width="4" />
        </div>
      </CardFrame>

      <CardFrame class="p-6 cursor-default">
        <div class="flex justify-between items-center mb-6 text-black font-black">
          <h3 class="font-black text-lg underline decoration-yellow-400 decoration-4">坐标管理</h3>
          <button @click="setModal({ type: 'address_form' })" class="bg-black text-white px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-brutal active:shadow-none">
            <Plus :size="12" :stroke-width="3" /> 添加
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="a in userStore.addresses" :key="a.id" :class="`border-2 border-black p-4 rounded-2xl relative ${a.isDefault ? 'bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(234,179,8,0.3)]' : ''}`">
            <div class="flex justify-between items-start pr-8 text-black font-black">
              <div>
                <div class="font-black text-sm">{{ a.name }} {{ a.phone }}</div>
                <div class="text-[10px] text-slate-500 mt-1">{{ a.detail }}</div>
                <span v-if="a.isDefault" class="text-[8px] text-yellow-600 font-bold block mt-2">默认传送点</span>
              </div>
              <div class="flex flex-col gap-3">
                <button @click.stop="editAddress(a)" class="text-blue-500 hover:scale-110 transition-transform">
                  <Pencil :size="16" :stroke-width="3" />
                </button>
                <button @click.stop="deleteAddress(a.id)" class="text-rose-500 hover:scale-110 transition-transform">
                  <Trash2 :size="16" :stroke-width="3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardFrame>

      <button @click="handleAddBalance" class="w-full bg-white border-4 border-black p-6 rounded-[2rem] flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1">
        <div class="flex items-center gap-5 text-black">
          <div class="w-12 h-12 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-brutal">
            <Award :size="24" :stroke-width="3" />
          </div>
          <span class="font-black text-xl underline decoration-indigo-500 decoration-4">补给魔法 ¥1000</span>
        </div>
        <ChevronRight :size="32" :stroke-width="4" />
      </button>

      <button @click="setModal({ type: 'logout_confirm' })" class="w-full bg-rose-500 text-white border-4 border-black p-6 rounded-[2rem] font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">注销当前次元</button>
    </div>

    <button v-else @click="setModal({ type: 'login' })" class="w-full mt-10 bg-yellow-400 border-4 border-black p-8 rounded-[3rem] flex items-center justify-center gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black">
      <LogIn :size="32" :stroke-width="4" />
      <span class="font-black text-xl underline decoration-black decoration-6">冒险登录</span>
    </button>
  </div>
</template>
