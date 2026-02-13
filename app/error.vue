<script setup lang="ts">
const error = useError();

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <NuxtLayout name="default">
    <UContainer class="py-12 text-center">
      <!-- Error Icon -->
      <div class="mb-8 flex justify-center">
        <div class="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
          <UIcon
            name="i-lucide-alert-circle"
            class="w-16 h-16 text-red-600 dark:text-red-400"
          />
        </div>
      </div>
    
      <!-- Error Code -->
      <div class="mb-4">
        <span class="text-6xl font-bold text-gray-900 dark:text-white">
          {{ error?.statusCode || error?.status || '500' }}
        </span>
      </div>
    
      <!-- Error Title -->
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {{ error?.message || 'Error inesperado' }}
      </h1>
    
      <!-- Error Description -->
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        {{ error?.statusText || 'Ha ocurrido un error inesperado.' }}
      </p>
    
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton
          size="lg"
          variant="soft"
          color="secondary"
          @click="() => $router.back()"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
          Volver atrás
        </UButton>
        <UButton
          size="lg"
          color="primary"
          @click="handleError"
        >
          <UIcon name="i-heroicons-home" class="w-5 h-5 mr-2" />
          Volver al inicio
        </UButton>
      </div>
    </UContainer>
  </NuxtLayout>
</template>
