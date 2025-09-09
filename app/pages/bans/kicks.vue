<template>
	<div>
		<UAlert color="error" variant="soft" title="踢出列表获取失败" :description="error.message" icon="gravity-ui:exclamation-shape" v-if="error" />
		<div v-else>
			<div class="mb-3 flex flex-col gap-2">
				<UInput v-model="nameValue" placeholder="搜索玩家..." />
				<USelect v-model="sortValue" :items="sortItems" class="w-48" />
			</div>
			<div class="flex flex-col gap-2">
				<div v-for="item in filteredData" :key="item.uuid">
					<div class="border-default bg-default flex flex-col gap-2 rounded-lg border-1 p-3">
						<div class="flex gap-2">
							<img :src="handleHead(item.name)" alt="item.name" class="size-12" />
							<div class="w-full overflow-hidden">
								<p class="text-lg font-bold">{{ item.name }}</p>
								<p class="truncate text-sm text-gray-400 dark:text-gray-600">{{ item.uuid }}</p>
							</div>
						</div>
						<USeparator type="dashed" />
						<p>
							累计被踢出次数: <span class="font-bold">{{ item.kick_count }}</span>
						</p>
						<ul class="text-sm text-gray-500">
							<li v-for="kick in item.kick" class="list-inside list-disc">{{ kick.reason }} x{{ kick.reason_count }}</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseKicks } from "~/types/litebans";

const { data, error } = await useAsyncData<SuccessResponseKicks>("kicks", () => $fetch("/api/litebans/kicks"));

const nameValue = ref("");
const sortItems = ref([
	{
		label: "踢出次数从高到低",
		value: "height",
	},
	{
		label: "踢出次数从低到高",
		value: "low",
	},
]);
const sortValue = ref("height");

const filteredData = computed(() => {
	if (!data.value) return [];

	// 先搜索
	let result = data.value.data.filter((item) => item.name.toLowerCase().includes(nameValue.value.toLowerCase()));

	// 再排序
	if (sortValue.value === "height") {
		result.sort((a, b) => b.kick_count - a.kick_count);
	} else if (sortValue.value === "low") {
		result.sort((a, b) => a.kick_count - b.kick_count);
	}

	return result;
});

definePageMeta({
	layout: "bans",
});
</script>
