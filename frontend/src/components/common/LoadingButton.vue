<script setup>
defineProps({
  loading: Boolean,
  disabled: Boolean,
  type: {
    type: String,
    default: 'button'
  },
  btnClass: {
    type: String,
    default: 'btn-primary'
  }
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[btnClass, { 'loading': loading }]"
    :disabled="disabled || loading"
  >
    <slot></slot>
  </button>
</template>
