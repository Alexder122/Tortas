<template>
  <DashboardPanelBase id="sales-history" title="Historial de Ventas">
    <UCard class="mb-6 overflow-hidden border-0 bg-linear-to-r from-pink-500/20 via-rose-400/10 to-transparent">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm text-pink-600 dark:text-pink-300">Panel de ventas</p>
          <h2 class="text-2xl font-extrabold tracking-tight">Vista rapida del negocio</h2>
          <p class="mt-1 text-sm text-muted">Simple, visual y pensada para tomar decisiones al instante.</p>
        </div>

        <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
            variant="pill"
            color="primary"
            class="w-full sm:w-auto"
            :ui="{ indicator: 'bg-pink-500/90' }"
          />

          <UButton
            icon="i-lucide-refresh-cw"
            color="primary"
            variant="soft"
            :loading="pending"
            @click="refreshData"
          >
            Actualizar
          </UButton>
        </div>
      </div>
    </UCard>

    <div class="mb-6 space-y-4">
      <!-- Filtros rápidos -->
      <div class="flex flex-wrap gap-2">
        <span class="text-sm font-medium text-muted">Filtros rápidos:</span>
        <UButton
          v-for="preset in datePresets"
          :key="preset.label"
          :color="activeDatePreset === preset.label ? 'primary' : 'neutral'"
          :variant="activeDatePreset === preset.label ? 'soft' : 'ghost'"
          size="sm"
          @click="applyDatePreset(preset)"
        >
          {{ preset.label }}
        </UButton>
      </div>

      <!-- Filtros personalizados -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <UFormField label="Fecha desde">
          <UInput v-model="dateFrom" type="date" class="w-full" size="sm" />
        </UFormField>
        <UFormField label="Fecha hasta">
          <UInput v-model="dateTo" type="date" class="w-full" size="sm" />
        </UFormField>
        <div class="flex items-end gap-2">
          <UButton icon="i-lucide-filter" color="primary" class="w-full sm:w-auto" size="sm" @click="applyDateFilter">
            Aplicar
          </UButton>
          <UButton
            v-if="dateFrom || dateTo"
            icon="i-lucide-eraser"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="clearDateFilter"
          >
            Limpiar
          </UButton>
        </div>
      </div>
    </div>

    <div class="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UCard class="border-pink-200/60 bg-linear-to-br from-pink-50 to-white dark:from-pink-950/25 dark:to-transparent">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-wide text-muted font-semibold">Cantidad de ventas</p>
            <p class="mt-2 text-3xl font-black text-pink-600">{{ metrics.totalSales }}</p>
            <p class="mt-1 text-xs text-muted">Transacciones registradas</p>
          </div>
          <UIcon name="i-lucide-shopping-bag" class="h-7 w-7 text-pink-500 shrink-0" />
        </div>
      </UCard>

      <UCard class="border-rose-200/60 bg-linear-to-br from-rose-50 to-white dark:from-rose-950/25 dark:to-transparent">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-wide text-muted font-semibold">Ingresos totales</p>
            <p class="mt-2 text-3xl font-black text-rose-600">${{ metrics.totalRevenue.toLocaleString() }}</p>
            <p class="mt-1 text-xs text-muted">Dinero total recaudado</p>
          </div>
          <UIcon name="i-lucide-wallet-cards" class="h-7 w-7 text-pink-500 shrink-0" />
        </div>
      </UCard>

      <UCard class="border-fuchsia-200/60 bg-linear-to-br from-fuchsia-50 to-white dark:from-fuchsia-950/25 dark:to-transparent">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-wide text-muted font-semibold">Unidades vendidas</p>
            <p class="mt-2 text-3xl font-black text-fuchsia-600">{{ metrics.totalProducts }}</p>
            <p class="mt-1 text-xs text-muted">Productos totales</p>
          </div>
          <UIcon name="i-lucide-candy" class="h-7 w-7 text-fuchsia-500 shrink-0" />
        </div>
      </UCard>

      <UCard class="border-pink-200/60 bg-linear-to-br from-pink-100/70 to-white dark:from-pink-950/30 dark:to-transparent">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-wide text-muted font-semibold">Promedio por venta</p>
            <p class="mt-2 text-3xl font-black text-pink-600">${{ metrics.avgTicket.toLocaleString() }}</p>
            <p class="mt-1 text-xs text-muted">Monto promedio por transacción</p>
          </div>
          <UIcon name="i-lucide-wheat" class="h-7 w-7 text-pink-500 shrink-0" />
        </div>
      </UCard>
    </div>

    <section v-show="activeTab === 'charts'" class="space-y-6">
      <ClientOnly>
        <SalesD3Panel
          :daily-series="dailySeries"
          :top-series="metrics.topProducts"
          @range-change="onBrushRangeChange"
        />

        <template #fallback>
          <UCard>
            <div class="h-72 flex items-center justify-center text-muted">Cargando vista visual...</div>
          </UCard>
        </template>
      </ClientOnly>
    </section>

    <section v-show="activeTab === 'records'" class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 class="text-lg font-semibold">Detalle de ventas</h3>
              <p class="text-sm text-muted mt-1">{{ filteredSales.length }} transacciones {{ dateFrom || dateTo ? 'filtradas' : 'registradas' }}</p>
            </div>
            <UInput
              v-model="tableSearch"
              placeholder="Buscar venta por ID..."
              icon="i-lucide-search"
              class="w-full md:w-64"
            />
          </div>
        </template>

        <UTable :loading="pending" :columns="columns" :data="paginatedSales" class="w-full">
          <template #id-cell="{ row }">
            <div class="font-mono font-bold text-pink-600">{{ String(row.original.id).padStart(6, '0') }}</div>
          </template>

          <template #created_at-cell="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="font-medium">{{ new Date((row.original as Sale).created_at).toLocaleDateString() }}</span>
              <span class="text-xs text-muted">{{ new Date((row.original as Sale).created_at).toLocaleTimeString() }}</span>
            </div>
          </template>

          <template #items-cell="{ row }">
            <UPopover>
              <UButton color="primary" variant="soft" size="xs">
                {{ (row.original as Sale).items.length }} productos
              </UButton>

              <template #content>
                <div class="max-h-80 w-80 space-y-2.5 overflow-y-auto p-4">
                  <div v-for="item in (row.original as Sale).items" :key="item.id" class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm truncate">{{ item.product.name }}</p>
                        <div class="flex items-center gap-2 mt-1 text-xs text-muted">
                          <span>{{ item.quantity }} unidad<span v-if="item.quantity > 1">es</span></span>
                          <span>•</span>
                          <span>${{ Number(item.unit_price).toLocaleString() }} c/u</span>
                        </div>
                      </div>
                      <span class="font-bold text-pink-600 whitespace-nowrap">${{ Number(item.subtotal).toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </UPopover>
          </template>

          <template #total-cell="{ row }">
            <span class="font-bold text-lg text-green-600">
              ${{ Number((row.original as Sale).total).toLocaleString() }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="actionItems(row.original as Sale)">
              <UButton color="neutral" variant="ghost" icon="i-lucide-more-vertical" size="xs" />
            </UDropdownMenu>
          </template>
        </UTable>

        <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold">
              Página {{ page }} de {{ Math.ceil(filteredSales.length / pageSize) || 1 }}
            </p>
            <p class="text-xs text-muted">
              Mostrando {{ paginatedSales.length }} de {{ filteredSales.length }} ventas
              <span v-if="dateFrom || dateTo">(filtradas)</span>
            </p>
          </div>
          <UPagination v-model="page" :page-count="pageSize" :total="filteredSales.length" />
        </div>
      </UCard>
    </section>
  </DashboardPanelBase>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn, TabsItem } from "@nuxt/ui";

const toast = useToast();
const { playSound } = useAudio();

type SaleItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    cost: string;
  };
};

type Sale = {
  id: number;
  total: string;
  created_at: string;
  items: SaleItem[];
};

type SalesTab = "charts" | "records";

const activeTab = ref<SalesTab>("charts");
const tabItems: TabsItem[] = [
  { label: "Graficas", icon: "i-lucide-chart-line", value: "charts" },
  { label: "Registros", icon: "i-lucide-receipt-text", value: "records" },
];

const datePresets = [
  {
    label: "Hoy",
    getValue: () => {
      const today = new Date();
      return {
        from: today.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Esta semana",
    getValue: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      return {
        from: monday.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Este mes",
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        from: firstDay.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Últimos 30 días",
    getValue: () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: thirtyDaysAgo.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    },
  },
];

const activeDatePreset = ref<string | null>(null);

const dateFrom = ref("");
const dateTo = ref("");
const tableSearch = ref("");
const page = ref(1);
const pageSize = ref(10);

const salesApiUrl = computed(() => {
  const params = new URLSearchParams();
  if (dateFrom.value) params.set("from", dateFrom.value);
  if (dateTo.value) params.set("to", dateTo.value);
  const query = params.toString();
  return query ? `/api/sales?${query}` : "/api/sales";
});

const { data: sales, pending, refresh } = await useAsyncData<Sale[]>(
  "sales-history",
  () => $fetch<Sale[]>(salesApiUrl.value),
  { default: () => [] },
);

const filteredSales = computed(() => {
  const source = sales.value ?? [];
  const search = tableSearch.value.trim().toLowerCase();

  if (!search) return source;

  return source.filter((sale) => {
    const idMatch = sale.id.toString().includes(search);
    const productMatch = sale.items.some((item) => item.product.name.toLowerCase().includes(search));
    return idMatch || productMatch;
  });
});

const paginatedSales = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredSales.value.slice(start, start + pageSize.value);
});

const metrics = computed(() => {
  const source = sales.value ?? [];
  const byProduct: Record<number, { id: number; name: string; quantity: number; revenue: number }> = {};

  for (const sale of source) {
    for (const item of sale.items) {
      const current = byProduct[item.product.id] ?? {
        id: item.product.id,
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += Number(item.quantity);
      current.revenue += Number(item.subtotal);
      byProduct[item.product.id] = current;
    }
  }

  const topSorted = Object.values(byProduct).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const maxTopQty = topSorted[0]?.quantity ?? 1;
  const totalSales = source.length;
  const totalRevenue = source.reduce((sum, sale) => sum + Number(sale.total), 0);

  return {
    totalSales,
    totalRevenue,
    totalProducts: Object.values(byProduct).reduce((sum, product) => sum + product.quantity, 0),
    avgTicket: totalSales > 0 ? Number((totalRevenue / totalSales).toFixed(2)) : 0,
    topProducts: topSorted.map((product) => ({
      ...product,
      width: Math.max(10, Math.round((product.quantity / maxTopQty) * 100)),
    })),
  };
});

const dailySeries = computed(() => {
  const source = sales.value ?? [];
  const map = new Map<string, number>();

  for (const sale of source) {
    const date = new Date(sale.created_at);
    const key = date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + Number(sale.total));
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({ date, total }));
});

const columns: TableColumn<Sale>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "created_at", header: "Fecha" },
  { accessorKey: "items", header: "Productos" },
  { accessorKey: "total", header: "Total" },
  { id: "actions", header: "Acciones" },
];

const actionItems = (row: Sale): DropdownMenuItem[][] => [
  [
    {
      label: "Ver detalles",
      icon: "i-lucide-eye",
      onSelect: () => {
        toast.add({
          title: `Venta #${row.id}`,
          description: `Total: $${Number(row.total).toLocaleString()}`,
          color: "info",
        });
      },
    },
  ],
  [
    {
      label: "Imprimir ticket",
      icon: "i-lucide-printer",
      onSelect: () => {
        toast.add({
          title: "Impresion pendiente",
          description: "Esta accion se habilitara en un siguiente paso.",
          color: "warning",
        });
      },
    },
  ],
];

const applyDatePreset = (preset: any) => {
  const dates = preset.getValue();
  dateFrom.value = dates.from;
  dateTo.value = dates.to;
  activeDatePreset.value = preset.label;
  applyDateFilter();
};

const applyDateFilter = async () => {
  page.value = 1;
  await refresh();
  toast.add({
    title: "Filtro aplicado",
    description: "El historial se actualizo con el rango indicado.",
    color: "success",
  });
};

const clearDateFilter = async () => {
  dateFrom.value = "";
  dateTo.value = "";
  activeDatePreset.value = null;
  page.value = 1;
  await refresh();
};

const refreshData = async () => {
  page.value = 1;
  await refresh();
  toast.add({
    title: "Datos actualizados",
    description: "Se refresco el historial de ventas.",
    color: "success",
  });
};

const onBrushRangeChange = async (range: { from: string; to: string } | null) => {
  if (!range) {
    if (!dateFrom.value && !dateTo.value) return;

    dateFrom.value = "";
    dateTo.value = "";
    page.value = 1;
    await refresh();
    return;
  }

  const noChanges = dateFrom.value === range.from && dateTo.value === range.to;
  if (noChanges) return;

  dateFrom.value = range.from;
  dateTo.value = range.to;
  page.value = 1;
  await refresh();
};

watch(tableSearch, () => {
  page.value = 1;
});

watch(activeTab, () => {
  playSound('notification');
  page.value = 1;
});
</script>
