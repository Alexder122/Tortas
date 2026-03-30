import { z } from "zod";
import { verifyCredentials } from "../../utils/auth-credentials";

const loginSchema = z.object({
	email: z.email("Correo electronico invalido"),
	password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

export default eventHandler(async (event) => {
	const body = await readBody(event);
	const parsed = loginSchema.safeParse(body);

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			message: parsed.error.issues[0]?.message ?? "Datos invalidos",
		});
	}

	const result = await verifyCredentials(parsed.data.email, parsed.data.password);
	if (!result.ok) {
		throw createError({
			statusCode: 401,
			message: "Credenciales incorrectas",
		});
	}

	return {
		ok: true,
		email: result.email,
	};
});
