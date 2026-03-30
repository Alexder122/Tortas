export default defineNuxtRouteMiddleware((to) => {
	const authUser = useCookie<string | null>("auth_user", {
		sameSite: "lax",
	});

	const isAuthenticated = Boolean(authUser.value);

	if (to.path.startsWith("/app") && !isAuthenticated) {
		return navigateTo("/login");
	}

	if (to.path === "/login" && isAuthenticated) {
		return navigateTo("/app");
	}
});
