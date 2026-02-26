<template>
  <DashboardPanelBase id="sales-history" title="Historial de Ventas">
    <!-- Tabs para cambiar entre vistas -->
    <div class="mb-6">
      <UTabs
        :items="tabItems"
        v-model="activeTab"
        class="w-full"
      />
    </div>

    <!-- FILTROS - Siempre visibles en ambos tabs -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
      <div class="flex flex-col sm:flex-row gap-4">
        <UFormField label="Fecha desde">
          <UInput
            v-model="dateFrom"
            type="date"
            class="w-full sm:w-auto"
          />
        </UFormField>
        <UFormField label="Fecha hasta">
          <UInput
            v-model="dateTo"
            type="date"
            class="w-full sm:w-auto"
          />
        </UFormField>
        <UButton
          icon="i-lucide-filter"
          color="primary"
          variant="soft"
          @click="applyDateFilter"
        >
          Filtrar
        </UButton>
        <UButton
          v-if="dateFrom || dateTo"
          icon="i-lucide-x"
          color="error"
          variant="ghost"
          @click="clearDateFilter"
        >
          Limpiar
        </UButton>
      </div>
      
      <UButton
        icon="i-lucide-refresh-cw"
        color="secondary"
        variant="soft"
        @click="refreshData"
      >
        Actualizar
      </UButton>
    </div>

    <!-- MÉTRICAS - Siempre visibles (fuera del tab) -->
    <div class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <UIcon name="i-lucide-shopping-bag" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Ventas</p>
              <p class="text-2xl font-bold">{{ metrics.totalSales }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
              <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
              <p class="text-2xl font-bold">${{ metrics.totalRevenue.toLocaleString() }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3 bg-info-100 dark:bg-info-900/20 rounded-lg">
              <UIcon name="i-lucide-package" class="w-6 h-6 text-info-600 dark:text-info-400" />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Productos Vendidos</p>
              <p class="text-2xl font-bold">{{ metrics.totalProducts }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- CONTENIDO DE TABS -->
    
    <!-- Tab: Gráficos (anteriormente Métricas) -->
    <div v-if="activeTab === 0" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Ventas por día -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Ventas por Día</h3>
          </template>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <p>Gráfico de ventas (próximamente)</p>
          </div>
        </UCard>

        <!-- Productos más vendidos -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Productos más Vendidos</h3>
          </template>
          <div class="space-y-4">
            <div v-for="product in metrics.topProducts" :key="product.id" class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ product.name }}</p>
                <p class="text-sm text-gray-500">{{ product.quantity }} unidades</p>
              </div>
              <p class="font-semibold text-primary-600">${{ product.revenue.toLocaleString() }}</p>
            </div>
            <div v-if="metrics.topProducts.length === 0" class="text-center py-8 text-gray-500">
              No hay datos suficientes
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Tab: Registros -->
    <div v-else-if="activeTab === 1" class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 class="text-lg font-semibold">Registro de Ventas</h3>
            <UInput
              v-model="tableSearch"
              placeholder="Buscar en ventas..."
              icon="i-lucide-search"
              class="w-full sm:w-64"
            />
          </div>
        </template>

        <UTable
          :loading="pending"
          :columns="columns"
          :rows="paginatedSales"
          class="w-full"
        >
          <template #total-data="{ row }">
            <span class="font-semibold text-primary-600">${{ Number(row.total).toLocaleString() }}</span>
          </template>

          <template #created_at-data="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>

          <template #items-data="{ row }">
            <UPopover>
              <UButton color="primary" variant="soft" size="xs">
                {{ row.items?.length || 0 }} productos
              </UButton>
              <template #panel>
                <div class="p-4 max-w-xs">
                  <p class="font-semibold mb-2">Productos:</p>
                  <div v-for="item in row.items" :key="item.id" class="text-sm mb-2">
                    <p>{{ item.product?.name }} x{{ item.quantity }}</p>
                    <p class="text-gray-500">${{ Number(item.subtotal).toLocaleString() }}</p>
                  </div>
                </div>
              </template>
            </UPopover>
          </template>

          <template #actions-data="{ row }">
            <UDropdown :items="actionItems(row)">
              <UButton color="secondary" variant="soft" icon="i-lucide-more-vertical" size="xs" />
            </UDropdown>
          </template>
        </UTable>

        <!-- Paginación -->
        <div class="flex justify-between items-center mt-4">
          <p class="text-sm text-gray-500">
            Mostrando {{ paginatedSales.length }} de {{ filteredSales.length }} ventas
          </p>
          <UPagination
            v-model="page"
            :page-count="pageSize"
            :total="filteredSales.length"
          />
        </div>
      </UCard>
    </div>
  </DashboardPanelBase>
</template>

<script setup lang="ts">
const toast = useToast();
const activeTab = ref(0); // 0 = Gráficos, 1 = Registros
const dateFrom = ref('');
const dateTo = ref('');
const tableSearch = ref('');
const page = ref(1);
const pageSize = ref(10);

// Items para los tabs
const tabItems = [
  { label: 'Gráficos', icon: 'i-lucide-bar-chart-3' },
  { label: 'Registros', icon: 'i-lucide-table' },
];

// Columnas de la tabla
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'created_at', label: 'Fecha' },
  { key: 'items', label: 'Productos' },
  { key: 'total', label: 'Total' },
  { key: 'actions', label: 'Acciones' },
];

// Obtener ventas
const { data: sales, pending, refresh } = await useAsyncData(
  'sales-history',
  async () => {
    let url = '/api/sales';
    const params = new URLSearchParams();
    
    if (dateFrom.value) params.append('from', dateFrom.value);
    if (dateTo.value) params.append('to', dateTo.value);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return $fetch(url);
  }
);

// Ventas filtradas por búsqueda
const filteredSales = computed(() => {
  if (!sales.value) return [];
  if (!tableSearch.value) return sales.value;
  
  const search = tableSearch.value.toLowerCase();
  return sales.value.filter((sale: any) => {
    return (
      sale.id.toString().includes(search) ||
      sale.items?.some((item: any) => 
        item.product?.name.toLowerCase().includes(search)
      )
    );
  });
});

// Ventas paginadas
const paginatedSales = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSales.value.slice(start, end);
});

// Calcular métricas
const metrics = computed(() => {
  if (!sales.value) {
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalProducts: 0,
      topProducts: []
    };
  }

  const totalSales = sales.value.length;
  const totalRevenue = sales.value.reduce((sum: number, sale: any) => 
    sum + Number(sale.total), 0
  );
  
  // Contar productos vendidos
  const productCount: Record<number, { id: number; name: string; quantity: number; revenue: number }> = {};
  
  sales.value.forEach((sale: any) => {
    sale.items?.forEach((item: any) => {
      if (!productCount[item.product_id]) {
        productCount[item.product_id] = {
          id: item.product_id,
          name: item.product?.name || 'Producto',
          quantity: 0,
          revenue: 0
        };
      }
      productCount[item.product_id].quantity += item.quantity;
      productCount[item.product_id].revenue += Number(item.subtotal);
    });
  });

  const totalProducts = Object.values(productCount).reduce(
    (sum: number, p: any) => sum + p.quantity, 0
  );

  // Top 5 productos más vendidos
  const topProducts = Object.values(productCount)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalSales,
    totalRevenue,
    totalProducts,
    topProducts
  };
});

// Aplicar filtro de fechas
const applyDateFilter = () => {
  page.value = 1;
  refresh();
  toast.add({
    title: 'Filtro aplicado',
    description: 'Datos actualizados con el rango de fechas',
    color: 'success',
  });
};

// Limpiar filtro de fechas
const clearDateFilter = () => {
  dateFrom.value = '';
  dateTo.value = '';
  page.value = 1;
  refresh();
};

// Actualizar datos
const refreshData = () => {
  page.value = 1;
  refresh();
  toast.add({
    title: 'Datos actualizados',
    description: 'La información se ha refrescado correctamente',
    color: 'success',
  });
};

// Acciones para cada fila
const actionItems = (row: any) => [
  [{
    label: 'Ver detalles',
    icon: 'i-lucide-eye',
    click: () => {
      toast.add({
        title: 'Venta #' + row.id,
        description: `Total: $${Number(row.total).toLocaleString()}`,
        color: 'info',
      });
    }
  }],
  [{
    label: 'Imprimir ticket',
    icon: 'i-lucide-printer',
    click: () => {
      toast.add({
        title: 'Imprimiendo...',
        description: 'Funcionalidad próximamente',
        color: 'warning',
      });
    }
  }]
];
</script>