<script setup lang="ts">
defineProps<{
    collapsed?: boolean
}>()

const config = useRuntimeConfig()

</script>

<template>
    <div class="flex items-center justify-center">
        <UIcon name="i-lucide-hamburger" class="text-highlighted size-5 m-1.5" />
        <span v-if="!collapsed" class="text-xl font-bold text-highlighted">{{ config.public.appName }}</span>
    </div>
</template>