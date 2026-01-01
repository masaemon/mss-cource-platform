<script setup>
import { ref, watch, onMounted } from 'vue'
import { getCategories } from '@/api/categories'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const categories = ref([])
const loading = ref(false)
const selectedCategory = ref(props.modelValue || 'all')

watch(() => props.modelValue, (newValue) => {
  selectedCategory.value = newValue || 'all'
})

watch(selectedCategory, (newValue) => {
  const value = newValue === 'all' ? null : newValue
  emit('update:modelValue', value)
  emit('change', value)
})

onMounted(async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="form-control">
    <select
      v-model="selectedCategory"
      class="select select-bordered"
      :disabled="loading"
    >
      <option value="all">すべてのカテゴリー</option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name_ja }}
      </option>
    </select>
  </div>
</template>
