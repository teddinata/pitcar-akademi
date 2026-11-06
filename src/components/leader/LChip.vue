<template>
  <span class="u-chip" :class="CHIP_CLASS[tone] || CHIP_CLASS.gray"><slot /></span>
</template>

<script setup>
import { CHIP_CLASS } from '../../utils/leader'

defineProps({ tone: { type: String, default: 'gray' } })
</script>
