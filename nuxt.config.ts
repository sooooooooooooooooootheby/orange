import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],

	vite: {
		plugins: [tailwindcss()],
	},

	runtimeConfig: {
		databaseHost: process.env.DB_HOST,
		databaseUser: process.env.DB_USER,
		databasePassword: process.env.DB_PASSWORD,
		databaseDatabase: process.env.DB_NAME,
		databaseCharset: process.env.DB_CHARSET,
	},

	nitro: {
		experimental: {
			database: true,
		},
	},

	modules: ["shadcn-nuxt", "@nuxt/icon", "@nuxt/content", "@nuxtjs/color-mode"],

	shadcn: {
		prefix: "",
		componentDir: "./components/ui",
	},

	colorMode: {
		classPrefix: "",
		classSuffix: "",
	},
});
