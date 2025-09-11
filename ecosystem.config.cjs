require("dotenv").config();

module.exports = {
	apps: [
		{
			name: "orange",
			port: "3987",
			exec_mode: "cluster",
			instances: "max",
			script: "./.output/server/index.mjs",
			env_production: {
				NODE_ENV: "production",
				databaseHost: process.env.DB_HOST,
				databaseUser: process.env.DB_USER,
				databasePassword: process.env.DB_PASSWORD,
				databaseDatabase: process.env.DB_NAME,
				databaseCharset: process.env.DB_CHARSET,
			},
		},
	],
};
