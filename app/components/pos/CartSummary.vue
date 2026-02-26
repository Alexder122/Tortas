<template>
  <div class="space-y-4">
    <div class="flex justify-between text-lg font-semibold">
      <span>Total:</span>
      <span class="text-primary-600">${{ total.toLocaleString() }}</span>
    </div>
    
    <UButton
      block
      size="lg"
      color="success"
      :loading="isProcessing"
      :disabled="items.length === 0"
      @click="$emit('checkout')"
    >
      <template #leading>
        <UIcon name="i-lucide-shopping-cart" />
      </template>
      Procesar Venta
    </UButton>
    
    <UButton
      v-if="items.length > 0"
      block
      size="sm"
      color="error"
      variant="soft"
      @click="$emit('clear')"
    >
      Limpiar carrito
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[],
  total: number,
  isProcessing: boolean
}>();

defineEmits(['checkout', 'clear']);
</script>