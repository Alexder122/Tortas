<script setup lang="ts">
defineProps<{
	collapsed?: boolean;
}>();

const config = useRuntimeConfig();
</script>

<template>
    <div class="flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer active:scale-95">
        <UIcon name="i-lucide-sandwich" class="text-highlighted size-5 m-1.5 transition-all duration-200" />
        <span v-if="!collapsed" class="text-xl font-extrabold text-highlighted transition-all duration-200">{{ config.public.appName }}</span>
    </div>
</template>