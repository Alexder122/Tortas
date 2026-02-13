import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateLevelSchema = z.object({
	name: z
		.string()
		.min(2, "El nombre debe tener al menos 2 caracteres")
		.optional(),
	description: z.string().optional(),
	order: z.number().min(1, "El orden debe ser mayor a 0"),
});

export default eventHandler(async (event) => {
	const id = getRouterParam(event, "id");

	if (!id) {
		throw createError({
			statusCode: 400,
			message: "ID es requerido",
		});
	}

	const body = await readBody(event);

	// Validar datos
	const validatedData = updateLevelSchema.parse(body);

	// Actualizar nivel de dificultad
	const [updatedLevel] = await db
		.update(schema.difficultyLevels)
		.set({
			...validatedData,
			updated_at: new Date(),
		})
		.where(eq(schema.difficultyLevels.id, parseInt(id)))
		.returning();

	if (!updatedLevel) {
		throw createError({
			statusCode: 404,
			message: "Nivel de dificultad no encontrado",
		});
	}

	return updatedLevel;
});
