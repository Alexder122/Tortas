import { db } from "#server/utils/db";
import { products } from "../../database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0").optional(),
});

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    
    // Preparar datos para actualizar
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.cost !== undefined) updateData.cost = body.cost.toString(); // Convertir a string
    
    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
      
    return updatedProduct;
  } catch (error) {
    console.error("Error completo:", error);
    throw createError({
      statusCode: 400,
      message: error.message
    });
  }
});