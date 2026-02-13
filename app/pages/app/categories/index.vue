<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const toast = useToast();

// Esquema de validación con Zod
const schema = z.object({
	id: z.number().optional(),
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	description: z.string().optional(),
	order: z
		.number("Se debe ingresar un número mayor a 0")
		.min(1, "El orden debe ser mayor a 0"),
});

type Schema = z.output<typeof schema>;

// Estado del modal y formulario
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isDeleteModalOpen = ref(false);
const isSubmittingLevelForm = ref(false);
const selectedLevel = ref<Schema | null>(null);
const levelToDelete = ref<Schema | null>(null);

// Datos del formulario
const state = reactive({
	name: "",
	description: "",
	order: 1,
});

const { data: difficultyLevels, refresh } = await useFetch(
	"/api/difficulty-levels",
	{
		method: "get",
	},
);

// Ordenar por orden
const sortedLevels = computed(() => {
	if (!difficultyLevels.value) return [];
	return [...difficultyLevels.value].sort((a, b) => a.order - b.order);
});

// Función para abrir modal de crear
const openCreateModal = () => {
	isEditMode.value = false;
	selectedLevel.value = null;
	Object.assign(state, {
		name: "",
		description: "",
		order: sortedLevels.value.length + 1,
	});
	isModalOpen.value = true;
};

// Función para abrir modal de editar
const openEditModal = (level: Schema | null) => {
	isEditMode.value = true;
	selectedLevel.value = level;
	Object.assign(state, {
		name: level?.name ?? "",
		description: level?.description ?? "",
		order: level?.order ?? 1,
	});
	isModalOpen.value = true;
};

// Función para guardar con validación
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	isSubmittingLevelForm.value = true;
	try {
		if (isEditMode.value && selectedLevel.value) {
			// Actualizar nivel existente
			await $fetch(`/api/difficulty-levels/${selectedLevel.value.id}`, {
				method: "PUT",
				body: {
					name: state.name,
					description: state.description,
					order: state.order,
				},
			});

			toast.add({
				title: "Nivel actualizado",
				description: "El nivel de dificultad se actualizó exitosamente",
				color: "success",
			});
		} else {
			// Crear nuevo nivel
			await $fetch("/api/difficulty-levels", {
				method: "POST",
				body: {
					name: state.name,
					description: state.description,
					order: state.order,
				},
			});

			toast.add({
				title: "Nivel creado",
				description: "El nivel de dificultad se creó exitosamente",
				color: "success",
			});
		}

		await refresh();
		isModalOpen.value = false;
	} catch (error) {
		toast.add({
			title: "Error",
			description: "Ocurrió un error al guardar el nivel de dificultad",
			color: "error",
		});
	} finally {
		isSubmittingLevelForm.value = false;
	}
};

// Función para abrir modal de confirmación de eliminación
const openDeleteModal = (level: Schema | null) => {
	levelToDelete.value = level;
	isDeleteModalOpen.value = true;
};

// Función para confirmar eliminación
const confirmDelete = async () => {
	if (!levelToDelete.value) return;

	try {
		await $fetch(`/api/difficulty-levels/${levelToDelete.value.id}`, {
			method: "DELETE",
		});

		toast.add({
			title: "Nivel eliminado",
			description: "El nivel de dificultad se eliminó exitosamente",
			color: "success",
		});

		await refresh();
		isDeleteModalOpen.value = false;
		levelToDelete.value = null;
	} catch (error) {
		toast.add({
			title: "Error",
			description: "No se pudo eliminar el nivel de dificultad",
			color: "error",
		});
	}
};

// Filtro de búsqueda
const searchQuery = ref("");
const filteredLevels = computed(() => {
	if (!searchQuery.value) return sortedLevels.value;

	return sortedLevels.value.filter((level) =>
		level.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
});
</script>

<template>
    <DashboardPanelBase id="difficulty-levels" title="Niveles de Dificultad">
        <template #header-right>
            <UButton icon="i-lucide-plus" label="Nuevo Nivel" size="md" :ui="{
                label: 'hidden sm:inline-block'
            }" @click="openCreateModal" />
        </template>

        <!-- Barra de búsqueda -->
        <div class="mb-6">
            <FormInputSearch v-model="searchQuery" placeholder="Buscar niveles de dificultad..." />
        </div>

        <!-- Grid de cards de niveles -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <UCard v-for="level in filteredLevels" :key="level.id" class="hover:shadow-lg transition-shadow">
                <template #header>
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <UBadge :label="level.order.toString()" size="sm" color="info" />
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ level.name }}
                                </h3>
                            </div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                {{ level.description || 'Sin descripción' }}
                            </p>
                        </div>
                    </div>
                </template>

                <div class="space-y-2">
                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Creado</p>
                        <p class="text-sm font-medium">{{ new Date(level.created_at).toLocaleDateString() }}</p>
                    </div>
                </div>

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UTooltip text="Editar">
                            <UButton icon="i-lucide-pencil" size="sm" color="secondary" variant="soft"
                                @click="openEditModal(level as Schema)" />
                        </UTooltip>
                        <UTooltip text="Eliminar">
                            <UButton icon="i-lucide-trash" size="sm" color="error" variant="soft"
                                @click="openDeleteModal(level as Schema)" />
                        </UTooltip>
                    </div>
                </template>
            </UCard>
        </div>

        <!-- Mensaje cuando no hay niveles -->
        <div v-if="filteredLevels.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">
                {{ searchQuery ? 'No se encontraron niveles de dificultad' : 'No hay niveles de dificultad creados' }}
            </p>
            <UButton v-if="!searchQuery" icon="i-lucide-plus" label="Crear primer nivel" class="mt-4"
                @click="openCreateModal" />
        </div>

        <!-- Modal para crear/editar nivel -->
        <UModal v-model:open="isModalOpen"
            :title="isEditMode ? 'Editar Nivel de Dificultad' : 'Nuevo Nivel de Dificultad'"
            :description="isEditMode ? 'Modifica los datos del nivel de dificultad' : 'Completa el formulario para crear un nuevo nivel de dificultad'"
            :ui="{ footer: 'justify-end' }">
            <template #body>
                <UForm id="level-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit" >
                    <!-- Nombre -->
                    <UFormField label="Nombre" name="name" required>
                        <UInput v-model="state.name" placeholder="Ej: Principiante" class="w-full" size="lg" />
                    </UFormField>

                    <!-- Descripción -->
                    <UFormField label="Descripción" name="description">
                        <UTextarea v-model="state.description" placeholder="Describe el nivel de dificultad..."
                            class="w-full" :rows="3" />
                    </UFormField>

                    <!-- Orden -->
                    <UFormField label="Orden" name="order" required>
                        <UInput v-model.number="state.order" type="number" placeholder="1" class="w-full" size="lg"
                            min="1" />
                    </UFormField>
                </UForm>
            </template>

            <template #footer>
                <UButton color="secondary" variant="soft" label="Cancelar" :disabled="isSubmittingLevelForm" @click="isModalOpen = false" />
                <UButton type="submit" icon="i-lucide-save" :label="isEditMode ? 'Actualizar' : 'Crear'"
                    :loading="isSubmittingLevelForm" form="level-form" />
            </template>
        </UModal>

        <!-- Modal de confirmación de eliminación -->
        <UModal v-model:open="isDeleteModalOpen" title="Confirmar eliminación"
            description="Esta acción es permanente y no se puede revertir" :ui="{ footer: 'justify-end' }">
            <template #body>
                <div class="flex items-start gap-3 mb-4">
                    <div class="p-2 bg-error-100 dark:bg-error-900/20 rounded-lg">
                        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error-600 dark:text-error-400" />
                    </div>
                    <div class="flex-1">
                        <p class="text-gray-700 dark:text-gray-300">
                            ¿Estás seguro de que deseas eliminar el nivel de dificultad
                            <span class="font-semibold">{{ levelToDelete?.name }}</span>?
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
            </template>

            <template #footer>
                <UButton color="secondary" variant="soft" label="Cancelar" @click="isDeleteModalOpen = false" />
                <UButton color="error" icon="i-lucide-trash" label="Eliminar" loading-auto @click="confirmDelete" />
            </template>
        </UModal>
    </DashboardPanelBase>
</template>