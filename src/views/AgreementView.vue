<script setup>
import { useRouter } from 'vue-router';
import { ChevronLeft } from 'lucide-vue-next';
import CardFrame from '../components/ui/CardFrame.vue';

const router = useRouter();
</script>

<template>
  <div class="p-6 pb-32 animate-in fade-in duration-500 font-black text-black">
    <button @click="router.back()" class="mb-8 flex items-center gap-2 text-slate-400 hover:text-black transition-colors">
      <ChevronLeft :size="24" :stroke-width="4" />
      <span class="uppercase italic">返回</span>
    </button>

    <h1 class="text-4xl font-black mb-10 italic underline decoration-indigo-400 decoration-8 underline-offset-8 uppercase tracking-tighter">用户协议</h1>
    
    <CardFrame class="p-8 space-y-6 text-sm leading-relaxed">
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-indigo-200 decoration-4">1. 冒险者守则</h2>
        <p>每一位进入次元的勇者都必须遵守基本的冒险礼仪。严禁任何形式的作弊、魔法攻击服务器以及对其他勇者的语言冒犯。</p>
      </section>
      
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-indigo-200 decoration-4">2. 虚拟资产</h2>
        <p>本平台提供的“盲盒”及“席位”均为虚拟文化商品。一旦集结成功发车，概不退换金币能量。请勇者在集结前确认自己的直觉。</p>
      </section>
      
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-indigo-200 decoration-4">3. 免责声明</h2>
        <p>次元裂缝可能会偶尔出现波动导致连接失败。在这种情况下，请通过传送信号（客服）联系总部。我们不承担因勇者自身网络设备老化导致的冒险失败责任。</p>
      </section>
      
      <div class="pt-10 border-t-4 border-black border-dashed opacity-20 text-center uppercase italic text-[10px]">
        次元管理总部 2026
      </div>
    </CardFrame>
  </div>
</template>
