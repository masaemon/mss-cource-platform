<script setup>
defineProps({
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  }
})
</script>

<template>
  <div class="flex justify-center items-center">
    <span
      class="loading loading-spinner"
      :class="{
        'loading-xs': size === 'xs',
        'loading-sm': size === 'sm',
        'loading-md': size === 'md',
        'loading-lg': size === 'lg'
      }"
    ></span>
  </div>
</template>
