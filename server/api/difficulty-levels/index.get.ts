import { db, schema } from "@nuxthub/db";

export default eventHandler(async (event) => {
	const levels = await db.select().from(schema.difficultyLevels);

	return levels;
});
