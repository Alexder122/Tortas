import { db, schema } from "@nuxthub/db";
import { z } from "zod";

const createLevelSchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	description: z.string().optional(),
	order: z.number().min(1, "El orden debe ser mayor a 0"),
});

export default eventHandler(async (event) => {
	const body = await readBody(event);

	// Validar datos
	const validatedData = createLevelSchema.parse(body);

	// Insertar nivel de dificultad
	const [newLevel] = await db
		.insert(schema.difficultyLevels)
		.values({
			name: validatedData.name,
			description: validatedData.description,
			order: validatedData.order,
		})
		.returning();

	return newLevel;
});
