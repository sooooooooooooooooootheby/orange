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
				order: z.number(),
				isHide: z.boolean(),
				isHot: z.boolean(),
			}),
		}),
		blueMaps: defineCollection({
			type: "data",
			source: "blueMaps/*.json",
			schema: z.object({
				bid: z.number(),
				image: z.array(z.string()),
				authors: z.array(z.string()),
				warp: z.string(),
				title: z.string(),
				info: z.string(),
				time: z.date(),
			}),
		}),
	},
});
