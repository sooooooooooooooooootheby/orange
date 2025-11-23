import db from "../database/db";

interface GuildInfo {
	guild_name: string;
	description: string;
	level: number;
	money: number;
	member_count: number;
	prosperity_degree: number;
	month_prosperity_degree: number;
	member_max_count: number;
	creator: string;
	create_time: string;
}

interface GuildCache {
	data: GuildInfo[] | null;
	timestamp: number;
}

interface SuccessResponse {
	success: boolean;
	data: GuildInfo[];
	cacheTime: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

let guildCache: GuildCache = {
	data: null,
	timestamp: 0,
};

export default defineEventHandler(async (event): Promise<SuccessResponse | void> => {
	const now = Date.now();
	if (guildCache.data && now - guildCache.timestamp < CACHE_DURATION) {
		return {
			success: true,
			data: guildCache.data,
			cacheTime: new Date(guildCache.timestamp).toISOString(),
		};
	}

	try {
		const [rows] = await db.execute(
			"SELECT guild_name, description, level, money, member_count, prosperity_degree, month_prosperity_degree, member_max_count, creator, create_time FROM guild_info"
		);

		const guildData = rows as GuildInfo[];

		guildCache.data = guildData;
		guildCache.timestamp = now;
		const cacheTime = new Date(now + 8 * 60 * 60 * 1000).toISOString();
		return {
			success: true,
			data: guildData,
			cacheTime,
		};
	} catch (error) {
		throw createError({
			statusCode: 500,
			message: "服务器错误2",
		});
	}
});
