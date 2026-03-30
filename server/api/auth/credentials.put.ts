import { z } from "zod";
import { updateCredentials } from "../../utils/auth-credentials";

const updateSchema = z
	.object({
		currentPassword: z.string().min(8, "La contrasena actual es obligatoria"),
		nextEmail: z.email("El nuevo correo no es valido"),
		nextPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres"),
		confirmPassword: z.string().min(8, "Confirme la nueva contrasena"),
	})
	.refine((value) => value.nextPassword === value.confirmPassword, {
		message: "La confirmacion no coincide con la nueva contrasena",
		path: ["confirmPassword"],
	});

export default eventHandler(async (event) => {
	const authUser = getCookie(event, "auth_user");
	if (!authUser) {
		throw createError({
			statusCode: 401,
			message: "No autenticado",
		});
	}

	const body = await readBody(event);
	const parsed = updateSchema.safeParse(body);

	if (!parsed.success) {
		throw createError({
			statusCode: 400,
			message: parsed.error.issues[0]?.message ?? "Datos invalidos",
		});
	}

	const result = await updateCredentials(parsed.data);
	if (!result.ok) {
		throw createError({
			statusCode: 401,
			message: result.error,
		});
	}

	return {
		ok: true,
		email: result.email,
	};
});
