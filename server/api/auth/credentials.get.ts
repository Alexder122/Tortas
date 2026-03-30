import { ensureCredentialsRecord } from "../../utils/auth-credentials";

export default eventHandler(async (event) => {
	const authUser = getCookie(event, "auth_user");
	if (!authUser) {
		throw createError({
			statusCode: 401,
			message: "No autenticado",
		});
	}

	const credentials = await ensureCredentialsRecord();
	return {
		email: credentials.email,
	};
});
