<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '検索...'
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputValue = ref(props.modelValue || '')
let debounceTimeout = null

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue || ''
})

watch(inputValue, (newValue) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', newValue)
    emit('search', newValue)
  }, props.debounce)
})

function handleClear() {
  inputValue.value = ''
}
</script>

<template>
  <div class="form-control relative">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="input input-bordered w-full pr-20"
    />
    <button
      v-if="inputValue"
      @click="handleClear"
      class="absolute right-12 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
    >
      ×
    </button>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  </div>
</template>
