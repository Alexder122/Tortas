<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
	layout: "auth",
});

const router = useRouter();
const toast = useToast();
const authUser = useCookie<string | null>("auth_user", {
	sameSite: "lax",
});

const fields: AuthFormField[] = [
	{
		name: "email",
		type: "email",
		label: "Correo electrónico",
		placeholder: "Ingrese su correo electrónico",
		required: true,
	},
	{
		name: "password",
		label: "Contraseña",
		type: "password",
		placeholder: "Ingrese su contraseña",
		required: true,
	},
	{
		name: "remember",
		label: "Recuérdame",
		type: "checkbox",
	},
];

const schema = z.object({
	email: z.email("Correo electrónico inválido"),
	password: z
		.string("La contraseña es obligatoria")
		.min(8, "Debe tener al menos 8 caracteres"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
	try {
		const response = await $fetch<{ ok: boolean; email: string }>("/api/auth/login", {
			method: "POST",
			body: {
				email: payload.data.email,
				password: payload.data.password,
			},
		});

		authUser.value = response.email;
		router.push("/app");
	} catch {
		toast.add({
			title: "Credenciales incorrectas",
			description: "Verifique su correo y contrasena.",
			color: "error",
		});
	}
}
</script>

<template>
	<UPageCard class="w-full max-w-md border-pink-200/70 bg-linear-to-b from-pink-50 to-white dark:from-pink-950/30 dark:to-transparent">
    <UAuthForm
      :schema="schema"
      title="Iniciar sesión"
      description="Ingrese sus credenciales para acceder a su cuenta."
			icon="i-lucide-sparkles"
      :fields="fields"
      @submit="onSubmit"
    />
  </UPageCard>
</template>

