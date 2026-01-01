<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])
const visible = ref(true)

watch(visible, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

// 自動で非表示
setTimeout(() => {
  visible.value = false
}, props.duration)
</script>

<template>
  <div v-if="visible" class="toast toast-end">
    <div
      class="alert"
      :class="{
        'alert-info': type === 'info',
        'alert-success': type === 'success',
        'alert-warning': type === 'warning',
        'alert-error': type === 'error'
      }"
    >
      <span>{{ message }}</span>
      <button class="btn btn-sm btn-ghost" @click="visible = false">×</button>
    </div>
  </div>
</template>
