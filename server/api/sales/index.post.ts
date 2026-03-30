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
    const result = await db.insert(sales).values({
      total: validated.total.toString()
    }).returning();

    if (!result || result.length === 0) {
      throw new Error('No se pudo crear la venta');
    }

    const newSale = result[0];
    if (!newSale) {
      throw new Error('No se pudo crear la venta');
    }
    
    // Crear los items de la venta
    const saleItems = validated.items.map(item => ({
      sale_id: newSale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price.toString(),
      subtotal: item.subtotal.toString()
    }));
    
    await db.insert(sale_items).values(saleItems);
    
    // Retornar datos con folio como id padded a 10 dígitos
    return {
      id: newSale.id,
      folio: String(newSale.id).padStart(10, '0'),
      total: newSale.total,
      created_at: newSale.created_at
    };
  } catch (error: any) {
    console.error("Error al crear venta:", error);
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Error al procesar la venta'
    });
  }
});