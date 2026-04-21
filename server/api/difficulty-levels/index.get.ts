import { db, schema } from "#server/utils/db";

export default eventHandler(async (event) => {
	const levels = await db.select().from(schema.difficultyLevels);

	return levels;
});
