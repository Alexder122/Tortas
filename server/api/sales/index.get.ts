import { db } from "@nuxthub/db";
import { sales, sale_items, products } from "../../database/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export default eventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const from = typeof query.from === "string" ? query.from : undefined;
    const to = typeof query.to === "string" ? query.to : undefined;

    const filters = [];
    if (from) {
      filters.push(gte(sales.created_at, new Date(`${from}T00:00:00.000Z`)));
    }
    if (to) {
      filters.push(lte(sales.created_at, new Date(`${to}T23:59:59.999Z`)));
    }

    const allSales = await db
      .select()
      .from(sales)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(sales.created_at));
    
    // Para cada venta, obtener sus items
    const salesWithItems = await Promise.all(
      allSales.map(async (sale) => {
        const items = await db
          .select({
            id: sale_items.id,
            product_id: sale_items.product_id,
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