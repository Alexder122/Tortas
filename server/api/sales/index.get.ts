import { db } from "@nuxthub/db";
import { sales, sale_items, products } from "../../database/schema";
import { eq, desc } from "drizzle-orm";

export default eventHandler(async (event) => {
  try {
    const allSales = await db.select().from(sales).orderBy(desc(sales.created_at));
    
    // Para cada venta, obtener sus items
    const salesWithItems = await Promise.all(
      allSales.map(async (sale) => {
        const items = await db
          .select({
            id: sale_items.id,
            quantity: sale_items.quantity,
            unit_price: sale_items.unit_price,
            subtotal: sale_items.subtotal,
            product: {
              id: products.id,
              name: products.name,
              cost: products.cost
            }
          })
          .from(sale_items)
          .innerJoin(products, eq(sale_items.product_id, products.id))
          .where(eq(sale_items.sale_id, sale.id));
        
        return {
          ...sale,
          items
        };
      })
    );
    
    return salesWithItems;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw createError({
      statusCode: 500,
      message: "Error al obtener ventas"
    });
  }
});