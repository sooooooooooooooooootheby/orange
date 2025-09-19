module.exports = {
	apps: [
		{
			name: "test",
			port: "3988",
			exec_mode: "cluster",
			instances: "max",
			script: "./.output/server/index.mjs",
		},
	],
};
