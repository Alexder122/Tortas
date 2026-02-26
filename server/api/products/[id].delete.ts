import { db } from "@nuxthub/db";
import { products } from "../../database/schema";
import { eq } from "drizzle-orm";

export default eventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  const [deletedProduct] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
    
  return deletedProduct;
});