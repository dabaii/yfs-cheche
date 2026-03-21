<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Home, Package, User, Settings } from 'lucide-vue-next';

const props = defineProps({
  userRole: {
    type: String,
    required: true
  }
});

const route = useRoute();

const navigation = computed(() => {
  const items = [
    { id: 'home', icon: Home, label: '大厅', to: { name: 'home' } },
    { id: 'warehouse', icon: Package, label: '行囊', to: { name: 'warehouse' } },
    { id: 'profile', icon: User, label: '勇者', to: { name: 'profile' } }
  ];
  if (props.userRole === 'admin') {
    items.push({ id: 'admin', icon: Settings, label: '工厂', to: { name: 'admin' } });
  }
  return items;
});

const isActive = (nav) => {
  if (nav.id === 'profile' && route.name === 'shipping-history') return true;
  return route.name === nav.id;
};
</script>

<template>
  <div class="fixed bottom-4 left-4 right-4 bg-white border-4 border-black rounded-3xl flex justify-around items-center h-18 z-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
    <router-link 
      v-for="nav in navigation" 
      :key="nav.id" 
      :to="nav.to" 
      class="flex flex-col items-center transition-all no-underline"
      :class="isActive(nav) ? 'text-blue-500 scale-110' : 'text-slate-400'"
    >
      <component :is="nav.icon" :size="20" :stroke-width="3" />
      <span class="text-[10px] mt-1 font-black">{{ nav.label }}</span>
    </router-link>
  </div>
</template>
