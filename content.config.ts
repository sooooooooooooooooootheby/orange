import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		docs: defineCollection({
			type: "page",
			source: "docs/**/*.md",
			schema: z.object({
				isToc: z.boolean(),
				title: z.string(),
				icon: z.string(),
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
				coordinate: z.object({
					x: z.number(),
					y: z.number(),
					z: z.number(),
				}),
				title: z.string(),
				info: z.string(),
				time: z.date(),
			}),
		}),
	},
});
