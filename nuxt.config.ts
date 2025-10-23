import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],

	vite: {
		plugins: [tailwindcss()],
	},

	app: {
		head: {
			title: "Orange Craft MC",
			htmlAttrs: {
				lang: "zh_CN",
			},
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/logo2.jpg" },
				{
					rel: "stylesheet",
					href: "https://chinese-fonts-cdn.deno.dev/packages/hcqyt/dist/ChillRoundFRegular/result.css",
				},
			],
		},
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
