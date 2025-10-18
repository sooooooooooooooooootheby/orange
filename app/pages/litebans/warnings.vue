<template>
	<div>
        <div v-if="error">
			<Alert variant="destructive">
				<AlertTitle>警告列表获取失败</AlertTitle>
				<AlertDescription>{{ error.message }}</AlertDescription>
			</Alert>
		</div>
		<div v-else>
			<div class="flex flex-col gap-2">
				<div v-for="item in data?.data" :key="item.uuid + '-' + item.time">
					<div class="border-default bg-default flex flex-col gap-2 rounded-lg border-1 p-3">
						<div class="flex gap-2">
							<img :src="handleHead(item.name)" alt="item.name" class="size-12" />
							<div class="w-full overflow-hidden">
								<p class="text-lg font-bold">{{ item.name }}</p>
								<p class="truncate text-sm text-gray-400 dark:text-gray-600">{{ item.uuid }}</p>
							</div>
						</div>
						<p>
							<span class="font-bold">{{ item.name }}</span> 因为 <span class="font-bold">"{{ item.reason }}"</span> 被警告
						</p>
					</div>
				</div>
			</div>
		</div>
        <Alert v-if="data?.data.length === 0">
			<AlertTitle>还没有记录哦</AlertTitle>
		</Alert>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseB } from "~/types/litebans";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const { data, error } = await useAsyncData<SuccessResponseB>("warnings", () => $fetch("/api/litebans/warnings"));

definePageMeta({
	layout: "bans",
});
</script>
