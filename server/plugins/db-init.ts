export default defineNitroPlugin(async (nitroApp) => {
	const db = useDatabase();

	await db.sql`
        CREATE TABLE IF NOT EXISTS blueMaps_like (
            bid INTEGER PRIMARY KEY,
            fingerprint TEXT
        );
    `;
});
