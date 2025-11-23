import mysql from "mysql2/promise";

const db = mysql.createPool({
	host: useRuntimeConfig().databaseHost,
	user: useRuntimeConfig().databaseUser,
	password: useRuntimeConfig().databasePassword,
	database: useRuntimeConfig().databaseDatabase,
	charset: useRuntimeConfig().databaseCharset,
});

export default db;
