export default defineEventHandler(async (event) => {
	const { bid } = getQuery(event) as { bid: number };

	if (!bid) {
		return { success: false, message: "Missing bid", bid };
	}

	const db = useDatabase();
	const { rows }: { rows: { total: number }[] } = await db.sql`
		SELECT COUNT(*) AS total
		FROM blueMaps_like
		WHERE bid = ${bid}
	`;

	return {
		success: true,
		data: {
			bid,
			totalLikes: rows[0]?.total ?? 0,
		},
	};
});
