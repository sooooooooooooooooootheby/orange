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
				t.uuid,
				(SELECT name FROM litebans_history WHERE uuid = t.uuid LIMIT 1) AS name,
				JSON_ARRAYAGG(
				JSON_OBJECT(
					'reason', t.reason,
					'reason_count', t.reason_count
				)
			) AS kick,
			SUM(t.reason_count) AS kick_count
			FROM (
				SELECT
					k.uuid,
					k.reason,
					COUNT(*) AS reason_count,
					MAX(k.banned_by_name) AS banned_by_name,
					MAX(k.time) AS last_time
				FROM litebans_kicks k
				GROUP BY k.uuid, k.reason
			) t
			GROUP BY t.uuid;
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
