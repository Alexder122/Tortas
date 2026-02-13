<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
	layout: "auth",
});

const router = useRouter();
const toast = useToast();

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

function onSubmit(payload: FormSubmitEvent<Schema>) {
	// TODO: Implementar lógica de autenticación con Supabase

	router.push("/app");
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="schema"
      title="Iniciar sesión"
      description="Ingrese sus credenciales para acceder a su cuenta."
      icon="i-lucide-user"
      :fields="fields"
      @submit="onSubmit"
    />
  </UPageCard>
</template>

