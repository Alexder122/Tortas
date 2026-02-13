// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	debug: false,
	ssr: true,
	modules: ["@nuxt/ui", "@nuxthub/core"],
	css: ["~/assets/css/main.css"],
	app: {
		head: {
			title: import.meta.env.APP_NAME || "Nuxt App",
		},
	},
	hub: {
		db: {
			dialect: "postgresql",
			driver: "postgres-js",
			casing: "snake_case",
			connection: {
				connectionString: import.meta.env.DATABASE_URL || "",
			},
		},
	},
	runtimeConfig: {
		supabaseUrl: import.meta.env.SUPABASE_URL,
		supabasePublishableKey: import.meta.env.SUPABASE_PUBLISHABLE_KEY,

		public: {
			appName: import.meta.env.APP_NAME || "Nuxt App",
		},
	},
	routeRules: {
		"/": { redirect: "/login" },
	},
});
