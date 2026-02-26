<template>
  <DashboardPanelBase id="pos" title="Punto de Venta">
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
          <UButton class="mt-4" @click="refresh">Reintentar</UButton>
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
            <div v-if="cartItems.length > 0" class="max-h-[400px] overflow-y-auto">
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
const searchQuery = ref('');
const isProcessingSale = ref(false);

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
  
  toast.add({
    title: 'Producto agregado',
    description: `${product.name} agregado al carrito`,
    color: 'success',
    timeout: 2000
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
    
    toast.add({
      title: 'Venta procesada',
      description: 'La venta se registró exitosamente',
      color: 'success'
    });
    
    // Limpiar carrito
    clearCart();
    
  } catch (error: any) {
    console.error('Error al procesar venta:', error);
    toast.add({
      title: 'Error',
      description: error.data?.message || 'No se pudo procesar la venta',
      color: 'error'
    });
  } finally {
    isProcessingSale.value = false;
  }
};
</script>