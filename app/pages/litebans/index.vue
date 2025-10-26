<template>
	<div>
		<div role="alert" class="alert alert-error alert-soft" v-if="error">
			<icon name="gravity-ui:triangle-exclamation-fill" />
			<div>
				<h3 class="font-bold">数据请求失败!</h3>
				<div class="text-xs">{{ error }}</div>
			</div>
		</div>
		<ul v-else-if="data" class="flex flex-col gap-2">
			<li v-for="item in data.data">
				<div class="card card-border bg-base-100/25 shadow-xs backdrop-blur-md">
					<div class="card-body">
						<div class="flex items-center gap-4">
							<avatar :name="item.name" :alt="item.name" class="size-12" />
							<div>
								<p class="text-base-content font-bold">{{ item.name }}</p>
								<p class="font-xs text-base-content/75">{{ item.uuid }}</p>
							</div>
						</div>
						<div class="flex items-center gap-1">
							<avatar :name="item.banned_by_name" :alt="item.name" fallback="Console" class="size-8" />
							<span class="text-base-content font-bold">
								{{ item.banned_by_name }} -
								<NuxtTime locale="zh-CN" year="numeric" month="long" day="numeric" hour="2-digit" minute="2-digit" :datetime="item.time" />
							</span>
						</div>
						<p class="text-base-content/75 text-sm">{{ item.reason }}</p>
						<div class="mt-2 flex items-center gap-1">
							<div class="badge badge-soft badge-sm badge-error" v-if="item.until === 0">永久封禁</div>
							<div class="badge badge-soft badge-sm badge-error" :class="{ 'badge-success': Date.now() - item.until >= 0 }" v-else>
								{{ formatTimeRemaining(item.time, item.until) }}
							</div>
							<div
								class="badge badge-soft badge-sm badge-error"
								:class="{ 'badge-success': item.until !== 0 && Date.now() - item.until >= 0 }"
								v-if="item.ipban.data[0] === 1"
							>
								Ban IP
							</div>
						</div>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseA } from "~/types/litebans";

const { data, error } = await useAsyncData<SuccessResponseA>("bans", () => $fetch("/api/litebans/bans"));

definePageMeta({
	layout: "litebans",
});
</script>
