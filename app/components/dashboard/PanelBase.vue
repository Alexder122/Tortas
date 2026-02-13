<script setup lang="ts">
defineProps<{
  id: string
  title: string
}>()
</script>

<template>
    <UDashboardPanel :id="id">
        <template #header>
            <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <slot name="header-right" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <slot />
        </template>
    </UDashboardPanel>
</template>