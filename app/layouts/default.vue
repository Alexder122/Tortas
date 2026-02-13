<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Inicio',
  icon: 'i-lucide-house',
  to: '/app',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Niveles de dificultad',
  icon: 'i-lucide-list',
  to: '/app/difficulty-levels',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Grupos musculares',
  icon: 'i-lucide-list',
  to: '/app/muscle-groups',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Equipamiento',
  icon: 'i-lucide-list',
  to: '/app/equipment',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Ejercicios',
  icon: 'i-lucide-dumbbell',
  to: '/app/exercises',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Rutinas',
  icon: 'i-lucide-dumbbell',
  to: '/app/routines',
  onSelect: () => {
    open.value = false
  }
}], []] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Ir a',
  items: links.flat()
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
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