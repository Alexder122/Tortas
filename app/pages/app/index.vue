<template>
  <DashboardPanelBase id="pos" title="Punto de Venta">
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="saleAlert.open"
        class="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4"
      >
        <UCard
          class="pointer-events-auto w-full max-w-2xl shadow-2xl"
          :class="saleAlert.type === 'success'
            ? 'border-green-300 bg-linear-to-r from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/20'
            : 'border-rose-300 bg-linear-to-r from-rose-100 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/20'"
        >
          <div class="flex items-start gap-4">
            <UIcon
              :name="saleAlert.type === 'success' ? 'i-lucide-circle-check-big' : 'i-lucide-triangle-alert'"
              class="mt-1 h-7 w-7 shrink-0"
              :class="saleAlert.type === 'success' ? 'text-green-600' : 'text-rose-600'"
            />

            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold">{{ saleAlert.title }}</h3>
              <p class="text-sm text-muted mt-1">{{ saleAlert.description }}</p>
            </div>

            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="saleAlert.open = false"
            />
          </div>
        </UCard>
      </div>
    </Transition>

    <UCard class="mb-6 border-pink-200/70 bg-linear-to-r from-pink-100/70 to-white dark:from-pink-950/30 dark:to-transparent">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-badge-dollar-sign" class="h-8 w-8 text-pink-500" />
        <div>
          <h2 class="text-lg font-bold">Venta rapida y visual</h2>
          <p class="text-sm text-muted">Busca, agrega y cobra en una sola pantalla con estilo consistente.</p>
        </div>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna izquierda: Productos -->
      <div class="lg:col-span-2">
        <div class="mb-4">
          <UInput
            v-model="searchQuery"
            placeholder="Buscar productos..."
            icon="i-lucide-search"
          />
        </div>
        
        <div v-if="pending" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-primary-500" />
        </div>
        
        <div v-else-if="error" class="text-center py-12">
          <p class="text-error-500">Error al cargar productos</p>
          <UButton class="mt-4" @click="() => refresh()">Reintentar</UButton>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto p-1">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>
      </div>
      
      <!-- Columna derecha: Carrito y resumen -->
      <div class="lg:col-span-1">
        <UCard class="sticky top-4">
          <template #header>
            <h2 class="text-xl font-semibold">Carrito de Ventas</h2>
          </template>
          
          <div class="space-y-4">
            <!-- Items del carrito -->
            <div v-if="cartItems.length > 0" class="max-h-100 overflow-y-auto">
              <CartItem
                v-for="item in cartItems"
                :key="item.product.id"
                :item="item"
                @increase="addToCart"
                @decrease="decreaseQuantity"
                @remove="removeFromCart"
              />
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-lucide-shopping-cart" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrito vacío</p>
            </div>
            
            <!-- Resumen y botones -->
            <CartSummary
              :items="cartItems"
              :total="cartTotal"
              :is-processing="isProcessingSale"
              @checkout="processSale"
              @clear="clearCart"
            />
          </div>
        </UCard>
      </div>
    </div>
  </DashboardPanelBase>
</template>

<script setup lang="ts">
// IMPORTAR COMPONENTES
import ProductCard from '~/components/pos/ProductCard.vue'
import CartItem from '~/components/pos/CartItem.vue'
import CartSummary from '~/components/pos/CartSummary.vue'

const toast = useToast();
const { playSound } = useAudio();
const searchQuery = ref('');
const isProcessingSale = ref(false);
type SaleAlertType = 'success' | 'error';
const saleAlert = reactive({
  open: false,
  type: 'success' as SaleAlertType,
  title: '',
  description: ''
});
let saleAlertTimer: ReturnType<typeof setTimeout> | null = null;

const showSaleAlert = (type: SaleAlertType, title: string, description: string) => {
  saleAlert.type = type;
  saleAlert.title = title;
  saleAlert.description = description;
  saleAlert.open = true;

  if (saleAlertTimer) {
    clearTimeout(saleAlertTimer);
  }

  saleAlertTimer = setTimeout(() => {
    saleAlert.open = false;
  }, 4500);
};

// Estado del carrito
interface CartItem {
  product: any;
  quantity: number;
}

const cartItems = ref<CartItem[]>([]);

// Obtener productos con useAsyncData para mejor manejo
const { data: products, pending, error, refresh } = await useAsyncData(
  'pos-products',
  () => $fetch('/api/products')
);

// Productos filtrados - usar computed con los datos
const filteredProducts = computed(() => {
  if (!products.value) return [];
  if (!searchQuery.value) return products.value;
  
  return products.value.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Total del carrito
const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (Number(item.product.cost) * item.quantity);
  }, 0);
});

// Agregar producto al carrito
const addToCart = (product: any) => {
  const existingItem = cartItems.value.find(item => item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({
      product,
      quantity: 1
    });
  }
  
  playSound('notification');
  toast.add({
    title: 'Producto agregado',
    description: `${product.name} agregado al carrito`,
    color: 'success'
  });
};

// Disminuir cantidad
const decreaseQuantity = (productId: number) => {
  const item = cartItems.value.find(item => item.product.id === productId);
  
  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      cartItems.value = cartItems.value.filter(i => i.product.id !== productId);
    }
  }
};

// Eliminar del carrito
const removeFromCart = (productId: number) => {
  cartItems.value = cartItems.value.filter(item => item.product.id !== productId);
};

// Limpiar carrito
const clearCart = () => {
  cartItems.value = [];
};

// Procesar venta
const processSale = async () => {
  if (cartItems.value.length === 0) return;
  
  isProcessingSale.value = true;
  
  try {
    const saleData = {
      items: cartItems.value.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: Number(item.product.cost),
        subtotal: Number(item.product.cost) * item.quantity
      })),
      total: cartTotal.value
    };
    
    await $fetch('/api/sales', {
      method: 'POST',
      body: saleData
    });
    
    playSound('success');
    showSaleAlert('success', 'Venta procesada correctamente', 'La transacción se registró exitosamente en el sistema.');
    
    // Limpiar carrito
    clearCart();
    
  } catch (error: any) {
    console.error('Error al procesar venta:', error);
    playSound('error');
    showSaleAlert('error', 'No se pudo procesar la venta', error.data?.message || 'Intente nuevamente en un momento.');
  } finally {
    isProcessingSale.value = false;
  }
};

onBeforeUnmount(() => {
  if (saleAlertTimer) {
    clearTimeout(saleAlertTimer);
  }
});
</script>