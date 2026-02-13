// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  debug: false,
	ssr: true,
  modules: ['@nuxt/ui'],
  css: ["~/assets/css/main.css"],
  app: {
		head: {
			title: import.meta.env.APP_NAME || "Nuxt App",
		},
	},
  runtimeConfig: {
		supabaseUrl: import.meta.env.SUPABASE_URL,
		supabasePublishableKey: import.meta.env.SUPABASE_PUBLISHABLE_KEY,

		public: {
			appName: import.meta.env.APP_NAME || "Nuxt App",
		},
	},
})