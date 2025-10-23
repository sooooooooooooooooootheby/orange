export default defineAppConfig({
	route: [
		{
			label: "服务器指北",
			to: "/docs",
		},
		{
			label: "封神榜",
			to: "/bans",
		},
		{
			label: "蓝图",
			to: "/blueMaps",
		},
	],
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
			title: "公会",
			icon: "gravity-ui:persons",
			path: "/docs/guild",
		},
		{
			title: "管理组",
			icon: "gravity-ui:thunderbolt",
			path: "/docs/admin",
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
	admin: {
		fz: {
			name: "ChengPro",
			role: "橙服腐竹",
		},
		admin: [
			{
				name: "AliceIClodia",
				role: "橙服技术管理",
			},
			{
				name: "MinaFireVine",
				role: "橙服技术管理",
			},
			{
				name: "Ming_XiaoYu",
				role: "橙服技术管理",
			},
			{
				name: "lesfor",
				role: "橙服技术管理",
			},
			{
				name: "NicekillersCN",
				role: "橙服技术管理",
			},
		],
		lowadmin: [
			{
				name: "Th_Long",
				role: "橙服维护管理",
			},
			{
				name: "NAKANO666",
				role: "橙服维护管理",
			},
			{
				name: "kunkun22678",
				role: "橙服维护管理",
			},
			{
				name: "mantou_ya",
				role: "橙服维护管理",
			},
			{
				name: "FzeroOneX",
				role: "橙服维护管理",
			},
		],
	},
});
