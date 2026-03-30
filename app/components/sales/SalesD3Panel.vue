<template>
  <div class="relative grid grid-cols-1 gap-6 xl:grid-cols-5">
    <!-- Tooltip global flotante -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="tooltip.visible"
        class="pointer-events-none fixed z-50 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:bg-gray-700"
        :style="{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)'
        }"
      >
        {{ tooltip.content }}
        <div class="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 transform bg-inherit" style="clip-path: polygon(0 0, 100% 0, 50% 100%)" />
      </div>
    </Transition>

    <UCard class="xl:col-span-3">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h3 class="flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-trending-up" class="h-5 w-5 text-pink-500" />
            Ventas del dia
          </h3>
          <UBadge color="neutral" variant="soft" class="bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-200">
            {{ parsedDaily.length }} dias
          </UBadge>
        </div>
      </template>

      <div v-if="parsedDaily.length === 0" class="h-72 flex items-center justify-center text-muted">
        No hay ventas en el rango seleccionado.
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-xl border border-pink-200/70 bg-linear-to-b from-pink-50/60 to-white p-3 dark:from-pink-950/20 dark:to-transparent">
          <svg viewBox="0 0 880 280" class="h-72 w-full">
            <g transform="translate(58,16)">
              <line x1="0" y1="220" x2="792" y2="220" class="stroke-pink-200 dark:stroke-pink-800" />

              <line
                v-for="tick in yTicks"
                :key="`y-${tick.value}`"
                x1="0"
                :y1="tick.y"
                x2="792"
                :y2="tick.y"
                class="stroke-pink-200/70 dark:stroke-pink-800/70"
                stroke-dasharray="4 4"
              />

              <text
                v-for="tick in yTicks"
                :key="`ylabel-${tick.value}`"
                x="-10"
                :y="tick.y + 4"
                text-anchor="end"
                class="fill-pink-700/80 dark:fill-pink-200/80 text-[11px]"
              >
                ${{ Math.round(tick.value).toLocaleString() }}
              </text>

              <path :d="linePath" fill="none" class="stroke-pink-500" stroke-width="4" />

              <circle
                v-for="(point, idx) in linePoints"
                :key="point.key"
                :cx="point.x"
                :cy="point.y"
                r="4"
                class="fill-rose-500 cursor-pointer transition-all hover:r-6 hover:fill-pink-600"
                @mouseover="(e) => parsedDaily[idx] && showLineTooltip(e, parsedDaily[idx])"
                @mouseout="hideTooltip"
              />

              <text
                v-for="tick in xTicks"
                :key="`xtick-${tick.label}`"
                :x="tick.x"
                y="240"
                text-anchor="middle"
                class="fill-pink-700/80 dark:fill-pink-200/80 text-[11px]"
              >
                {{ tick.label }}
              </text>
            </g>
          </svg>
        </div>

        <div class="rounded-xl border border-pink-200/70 bg-linear-to-b from-rose-50/60 to-white p-3 dark:from-rose-950/20 dark:to-transparent">
          <p class="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-pink-700 dark:text-pink-200">
            <UIcon name="i-lucide-mouse-pointer-click" class="h-4 w-4" />
            Selecciona con el mouse el rango que quieras ver
          </p>
          <svg viewBox="0 0 880 120" class="h-28 w-full">
            <g transform="translate(20,8)">
              <path :d="miniPath" fill="none" class="stroke-pink-400" stroke-width="3" />
              <g ref="brushLayer" />
            </g>
          </svg>
        </div>
      </div>
    </UCard>

    <UCard class="xl:col-span-2">
      <template #header>
        <h3 class="flex items-center gap-2 text-lg font-semibold">
          <UIcon name="i-lucide-crown" class="h-5 w-5 text-fuchsia-500" />
          Top productos por ingresos
        </h3>
      </template>

      <div v-if="topSeries.length === 0" class="h-72 flex items-center justify-center text-muted">
        Sin productos para mostrar.
      </div>

      <div v-else class="rounded-xl border border-fuchsia-200/70 bg-linear-to-b from-fuchsia-50/60 to-white p-3 dark:from-fuchsia-950/20 dark:to-transparent">
        <svg viewBox="0 0 520 320" class="h-80 w-full">
          <g transform="translate(130,20)">
            <rect
              v-for="bar in bars"
              :key="bar.name"
              :x="0"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              class="fill-pink-500/85 cursor-pointer transition-all hover:fill-pink-600"
              rx="5"
              @mouseover="(e) => showBarTooltip(e, bar)"
              @mouseout="hideTooltip"
            />

            <text
              v-for="bar in bars"
              :key="`label-${bar.name}`"
              x="-10"
              :y="bar.y + bar.height / 2 + 4"
              text-anchor="end"
              class="fill-pink-900 dark:fill-pink-100 text-[12px]"
            >
              {{ bar.name }}
            </text>

            <text
              v-for="bar in bars"
              :key="`value-${bar.name}`"
              :x="Math.min(350, bar.width + 8)"
              :y="bar.y + bar.height / 2 + 4"
              class="fill-pink-700/80 dark:fill-pink-200/80 text-[11px]"
            >
              ${{ bar.revenue.toLocaleString() }}
            </text>
          </g>
        </svg>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { extent, max } from "d3-array";
import { brushX } from "d3-brush";
import { scaleBand, scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { curveMonotoneX, line as d3Line } from "d3-shape";
import { timeFormat } from "d3-time-format";

type DailySeriesPoint = {
  date: string;
  total: number;
};

type TopSeriesPoint = {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
};

const props = defineProps<{
  dailySeries: DailySeriesPoint[];
  topSeries: TopSeriesPoint[];
}>();

const emit = defineEmits<{
  "range-change": [payload: { from: string; to: string } | null];
}>();

// Tooltip state
const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  content: ''
});

const chartDateFormat = timeFormat("%d/%m");
const apiDateFormat = timeFormat("%Y-%m-%d");

const parsedDaily = computed(() =>
  props.dailySeries
    .map((item) => ({
      date: new Date(`${item.date}T00:00:00.000Z`),
      total: Number(item.total),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()),
);

const lineWidth = 792;
const lineHeight = 220;

const lineDomain = computed(() => {
  const range = extent(parsedDaily.value, (d) => d.date) as [Date | undefined, Date | undefined];
  const now = new Date();
  return [range[0] ?? now, range[1] ?? now] as [Date, Date];
});

const xLine = computed(() => scaleTime().domain(lineDomain.value).range([0, lineWidth]));
const yLine = computed(() => {
  const maxValue = max(parsedDaily.value, (d) => d.total) ?? 1;
  return scaleLinear().domain([0, maxValue]).nice().range([lineHeight, 0]);
});

const linePath = computed(() => {
  const generator = d3Line<{ date: Date; total: number }>()
    .x((d) => xLine.value(d.date))
    .y((d) => yLine.value(d.total))
    .curve(curveMonotoneX);

  return generator(parsedDaily.value) ?? "";
});

const linePoints = computed(() =>
  parsedDaily.value.map((point) => ({
    key: point.date.toISOString(),
    x: xLine.value(point.date),
    y: yLine.value(point.total),
  })),
);

const xTicks = computed(() =>
  xLine.value
    .ticks(4)
    .map((tick) => ({
      x: xLine.value(tick),
      label: chartDateFormat(tick),
    })),
);

const yTicks = computed(() =>
  yLine.value
    .ticks(3)
    .map((tick) => ({
      y: yLine.value(tick),
      value: tick,
    })),
);

const barWidth = 350;
const barHeight = 280;

const topSeries = computed(() => props.topSeries.slice(0, 6));
const xBar = computed(() => {
  const maxValue = max(topSeries.value, (d) => d.revenue) ?? 1;
  return scaleLinear().domain([0, maxValue]).range([0, barWidth]);
});

const yBar = computed(() =>
  scaleBand<string>()
    .domain(topSeries.value.map((item) => item.name))
    .range([0, barHeight])
    .padding(0.25),
);

const bars = computed(() =>
  topSeries.value.map((item) => ({
    ...item,
    y: yBar.value(item.name) ?? 0,
    width: xBar.value(item.revenue),
    height: yBar.value.bandwidth(),
  })),
);

const brushLayer = ref<SVGGElement | null>(null);

const miniWidth = 840;
const miniHeight = 95;
const xMini = computed(() => scaleTime().domain(lineDomain.value).range([0, miniWidth]));
const yMini = computed(() => {
  const maxValue = max(parsedDaily.value, (d) => d.total) ?? 1;
  return scaleLinear().domain([0, maxValue]).range([miniHeight, 0]);
});

const miniPath = computed(() => {
  const generator = d3Line<{ date: Date; total: number }>()
    .x((d) => xMini.value(d.date))
    .y((d) => yMini.value(d.total))
    .curve(curveMonotoneX);

  return generator(parsedDaily.value) ?? "";
});

function setupBrush() {
  if (!brushLayer.value) return;

  const brush = brushX()
    .extent([
      [0, 0],
      [miniWidth, miniHeight],
    ])
    .on("end", (event) => {
      const selection = event.selection as [number, number] | null;
      if (!selection) {
        emit("range-change", null);
        return;
      }

      const [x0, x1] = selection;
      const from = xMini.value.invert(x0);
      const to = xMini.value.invert(x1);

      emit("range-change", {
        from: apiDateFormat(from),
        to: apiDateFormat(to),
      });
    });

  const root = select(brushLayer.value);
  root.selectAll("*").remove();
  root.call(brush as never);
  root.selectAll(".selection").attr("fill", "#ec4899").attr("fill-opacity", 0.22).attr("stroke", "#db2777");
  root.selectAll(".handle").attr("fill", "#db2777");
}

function showLineTooltip(event: MouseEvent, point: { date: Date; total: number }) {
  const rect = (event.currentTarget as SVGCircleElement).getBoundingClientRect();
  tooltip.visible = true;
  tooltip.x = rect.left;
  tooltip.y = rect.top - 40;
  tooltip.content = `${chartDateFormat(point.date)}: $${Number(point.total).toLocaleString()}`;
}

function showBarTooltip(event: MouseEvent, bar: { name: string; revenue: number }) {
  const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
  tooltip.visible = true;
  tooltip.x = rect.left + rect.width / 2;
  tooltip.y = rect.top - 40;
  tooltip.content = `${bar.name}: $${Number(bar.revenue).toLocaleString()}`;
}

function hideTooltip() {
  tooltip.visible = false;
}

onMounted(() => {
  setupBrush();
});

watch(
  () => props.dailySeries,
  () => {
    nextTick(() => setupBrush());
  },
  { deep: true },
);
</script>
