import { db } from "#server/utils/db";
import { eq, sql } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { app_credentials } from "../database/schema";

const DEFAULT_EMAIL = "tortas@lupe.com";
const DEFAULT_PASSWORD = "admin123";

function hashPassword(password: string, salt?: string) {
	const passwordSalt = salt ?? randomBytes(16).toString("hex");
	const derivedKey = scryptSync(password, passwordSalt, 64).toString("hex");

	return {
		hash: derivedKey,
		salt: passwordSalt,
	};
}

function comparePassword(password: string, salt: string, expectedHash: string) {
	const incomingHash = scryptSync(password, salt, 64);
	const storedHash = Buffer.from(expectedHash, "hex");

	if (incomingHash.length !== storedHash.length) {
		return false;
	}

	return timingSafeEqual(incomingHash, storedHash);
}

async function ensureCredentialsTable() {
	await db.execute(sql`
		CREATE TABLE IF NOT EXISTS app_credentials (
			id serial PRIMARY KEY,
			email varchar(255) NOT NULL,
			password_hash text NOT NULL,
			password_salt text NOT NULL,
			created_at timestamp DEFAULT now(),
			updated_at timestamp DEFAULT now()
		)
	`);
}

export async function ensureCredentialsRecord() {
	await ensureCredentialsTable();

	const existing = await db.select().from(app_credentials).limit(1);
	const existingRecord = existing[0];
	if (existingRecord) {
		return existingRecord;
	}

	const initialEmail = process.env.AUTH_DEFAULT_EMAIL ?? DEFAULT_EMAIL;
	const initialPassword = process.env.AUTH_DEFAULT_PASSWORD ?? DEFAULT_PASSWORD;
	const { hash, salt } = hashPassword(initialPassword);

	const [created] = await db
		.insert(app_credentials)
		.values({
			email: initialEmail.toLowerCase(),
			password_hash: hash,
			password_salt: salt,
		})
		.returning();

	if (!created) {
		throw createError({
			statusCode: 500,
			message: "No se pudieron inicializar las credenciales",
		});
	}

	return created;
}

export async function verifyCredentials(email: string, password: string) {
	const credentials = await ensureCredentialsRecord();
	const normalizedEmail = email.trim().toLowerCase();

	if (normalizedEmail !== credentials.email) {
		return {
			ok: false,
			email: credentials.email,
		} as const;
	}

	const ok = comparePassword(password, credentials.password_salt, credentials.password_hash);
	return {
		ok,
		email: credentials.email,
	} as const;
}

export async function updateCredentials(payload: {
	currentPassword: string;
	nextEmail: string;
	nextPassword: string;
}) {
	const credentials = await ensureCredentialsRecord();
	const validCurrentPassword = comparePassword(
		payload.currentPassword,
		credentials.password_salt,
		credentials.password_hash,
	);

	if (!validCurrentPassword) {
		return {
			ok: false,
			error: "La contrasena actual es incorrecta.",
		} as const;
	}

	const normalizedNextEmail = payload.nextEmail.trim().toLowerCase();
	const { hash, salt } = hashPassword(payload.nextPassword);

	const [updated] = await db
		.update(app_credentials)
		.set({
			email: normalizedNextEmail,
			password_hash: hash,
			password_salt: salt,
			updated_at: new Date(),
		})
		.where(eq(app_credentials.id, credentials.id))
		.returning();

	if (!updated) {
		throw createError({
			statusCode: 500,
			message: "No se pudieron actualizar las credenciales",
		});
	}

	return {
		ok: true,
		email: updated.email,
	} as const;
}
