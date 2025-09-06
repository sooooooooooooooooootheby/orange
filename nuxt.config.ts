// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-16",
	devtools: { enabled: true },

	modules: ["@nuxt/ui", "@nuxt/eslint", "@nuxt/content", "@nuxt/icon"],

	css: ["~/assets/css/main.css"],

	app: {
		pageTransition: { name: "page", mode: "out-in" },
		head: {
			title: "Orange Craft MC",
			htmlAttrs: {
				lang: "zh_CN",
			},
			link: [{ rel: "icon", type: "image/x-icon", href: "/orange.webp" }],
		},
	},

	content: {
		preview: {
			api: "https://api.nuxt.studio",
		},
	},
});
