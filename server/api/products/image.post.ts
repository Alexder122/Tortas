import { db } from "@nuxthub/db";
import { products } from "../../database/schema";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  image: z.string().optional(), // Guardamos la ruta de la imagen
});

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const validated = createProductSchema.parse(body);
  
  const [newProduct] = await db.insert(products).values(validated).returning();
  return newProduct;
});