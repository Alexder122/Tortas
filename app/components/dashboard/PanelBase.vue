<script setup lang="ts">
const { id, title, description } = defineProps<{
	id: string;
	title: string;
	description?: string;
}>();

const config = useRuntimeConfig();

useSeoMeta({
	title: title + " - " + config.public.appName,
	description: description,
});
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