<template>
  <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="$emit('add-to-cart', product)">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="font-semibold">{{ product.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          ${{ Number(product.cost).toLocaleString() }}
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        color="primary"
        variant="soft"
        @click.stop="$emit('add-to-cart', product)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  product: any
}>();

defineEmits(['add-to-cart']);
</script>