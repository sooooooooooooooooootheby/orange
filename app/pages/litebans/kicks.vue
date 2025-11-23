<template>
	<div>
		<div role="alert" class="alert alert-error alert-soft" v-if="error">
			<icon name="gravity-ui:triangle-exclamation-fill" />
			<div>
				<h3 class="font-bold">数据请求失败!</h3>
				<div class="text-xs">{{ error }}</div>
			</div>
		</div>
		<div v-else-if="data" class="flex flex-col gap-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">搜索玩家</legend>
				<input type="text" class="input input-sm w-full outline-none" v-model="nameValue" placeholder="玩家 ID" />
			</fieldset>
			<select class="select select-sm outline-none" v-model="sortValue">
				<option value="height">从高到低</option>
				<option value="low">从低到高</option>
			</select>
			<ul class="flex flex-col gap-2">
				<li v-for="item in filteredData">
					<div class="card card-border bg-base-100/25 shadow-xs backdrop-blur-md">
						<div class="card-body">
							<div class="flex items-center gap-4">
								<avatar :name="item.name" :alt="item.name" class="size-12" />
								<div>
									<p class="text-base-content font-bold">{{ item.name }}</p>
									<p class="font-xs text-base-content/75">{{ item.uuid }}</p>
								</div>
							</div>
							<div>
								<p class="text-base-content">累计踢出次数: {{ item.kick_count }}</p>
								<ul class="text-base-content/75 ml-5 list-disc">
									<li v-for="items in item.kick">{{ items.reason }} x{{ items.reason_count }}</li>
								</ul>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseKicks } from "~/types/litebans";

const { data, error } = await useAsyncData<SuccessResponseKicks>("kicks", () => $fetch("/api/litebans/kicks"));
const nameValue = ref("");
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
	layout: "litebans",
});
</script>
