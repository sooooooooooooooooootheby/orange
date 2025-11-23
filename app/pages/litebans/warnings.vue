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
						<p class="text-base-content/75 text-sm">
							<span class="font-bold">{{ item.name }}</span> 因为 <span class="font-bold">"{{ item.reason }}"</span> 被警告
						</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import type { SuccessResponseB } from "~/types/litebans";

const { data, error } = await useAsyncData<SuccessResponseB>("warnings", () => $fetch("/api/litebans/warnings"));

definePageMeta({
	layout: "litebans",
});
</script>
