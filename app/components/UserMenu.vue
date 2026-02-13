<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
	collapsed?: boolean;
}>();

const colorMode = useColorMode();

const user = ref({
	name: "Administrador",
	avatar: {
		src: "https://github.com/administrador.png",
		alt: "Administrador Avatar",
	},
});

const items = computed<DropdownMenuItem[][]>(() => [
	[
		{
			type: "label",
			label: user.value.name,
			avatar: user.value.avatar,
		},
	],
	[
		{
			label: "Perfil",
			icon: "i-lucide-user",
			//   to: '/profile'
		},
		{
			label: "Ajustes",
			icon: "i-lucide-settings",
			//   to: '/settings'
		},
		{
			label: "Apariencia",
			icon: "i-lucide-sun-moon",
			children: [
				{
					label: "Claro",
					icon: "i-lucide-sun",
					type: "checkbox",
					checked: colorMode.value === "light",
					onSelect(e: Event) {
						e.preventDefault();

						colorMode.preference = "light";
					},
				},
				{
					label: "Oscuro",
					icon: "i-lucide-moon",
					type: "checkbox",
					checked: colorMode.value === "dark",
					onUpdateChecked(checked: boolean) {
						if (checked) {
							colorMode.preference = "dark";
						}
					},
					onSelect(e: Event) {
						e.preventDefault();
					},
				},
			],
		},
	],
	[
		{
			label: "Cerrar sesión",
			icon: "i-lucide-log-out",
		},
	],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>