import { readBody } from "h3";

const likeCooldownMap = new Map<string, number>();
const COOLDOWN_MS = 1000;

export default defineEventHandler(async (event) => {
	const db = useDatabase();
	const body = await readBody<{ bid: number; fingerprint: string }>(event);

	if (body?.bid === undefined || !body?.fingerprint) {
		return { success: false, message: "Missing params", bid: body.bid, fingerprint: body.fingerprint };
	}

	const key = `${body.bid}-${body.fingerprint}`;
	const now = Date.now();

	const lastTime = likeCooldownMap.get(key) ?? 0;
	if (now - lastTime < COOLDOWN_MS) {
		return { success: false, message: "Too many requests, please wait a moment." };
	}
	likeCooldownMap.set(key, now);

	const { rows: exists }: { rows: { bid: number; fingerprint: string }[] } = await db.sql`
        SELECT 1
        FROM blueMaps_like
        WHERE bid = ${body.bid} AND fingerprint = ${body.fingerprint}
    `;

	let liked: boolean;

	if (exists.length === 0) {
		await db.sql`
            INSERT INTO blueMaps_like (bid, fingerprint)
            VALUES (${body.bid}, ${body.fingerprint})
        `;
		liked = true;
	} else {
		await db.sql`
            DELETE FROM blueMaps_like
            WHERE bid = ${body.bid} AND fingerprint = ${body.fingerprint}
        `;
		liked = false;
	}

	const { rows: countRows }: { rows: { total: number }[] } = await db.sql`
        SELECT COUNT(*) AS total
        FROM blueMaps_like
        WHERE bid = ${body.bid}
    `;
	const totalLikes = countRows[0]?.total ?? 0;

	return {
		success: true,
		liked,
		totalLikes,
	};
});
