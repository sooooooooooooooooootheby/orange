export default defineAppConfig({
	navigation: [
		{
			title: "关于我们",
			icon: "gravity-ui:heart",
			path: "/docs",
		},
		{
			title: "玩法指南",
			icon: "gravity-ui:shapes-3",
			path: "/docs/play",
		},
		{
			title: "特色玩法",
			icon: "gravity-ui:magic-wand",
			path: "/docs/playing",
		},
		{
			title: "玩法守则",
			icon: "gravity-ui:pencil",
			path: "#",
			children: [
				{
					title: "交流守则",
					path: "/docs/playrule/chat",
				},
				{
					title: "游玩守则",
					path: "/docs/playrule/play",
				},
			],
		},
		{
			title: "命令大全",
			icon: "gravity-ui:terminal",
			path: "#",
			children: [
				{
					title: "传送 & 家",
					path: "/docs/command/transfer",
				},
				{
					title: "领地",
					path: "/docs/command/territory",
				},
				{
					title: "全服音乐",
					path: "/docs/command/allmusic",
				},
			],
		},
	],
});
