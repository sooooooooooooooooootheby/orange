import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		index: defineCollection({
			type: "page",
			source: "index.md",
		}),
		logs: defineCollection({
			type: "page",
			source: "logs.md",
		}),
		docs: defineCollection({
			type: "page",
			source: "docs/**/*.md",
			schema: z.object({
				icon: z.string(),
				title: z.string(),
				introduction: z.string(),
			}),
		}),
	},
});
