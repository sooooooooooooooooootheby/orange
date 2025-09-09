<template>
	<div>
		<UAlert color="error" variant="soft" title="封禁列表获取失败" :description="error.message" icon="gravity-ui:exclamation-shape" v-if="error" />
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
						<USeparator type="dashed" />
						<div class="flex flex-col gap-1">
							<div class="flex gap-1">
								<img :src="handleHead(item.banned_by_name)" alt="item.name" class="size-6" />
								<span>{{ item.banned_by_name }}</span>
							</div>
							<p class="text-sm text-gray-400 dark:text-gray-600">{{ item.reason }}</p>
							<div class="mt-2 flex items-center gap-1">
								<UBadge
									icon="gravity-ui:clock"
									size="md"
									color="error"
									variant="soft"
									class="rounded-full"
									v-if="item.until === 0 && isBan(item.removed_by_date, item.until)"
								>
									永久封禁
								</UBadge>
								<UBadge icon="gravity-ui:clock" size="md" color="success" variant="soft" class="rounded-full" v-else-if="!item.removed_by_date">
									{{ handleTime(item.until) }}
								</UBadge>
								<UBadge icon="gravity-ui:ban" size="md" color="error" variant="soft" class="rounded-full" v-if="isBan(item.removed_by_date, item.until)">
									封禁中
								</UBadge>
								<UBadge icon="gravity-ui:circle-check" size="md" color="success" variant="soft" class="rounded-full" v-else> 已解封 </UBadge>
								<UBadge color="error" variant="outline" size="md" class="rounded-full" v-if="item.ipban.data[0] !== 0">Ban IP</UBadge>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseA } from "~/types/litebans";

const { data, error } = await useAsyncData<SuccessResponseA>("bans", () => $fetch("/api/litebans/bans"));

const isBan = (removed_by_date: Date | null, until: number): boolean => {
	if (removed_by_date) {
		return false;
	}
	if (until !== 0) {
		const now = new Date().getTime();
		if (now > until) {
			return false;
		}
	}
	return true;
};

definePageMeta({
	layout: "bans",
});
</script>
