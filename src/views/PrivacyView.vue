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

    <h1 class="text-4xl font-black mb-10 italic underline decoration-rose-400 decoration-8 underline-offset-8 uppercase tracking-tighter">隐私保护</h1>
    
    <CardFrame class="p-8 space-y-6 text-sm leading-relaxed">
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-rose-200 decoration-4">1. 数据的收集</h2>
        <p>我们仅收集勇者的手机信号以及传送地址。您的所有资产均存储在加密的次元数据库中。</p>
      </section>
      
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-rose-200 decoration-4">2. 第三方共享</h2>
        <p>我们绝不将您的冒险资料共享给恶魔或其他非授权第三方机构。唯一的例外是物流传送点，他们需要知道您的准确坐标以投放物资。</p>
      </section>
      
      <section>
        <h2 class="text-xl mb-4 italic underline decoration-rose-200 decoration-4">3. 如何撤销授权</h2>
        <p>勇者如果不愿再继续冒险，可以通过注销当前次元的操作来格式化所有个人数据。如果您选择这么做，请记得提取背包中的全部物资。</p>
      </section>
      
      <div class="pt-10 border-t-4 border-black border-dashed opacity-20 text-center uppercase italic text-[10px]">
        次元加密科 2026
      </div>
    </CardFrame>
  </div>
</template>
