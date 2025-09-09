<template>
	<div class="mx-auto min-h-[calc(100vh-var(--ui-header-height))] max-w-(--ui-container) py-12">
		<div class="mb-4 flex w-full flex-col items-center">
			<p class="mb-2 text-4xl font-bold">封神榜</p>
			<p>在这里你可以查看有哪些玩家被</p>
			<p class="font-bold">封禁, 禁言, 警告, 踢出</p>
		</div>
		<div class="px-6 mb-6">
			<UTabs v-model="activeTab" :items="tabItems" class="max-w-xl mx-auto" size="xs" />
		</div>
		<div class="px-2 mx-auto md:w-xl">
			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup>
const tabItems = [
	{ icon: "gravity-ui:ban", label: "封禁", value: "/bans" },
	{ icon: "gravity-ui:comment-slash", label: "禁言", value: "/bans/mutes" },
	{ icon: "gravity-ui:exclamation-shape", label: "警告", value: "/bans/warnings" },
	{ icon: "gravity-ui:broom-motion", label: "踢出", value: "/bans/kicks" },
];

const route = useRoute();
const activeTab = ref(route.path);

watch(activeTab, (newTab) => {
	navigateTo(newTab);
});
</script>
