<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const open = ref(false);

const links = [
	[
		{
			label: "Inicio",
      icon: "i-lucide-store",
			to: "/app",
			onSelect: () => {
				open.value = false;
			},
		},
		{
			label: "Historial",
      icon: "i-lucide-chart-line",
      to: "/app/sales",
			onSelect: () => {
				open.value = false;
			},
		},
		{
			label: "Productos",
      icon: "i-lucide-cake-slice",
			to: "/app/products",
			onSelect: () => {
				open.value = false;
			},
		},
    {
      label: "Credenciales",
      icon: "i-lucide-shield-check",
      to: "/app/settings",
      onSelect: () => {
        open.value = false;
      },
    },
	],
	[],
] satisfies NavigationMenuItem[][];

const groups = computed(() => [
	{
		id: "links",
		label: "Ir a",
		items: links.flat(),
	},
]);
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-linear-to-b from-pink-500/10 via-rose-500/5 to-transparent"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="">
          <AppLogo :collapsed="collapsed" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>