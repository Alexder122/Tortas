<template>
  <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
    <div class="flex-1">
      <p class="font-medium">{{ item.product.name }}</p>
      <p class="text-sm text-gray-500">
        ${{ Number(item.product.cost).toLocaleString() }} x {{ item.quantity }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <p class="font-semibold text-primary-600">
        ${{ (Number(item.product.cost) * item.quantity).toLocaleString() }}
      </p>
      <UButton
        icon="i-lucide-minus"
        size="2xs"
        color="error"
        variant="soft"
        @click="$emit('decrease', item.product.id)"
      />
      <UButton
        icon="i-lucide-plus"
        size="2xs"
        color="primary"
        variant="soft"
        @click="$emit('increase', item.product)"
      />
      <UButton
        icon="i-lucide-trash-2"
        size="2xs"
        color="error"
        variant="ghost"
        @click="$emit('remove', item.product.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  item: any
}>();

defineEmits(['increase', 'decrease', 'remove']);
</script>