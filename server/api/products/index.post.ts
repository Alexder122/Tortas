import { db } from "#server/utils/db";
import { products } from "../../database/schema";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
});

export default eventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log("Body recibido:", body);
    
    // Convertir el costo a string para numeric de PostgreSQL
    const productData = {
      name: body.name,
      cost: body.cost.toString(), // Convertir a string para numeric
    };
    
    const [newProduct] = await db.insert(products).values(productData).returning();
    return newProduct;
  } catch (error) {
    console.error("Error completo:", error);
    throw createError({
      statusCode: 400,
      message: error.message
    });
  }
});
