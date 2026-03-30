<template>
	<DashboardPanelBase id="credentials" title="Credenciales de acceso">
		<UCard class="mb-6 border-pink-200/70 bg-linear-to-r from-pink-100/70 to-white dark:from-pink-950/30 dark:to-transparent">
			<div class="flex items-center gap-3">
				<UIcon name="i-lucide-lock-keyhole" class="h-8 w-8 text-pink-500" />
				<div>
					<h2 class="text-lg font-bold">Seguridad de acceso</h2>
					<p class="text-sm text-muted">Actualiza correo y contrasena con una interfaz clara y elegante.</p>
				</div>
			</div>
		</UCard>

		<UCard>
			<template #header>
				<div>
					<h2 class="text-lg font-semibold">Actualizar credenciales</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Cambie correo y contrasena del usuario administrador.
					</p>
				</div>
			</template>

			<UForm id="credentials-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField label="Correo actual" name="currentEmail">
					<UInput :model-value="currentEmail" disabled class="w-full" />
				</UFormField>

				<UFormField label="Nuevo correo" name="nextEmail" required>
					<UInput v-model="state.nextEmail" type="email" placeholder="correo@dominio.com" class="w-full" />
				</UFormField>

				<UFormField label="Contrasena actual" name="currentPassword" required>
					<UInput
						v-model="state.currentPassword"
						type="password"
						placeholder="Ingrese su contrasena actual"
						class="w-full"
					/>
				</UFormField>

				<UFormField label="Nueva contrasena" name="nextPassword" required>
					<UInput
						v-model="state.nextPassword"
						type="password"
						placeholder="Minimo 8 caracteres"
						class="w-full"
					/>
				</UFormField>

				<UFormField label="Confirmar nueva contrasena" name="confirmPassword" required>
					<UInput
						v-model="state.confirmPassword"
						type="password"
						placeholder="Repita la nueva contrasena"
						class="w-full"
					/>
				</UFormField>

				<div class="flex justify-end pt-2">
					<UButton type="submit" icon="i-lucide-save" label="Guardar cambios" :loading="isSaving" />
				</div>
			</UForm>
		</UCard>
	</DashboardPanelBase>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const toast = useToast();
const { playSound } = useAudio();
const authUser = useCookie<string | null>("auth_user", {
	sameSite: "lax",
});
const isSaving = ref(false);

const schema = z
	.object({
		nextEmail: z.email("Ingrese un correo valido"),
		currentPassword: z.string().min(8, "La contrasena actual es obligatoria"),
		nextPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres"),
		confirmPassword: z.string().min(8, "La confirmacion es obligatoria"),
	})
	.refine((value) => value.nextPassword === value.confirmPassword, {
		message: "La confirmacion no coincide con la nueva contrasena",
		path: ["confirmPassword"],
	});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
	nextEmail: "",
	currentPassword: "",
	nextPassword: "",
	confirmPassword: "",
});

const { data, refresh } = await useFetch<{ email: string }>("/api/auth/credentials", {
	method: "GET",
});

const currentEmail = computed(() => data.value?.email ?? "");

watch(
	() => data.value?.email,
	(value) => {
		if (value) {
			state.nextEmail = value;
		}
	},
	{ immediate: true },
);

const resetPasswords = () => {
	state.currentPassword = "";
	state.nextPassword = "";
	state.confirmPassword = "";
};

const onSubmit = async (_event: FormSubmitEvent<Schema>) => {
	isSaving.value = true;
	try {
		const response = await $fetch<{ ok: boolean; email: string }>("/api/auth/credentials", {
			method: "PUT",
			body: {
				currentPassword: state.currentPassword,
				nextEmail: state.nextEmail,
				nextPassword: state.nextPassword,
				confirmPassword: state.confirmPassword,
			},
		});

		authUser.value = response.email;
		await refresh();
		resetPasswords();
		playSound('success');
		toast.add({
			title: "Credenciales actualizadas",
			description: "Los datos de acceso se guardaron correctamente.",
			color: "success",
		});
	} catch (error: any) {
		toast.add({
			title: "No se pudo actualizar",
			description: error?.data?.message ?? "Revise la informacion e intente de nuevo.",
			color: "error",
		});
	} finally {
		isSaving.value = false;
	}
};
</script>
