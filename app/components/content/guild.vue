<template>
	<div v-if="data" class="mx-auto mb-12 max-w-2xl">
		<div class="mb-2 flex items-center justify-between">
			<span>排名</span>
			<span class="text-xs text-gray-400">更新于 {{ handleTime(data.time) }}</span>
		</div>
		<div class="flex flex-col gap-3">
			<div v-for="(item, index) in sorting">
				<div class="bg-default border-default flex flex-col gap-1 rounded-lg border-1 px-3 py-2">
					<div class="flex items-center gap-2">
						<img :src="handleHead(item.creator)" alt="item.creator" class="mb-0! w-10!" />
						<div class="flex flex-col justify-center">
							<span v-html="toColoredHtml(item.guild_name)"></span>
							<span class="text-sm text-gray-600"> 会长: {{ item.creator }} </span>
						</div>
					</div>
					<p class="text-sm text-gray-600">{{ item.description }}</p>
					<div class="flex w-full">
						<div class="flex w-1/5 flex-col gap-0.5">
							<span class="text-xs text-gray-400">评分</span>
							<span :class="{ 'text-teal-500': index === 2, 'text-indigo-500': index === 1, 'text-rose-500': index === 0 }">{{ item.score.toFixed(2) }}</span>
						</div>
						<div class="flex w-1/5 flex-col gap-0.5">
							<span class="text-xs text-gray-400">等级</span>
							<span>{{ item.level }}</span>
						</div>
						<div class="flex w-1/5 flex-col gap-0.5">
							<span class="text-xs text-gray-400">会员</span>
							<span>{{ item.member_count }}</span>
						</div>
						<div class="flex w-1/5 flex-col gap-0.5">
							<span class="text-xs text-gray-400">活跃</span>
							<span>{{ item.prosperity_degree }}</span>
						</div>
						<div class="flex w-1/5 flex-col gap-0.5">
							<span class="text-xs text-gray-400">资金</span>
							<span>{{ item.money }}</span>
						</div>
					</div>
				</div>
			</div>
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

const score = (level: number, prosperity_degree: number, money: number, member_count: number): number => {
	return level * 1000 + prosperity_degree * 0.1 + money * 1 + member_count * 100;
};

const sorting = computed(() => {
	return data.value?.ranking.sort((a, b) => {
		return b.score - a.score;
	});
});

const { data } = await useAsyncData("mountains", async () => {
	const res = (await $fetch("/api/guild")) as res;
	const ranking: ranking[] = res.data.map((item) => {
		return {
			...item,
			score: score(item.level, item.prosperity_degree, item.money, item.member_count),
		};
	});
	return { ranking, time: res.cacheTime };
});
</script>
