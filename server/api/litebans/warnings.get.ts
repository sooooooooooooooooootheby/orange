import db from "../../database/db";
import { SuccessResponseB, LitebansDataB } from "../../types/litebans";

const cache = new Map<string, { data: LitebansDataB[]; expires: number }>();

export default defineEventHandler(async (event): Promise<SuccessResponseB | void> => {
	try {
		const cacheKey = "bans";
		const now = Date.now();

		if (cache.has(cacheKey)) {
			const cached = cache.get(cacheKey)!;
			if (now < cached.expires) {
				return {
					success: true,
					data: cached.data,
				};
			}
		}

		const [rows] = await db.execute(
			`
			SELECT
				b.uuid,
				(SELECT name FROM litebans_history WHERE uuid = b.uuid LIMIT 1) AS name,
				b.reason,
				b.banned_by_name,
				b.time
			FROM litebans_warnings b;
			`
		);

		const data = rows as LitebansDataB[];

		return {
			success: true,
			data,
		};
	} catch (error) {
		console.log(error);
		throw createError({
			statusCode: 500,
			message: "服务器错误",
		});
	}
});
