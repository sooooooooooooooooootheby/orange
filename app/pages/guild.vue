<template>
	<div class="">
		<div class="mx-auto max-w-2xl py-24 max-md:px-4">
			<div class="prose mb-8">
				<NuxtLink to="/" class="text-base-content/75 mb-2 flex items-center gap-1 text-sm no-underline">
					<icon name="gravity-ui:arrow-uturn-ccw-left" />
					回到首页
				</NuxtLink>
				<h1 class="flex items-center gap-2"><icon name="gravity-ui:persons" />公会</h1>
				<p>公会是OrangeCraft的玩法之一.</p>
				<p>公会的数据是从服务器获取的, 每五分钟更新一次, 所以就算你短时间内一直刷新也不会有变化.</p>
				<p>排名的评分是由公式计算得出的:</p>
				<p class="font-bold">评分 = (等级^3 x 2000) + (本月活跃度 x 1.0) + (资金 x 0.1)</p>
			</div>
			<div role="alert" class="alert alert-error alert-soft" v-if="error">
				<span>{{ error }}</span>
			</div>
			<ul class="flex flex-col gap-2" v-else>
				<li v-for="(item, index) in sorting" :key="item.guild_name">
					<div class="card card-border bg-base-100/25 shadow-xs backdrop-blur-md">
						<div class="card-body">
							<div class="flex items-center gap-2">
								<avatar :name="item.creator" :alt="item.creator" class="size-8" />
								<div>
									<p class="font-bold" v-html="toColoredHtml(item.guild_name)"></p>
									<p class="text-base-content/76 text-sm">
										{{ item.creator }} -
										<NuxtTime locale="zh-CN" year="numeric" month="long" day="numeric" :datetime="item.create_time" />
									</p>
								</div>
							</div>
							<p class="text-base-content">{{ item.description }}</p>
							<div class="flex max-md:flex-wrap">
								<div class="flex flex-col gap-0.5 max-md:mb-1 max-md:w-full md:w-1/5">
									<span class="text-base-content/90 text-xs">评分</span>
									<span
										class="text-base-content/60"
										:class="{
											'text-teal-500': index === 2,
											'text-indigo-500': index === 1,
											'text-rose-500': index === 0,
										}"
										>{{ item.score.toFixed(2) }}</span
									>
								</div>
								<div class="flex flex-col gap-0.5 max-md:w-1/4 md:w-1/5">
									<span class="text-base-content/90 text-xs">等级</span>
									<span class="text-base-content/60">{{ item.level }}</span>
								</div>
								<div class="flex flex-col gap-0.5 max-md:w-1/4 md:w-1/5">
									<span class="text-base-content/90 text-xs">成员</span>
									<span class="text-base-content/60">{{ item.member_count }}</span>
								</div>
								<div class="flex flex-col gap-0.5 max-md:w-1/4 md:w-1/5">
									<span class="text-base-content/90 text-xs">本月活跃</span>
									<span class="text-base-content/60">{{ item.month_prosperity_degree }}</span>
								</div>
								<div class="flex flex-col gap-0.5 max-md:w-1/4 md:w-1/5">
									<span class="text-base-content/90 text-xs">资金</span>
									<span class="text-base-content/60">{{ item.money }}</span>
								</div>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" setup>
interface ranking {
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
	score: number;
}
interface res {
	success: boolean;
	data: ranking[];
	cacheTime: string;
}

// const score = (level: number, prosperity_degree: number, money: number, member_count: number): number => {
// 	return level * 1000 + prosperity_degree * 0.1 + money * 1 + member_count * 100;
// };
const score = (level: number, month_prosperity: number, money: number): number => {
	const levelScore = Math.pow(level, 3) * 2000;
	const activeScore = month_prosperity * 1.0;
	const moneyScore = money * 0.1;

	return levelScore + activeScore + moneyScore;
};

const sorting = computed(() => {
	return data.value?.ranking.sort((a: any, b: any) => {
		return b.score - a.score;
	});
});

const { data, error } = await useAsyncData("mountains", async () => {
	const res = (await $fetch("/api/guild")) as res;
	const ranking: ranking[] = res.data.map((item) => {
		return {
			...item,
			score: score(item.level, item.month_prosperity_degree, item.money),
		};
	});
	return { ranking, time: res.cacheTime };
});
// const data = ref({
// 	ranking: [
// 		{
// 			guild_name: "&#ffdad5🐱&#ffdad5神&#ffdad5圣&#ffdad5猫&#ffdad5猫&#ffdad5教&#ffdad5🐱",
// 			description: "AliceIClodia",
// 			level: 1,
// 			money: 716,
// 			member_count: 3,
// 			prosperity_degree: 5068,
// 			month_prosperity_degree: 2040,
// 			member_max_count: 10,
// 			creator: "AliceIClodia",
// 			create_time: "2025-08-18T15:29:16.000Z",
// 			score: 2522.8,
// 		},
// 		{
// 			guild_name: "&x&f&f&0&c&0&c❀&x&e&c&2&8&3&d东&x&d&9&4&4&6&d部&x&c&5&5&f&9&e联&x&b&2&7&b&c&e合&x&9&f&9&7&f&f❀",
// 			description: null,
// 			level: 3,
// 			money: 4176,
// 			member_count: 24,
// 			prosperity_degree: 13348,
// 			month_prosperity_degree: 11315,
// 			member_max_count: 30,
// 			creator: "NAKANO666",
// 			create_time: "2025-08-18T15:41:55.000Z",
// 			score: 10910.8,
// 		},
// 		{
// 			guild_name: "&#ff0000红&#ff0000尘&#ff0000客&#ff0000栈",
// 			description: "广招建筑类玩家",
// 			level: 4,
// 			money: 9078,
// 			member_count: 38,
// 			prosperity_degree: 72040,
// 			month_prosperity_degree: 41969,
// 			member_max_count: 40,
// 			creator: "Th_Long",
// 			create_time: "2025-08-18T15:52:17.000Z",
// 			score: 24082,
// 		},
// 		{
// 			guild_name: "&#61ecff天&#7ae4f8使&#92dcf0尘",
// 			description: "招长期活跃玩家，会长会给建筑玩家,当黑奴，有意加q群6934118,04，不住一起勿扰",
// 			level: 2,
// 			money: 15135,
// 			member_count: 19,
// 			prosperity_degree: 18267,
// 			month_prosperity_degree: 10736,
// 			member_max_count: 20,
// 			creator: "susiker",
// 			create_time: "2025-08-18T16:12:34.000Z",
// 			score: 20861.7,
// 		},
// 		{
// 			guild_name: "&#ff4040&n&l东&#ff5f44&n&l煌&#ff7e47&n&l碧&#ffa341&n&l原&#ffc83a&n❀",
// 			description: null,
// 			level: 2,
// 			money: 3750,
// 			member_count: 16,
// 			prosperity_degree: 8392,
// 			month_prosperity_degree: 4145,
// 			member_max_count: 20,
// 			creator: "Keq1ng9",
// 			create_time: "2025-08-18T16:40:42.000Z",
// 			score: 8189.2,
// 		},
// 		{
// 			guild_name: "&x&a&e&b&0&c&f🎐&x&b&6&a&2&c&9缘&x&b&e&9&4&c&3芯&x&c&6&8&6&b&e🌸&x&c&e&7&8&b&8苑&x&d&6&6&a&b&2依&x&d&d&5&d&a&cヅ",
// 			description: "蟹蟹您的选择，喵~,敲敲群:【867145114】,依依在这里很想你哦@,苑逢芯恨晚，因缘奈无依",
// 			level: 3,
// 			money: 212,
// 			member_count: 14,
// 			prosperity_degree: 7816,
// 			month_prosperity_degree: 6129,
// 			member_max_count: 30,
// 			creator: "Yi_Anu",
// 			create_time: "2025-08-18T17:12:22.000Z",
// 			score: 5393.6,
// 		},
// 		{
// 			guild_name: "&#565cf7☭&#5870f5&l黑&#5984f2&l海&#5b99f0&l岸&#5caded❧&#5ec1eb❀",
// 			description: null,
// 			level: 3,
// 			money: 7318,
// 			member_count: 24,
// 			prosperity_degree: 29198,
// 			month_prosperity_degree: 1901,
// 			member_max_count: 30,
// 			creator: "putaou",
// 			create_time: "2025-08-18T23:15:42.000Z",
// 			score: 15637.8,
// 		},
// 		{
// 			guild_name: "&x&f&f&2&1&c&e&l『&x&d&0&6&b&d&e✲&x&a&1&b&5&e&f&l夜&x&7&2&f&f&f&f&l梦&x&a&1&f&9&d&9&l阁&x&d&0&f&3&b&2✲&x&f&f&e&d&8&c&l』",
// 			description: "夜有所思,日有所梦,夜梦阁欢迎广大玩家加入",
// 			level: 3,
// 			money: 5509,
// 			member_count: 23,
// 			prosperity_degree: 3104,
// 			month_prosperity_degree: 6379,
// 			member_max_count: 30,
// 			creator: "E_yiyi",
// 			create_time: "2025-08-19T13:16:34.000Z",
// 			score: 11119.4,
// 		},
// 		{
// 			guild_name: "&#d9afd9&l童&#97d9e1&l话",
// 			description: null,
// 			level: 3,
// 			money: 8544,
// 			member_count: 13,
// 			prosperity_degree: 6923,
// 			month_prosperity_degree: 9087,
// 			member_max_count: 30,
// 			creator: "Yanmoune",
// 			create_time: "2025-08-20T16:51:57.000Z",
// 			score: 13536.3,
// 		},
// 		{
// 			guild_name: "&#f3e02a&l思&#f1c650&l源&#eeab76&l的&#eb919c&l小&#e976c2&l窝",
// 			description: "进工会请进1067099012",
// 			level: 2,
// 			money: 4893,
// 			member_count: 14,
// 			prosperity_degree: 10666,
// 			month_prosperity_degree: 7752,
// 			member_max_count: 20,
// 			creator: "SyuanCN",
// 			create_time: "2025-08-23T05:26:21.000Z",
// 			score: 9359.6,
// 		},
// 		{
// 			guild_name: "懒狗之家",
// 			description: "无忧无虑的懒狗之家",
// 			level: 1,
// 			money: 689,
// 			member_count: 4,
// 			prosperity_degree: 213,
// 			month_prosperity_degree: 789,
// 			member_max_count: 10,
// 			creator: "zPE_WilfulSnow09",
// 			create_time: "2025-08-27T07:17:11.000Z",
// 			score: 2110.3,
// 		},
// 		{
// 			guild_name: "寒山基地",
// 			description: null,
// 			level: 2,
// 			money: 430,
// 			member_count: 11,
// 			prosperity_degree: 1525,
// 			month_prosperity_degree: 3929,
// 			member_max_count: 20,
// 			creator: "Kobe1145145",
// 			create_time: "2025-08-30T13:15:59.000Z",
// 			score: 3682.5,
// 		},
// 		{
// 			guild_name: "&#00ff33&l&n[&#2bd52b&l&n⭐&#55aa22&l&n恶&#80801a&l&n魔&#aa5511&l&n郡&#d52b09&l&n⭐&#ff0000&l&n]",
// 			description: null,
// 			level: 1,
// 			money: 400,
// 			member_count: 4,
// 			prosperity_degree: 5610,
// 			month_prosperity_degree: 5172,
// 			member_max_count: 10,
// 			creator: "xw321",
// 			create_time: "2025-09-05T14:58:06.000Z",
// 			score: 2361,
// 		},
// 		{
// 			guild_name: "&#39d7ff♖&#2db7fe罗&#2297fd德&#1676fb岛&#0a56fa♖",
// 			description: "重铸未来，方舟启航,罗德岛欢迎你的到来",
// 			level: 2,
// 			money: 3441,
// 			member_count: 12,
// 			prosperity_degree: 7965,
// 			month_prosperity_degree: 9051,
// 			member_max_count: 20,
// 			creator: "Windgreen33",
// 			create_time: "2025-09-21T14:22:07.000Z",
// 			score: 7437.5,
// 		},
// 	],
// 	time: "2025-10-26T03:13:54.658Z",
// });
</script>
