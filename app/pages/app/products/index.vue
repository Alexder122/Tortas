<template>
    <DashboardPanelBase id="products" title="Productos">
        <template #header-right>
            <UButton icon="i-lucide-plus" label="Nuevo Producto" size="md" :ui="{
                label: 'hidden sm:inline-block'
            }" @click="openCreateModal" />
        </template>

        <!-- Barra de búsqueda -->
        <div class="mb-6">
            <FormInputSearch v-model="searchQuery" placeholder="Buscar productos..." />
        </div>

        <!-- Grid de cards de productos -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <UCard v-for="product in filteredProducts" :key="product.id" class="hover:shadow-lg transition-shadow">
                <template #header>
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ product.name }}
                                </h3>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="space-y-4">
                    <!-- Costo del producto -->
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500 dark:text-gray-400">Costo:</span>
                        <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            ${{ Number(product.cost).toLocaleString() }}
                        </span>
                    </div>

                    <!-- Fecha de creación -->
                    <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Creado</p>
                        <p class="text-sm font-medium">{{ new Date(product.created_at).toLocaleDateString() }}</p>
                    </div>
                </div>

                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <UTooltip text="Editar">
                            <UButton icon="i-lucide-pencil" size="sm" color="secondary" variant="soft"
                                @click="openEditModal(product)" />
                        </UTooltip>
                        <UTooltip text="Eliminar">
                            <UButton icon="i-lucide-trash" size="sm" color="error" variant="soft"
                                @click="openDeleteModal(product)" />
                        </UTooltip>
                    </div>
                </template>
            </UCard>
        </div>

        <!-- Mensaje cuando no hay productos -->
        <div v-if="filteredProducts.length === 0" class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">
                {{ searchQuery ? 'No se encontraron productos' : 'No hay productos creados' }}
            </p>
            <UButton v-if="!searchQuery" icon="i-lucide-plus" label="Crear primer producto" class="mt-4"
                @click="openCreateModal" />
        </div>

        <!-- Modal para crear/editar producto -->
        <UModal v-model:open="isModalOpen"
            :title="isEditMode ? 'Editar Producto' : 'Nuevo Producto'"
            :description="isEditMode ? 'Modifica los datos del producto' : 'Completa el formulario para crear un nuevo producto'"
            :ui="{ footer: 'justify-end' }">
            <template #body>
                <UForm id="product-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                    <!-- Nombre -->
                    <UFormField label="Nombre" name="name" required>
                        <UInput v-model="state.name" placeholder="Ej: Producto básico" class="w-full" size="lg" />
                    </UFormField>

                    <!-- Costo -->
                    <UFormField label="Costo" name="cost" required>
                        <UInput 
                            v-model.number="state.cost" 
                            type="number" 
                            placeholder="0.00" 
                            class="w-full" 
                            size="lg"
                            min="0"
                            step="0.01"
                        >
                            <template #leading>
                                <span class="text-gray-500 dark:text-gray-400">$</span>
                            </template>
                        </UInput>
                    </UFormField>
                </UForm>
            </template>

            <template #footer>
                <UButton color="secondary" variant="soft" label="Cancelar" :disabled="isSubmittingForm" @click="isModalOpen = false" />
                <UButton type="submit" icon="i-lucide-save" :label="isEditMode ? 'Actualizar' : 'Crear'"
                    :loading="isSubmittingForm" form="product-form" />
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
                            ¿Estás seguro de que deseas eliminar el producto
                            <span class="font-semibold">{{ productToDelete?.name }}</span>?
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
            </template>

            <template #footer>
                <UButton color="secondary" variant="soft" label="Cancelar" @click="isDeleteModalOpen = false" />
                <UButton color="error" icon="i-lucide-trash" label="Eliminar" @click="confirmDelete" />
            </template>
        </UModal>
    </DashboardPanelBase>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const toast = useToast();

// Esquema de validación con Zod simplificado
const schema = z.object({
    id: z.number().optional(),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    cost: z.number({
        required_error: "El costo es requerido",
        invalid_type_error: "Debe ingresar un número válido"
    }).min(0, "El costo debe ser mayor o igual a 0"),
});

type Schema = z.output<typeof schema>;

// Estado del modal y formulario
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isDeleteModalOpen = ref(false);
const isSubmittingForm = ref(false);
const selectedProduct = ref<Schema | null>(null);
const productToDelete = ref<Schema | null>(null);

// Datos del formulario
const state = reactive({
    name: "",
    cost: 0,
});

const { data: products, refresh } = await useFetch(
    "/api/products",
    {
        method: "get",
    },
);

// Función para abrir modal de crear
const openCreateModal = () => {
    isEditMode.value = false;
    selectedProduct.value = null;
    Object.assign(state, {
        name: "",
        cost: 0,
    });
    isModalOpen.value = true;
};

// Función para abrir modal de editar
const openEditModal = (product: Schema) => {
    isEditMode.value = true;
    selectedProduct.value = product;
    Object.assign(state, {
        name: product.name,
        cost: Number(product.cost),
    });
    isModalOpen.value = true;
};

// Función para guardar con validación
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    isSubmittingForm.value = true;
    
    try {
        const productData = {
            name: state.name,
            cost: state.cost,
        };
        
        if (isEditMode.value && selectedProduct.value) {
            await $fetch(`/api/products/${selectedProduct.value.id}`, {
                method: "PUT",
                body: productData,
            });
            
            toast.add({
                title: "Producto actualizado",
                description: "El producto se actualizó exitosamente",
                color: "success",
            });
        } else {
            await $fetch("/api/products", {
                method: "POST",
                body: productData,
            });
            
            toast.add({
                title: "Producto creado",
                description: "El producto se creó exitosamente",
                color: "success",
            });
        }

        await refresh();
        isModalOpen.value = false;
    } catch (error: any) {
        console.error("Error al guardar:", error);
        toast.add({
            title: "Error",
            description: error.data?.message || "Ocurrió un error al guardar el producto",
            color: "error",
        });
    } finally {
        isSubmittingForm.value = false;
    }
};

// Función para abrir modal de confirmación de eliminación
const openDeleteModal = (product: Schema) => {
    productToDelete.value = product;
    isDeleteModalOpen.value = true;
};

// Función para confirmar eliminación
const confirmDelete = async () => {
    if (!productToDelete.value) return;

    try {
        await $fetch(`/api/products/${productToDelete.value.id}`, {
            method: "DELETE",
        });

        toast.add({
            title: "Producto eliminado",
            description: "El producto se eliminó exitosamente",
            color: "success",
        });

        await refresh();
        isDeleteModalOpen.value = false;
        productToDelete.value = null;
    } catch (error) {
        toast.add({
            title: "Error",
            description: "No se pudo eliminar el producto",
            color: "error",
        });
    }
};

// Filtro de búsqueda
const searchQuery = ref("");
const filteredProducts = computed(() => {
    if (!products.value) return [];
    if (!searchQuery.value) return products.value;

    return products.value.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
});
</script>