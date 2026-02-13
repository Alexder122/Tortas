<script setup lang="ts">
defineProps<{
	placeholder?: string;
}>();

const searchQuery = defineModel<string>();
</script>

<template>
    <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="placeholder || 'Buscar...'" size="lg"
        class="w-full lg:max-w-lg">
        <template v-if="searchQuery" #trailing>
            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" aria-label="Limpiar búsqueda"
                @click="searchQuery = ''" />
        </template>
    </UInput>
</template>