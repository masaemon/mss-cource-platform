<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'created_at_desc'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const sortOptions = [
  { value: 'created_at_desc', label: '新着順' },
  { value: 'created_at_asc', label: '古い順' },
  { value: 'title_asc', label: 'タイトル順（A-Z）' },
  { value: 'title_desc', label: 'タイトル順（Z-A）' }
]

const selectedSort = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedSort.value = newValue
})

watch(selectedSort, (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
})
</script>

<template>
  <div class="form-control">
    <select
      v-model="selectedSort"
      class="select select-bordered"
    >
      <option
        v-for="option in sortOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
