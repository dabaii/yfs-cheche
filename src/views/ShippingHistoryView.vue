<script setup>
import { useRouter } from 'vue-router';
import { ChevronRight, History } from 'lucide-vue-next';
import Sticker from '../components/ui/Sticker.vue';
import CardFrame from '../components/ui/CardFrame.vue';
import { PRIZE_TYPES } from '../constants';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
    router.push({ name: 'profile' });
};
</script>

<template>
  <div class="p-6 mb-24 animate-in slide-in-from-right duration-300 text-black font-black">
    <div class="flex items-center gap-4 mb-8">
      <button @click="goBack" class="border-4 border-black p-1 rounded-xl active:bg-slate-100 transition-colors">
        <ChevronRight :size="24" class="rotate-180" />
      </button>
      <h1 class="text-2xl font-black">传送记录</h1>
    </div>

    <CardFrame v-if="userStore.shippingHistory.length === 0" class="p-20 text-center border-dashed text-slate-300">
      <History :size="64" class="mx-auto mb-4 opacity-10" />
      <p class="font-black text-sm">尚未发现传送波动</p>
    </CardFrame>

    <div v-else class="space-y-6">
      <CardFrame v-for="record in userStore.shippingHistory" :key="record.id" class="p-5 border-black">
        <div class="flex justify-between items-start mb-4">
          <div class="space-y-2">
            <div class="flex gap-2">
              <Sticker 
                :class="`${record.status === '打包中' ? 'bg-amber-300' : 'bg-blue-400'} text-black cursor-default active:translate-y-0`"
              >
                {{ record.status }}
              </Sticker>
              <Sticker 
                :class="`${record.method === 'express' ? 'bg-black text-white' : 'bg-emerald-500 text-black'} cursor-default active:translate-y-0 text-[10px]`"
              >
                {{ record.method === 'express' ? '快递传送' : '据点自提' }}
              </Sticker>
            </div> <!-- end flex gap-2 -->
            <div v-if="record.method === 'pickup'" class="flex items-center gap-2 mt-2">
                <span class="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase">自提验证码</span>
                <span class="text-lg font-black tracking-[4px] text-black underline decoration-rose-500 decoration-4 underline-offset-4">{{ record.pickup_code || '----' }}</span>
            </div>
          </div> <!-- end space-y-2 -->
          <div class="text-right">
            <div class="text-[10px] font-black opacity-60">{{ record.date }}</div>
          </div>
        </div>

        <div class="bg-slate-50 border-2 border-black rounded-xl p-3 mb-4">
          <div class="text-[9px] text-slate-400 font-extrabold uppercase mb-1">
            {{ record.method === 'express' ? '接收坐标' : '集结据点' }}
          </div>
          <p class="text-[11px] font-black text-black leading-snug underline decoration-black/10">
            {{ record.receiver_info || '暂无详细记录' }}
          </p>

          <!-- 新增快递信息 -->
          <div v-if="record.method === 'express'" class="mt-3 pt-3 border-t-2 border-black/5 grid grid-cols-2 gap-4">
            <div>
              <div class="text-[8px] text-slate-400 font-extrabold uppercase">快递公司</div>
              <div class="text-[10px] font-black">{{ record.status === '打包中' ? '/' : (record.courier_name || '/') }}</div>
            </div>
            <div>
              <div class="text-[8px] text-slate-400 font-extrabold uppercase">快递单号</div>
              <div class="text-[10px] font-black">{{ record.status === '打包中' ? '/' : (record.tracking_number || '/') }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div 
            v-for="(item, idx) in record.items" 
            :key="idx" 
            :class="`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${PRIZE_TYPES[item.type]?.color}`"
          >
            {{ item.type }}
          </div>
        </div>
      </CardFrame>
    </div>
  </div>
</template>
