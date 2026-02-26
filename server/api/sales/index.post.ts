import { db } from "@nuxthub/db";
import { sales, sale_items } from "../../database/schema";
import { z } from "zod";

const saleItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  subtotal: z.number().min(0),
});

const createSaleSchema = z.object({
  items: z.array(saleItemSchema),
  total: z.number().min(0),
});

export default eventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validated = createSaleSchema.parse(body);
    
    // Crear la venta
    const [newSale] = await db.insert(sales).values({
      total: validated.total.toString()
    }).returning();
    
    // Crear los items de la venta
    const saleItems = validated.items.map(item => ({
      sale_id: newSale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price.toString(),
      subtotal: item.subtotal.toString()
    }));
    
    await db.insert(sale_items).values(saleItems);
    
    return newSale;
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw createError({
      statusCode: 400,
      message: error.message
    });
  }
});