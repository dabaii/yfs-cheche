<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
});

defineEmits(['click']);
</script>

<template>
  <div 
    @click="$emit('click')" 
    :class="`bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${className}`">
    <slot />
  </div>
</template>
