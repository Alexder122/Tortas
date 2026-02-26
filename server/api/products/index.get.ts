import { db } from "@nuxthub/db";
import { products } from "../../database/schema";

export default eventHandler(async (event) => {
  const result = await db.select().from(products);
  return result;
});