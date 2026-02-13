import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

export default eventHandler(async (event) => {
	const id = getRouterParam(event, "id");

	if (!id) {
		throw createError({
			statusCode: 400,
			message: "ID es requerido",
		});
	}

	// Eliminar nivel de dificultad
	const [deletedLevel] = await db
		.delete(schema.difficultyLevels)
		.where(eq(schema.difficultyLevels.id, parseInt(id)))
		.returning();

	if (!deletedLevel) {
		throw createError({
			statusCode: 404,
			message: "Nivel de dificultad no encontrado",
		});
	}

	return { success: true, deleted: deletedLevel };
});
