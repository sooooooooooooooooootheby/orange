<template>
	<div class="mt-18 px-4 md:max-w-2xl md:mx-auto">
		<div class="mb-4 flex w-full flex-col items-center pt-8">
			<p class="mb-2 text-4xl font-bold text-[#FccA96]">封神榜</p>
			<p>在这里你可以查看有哪些玩家被</p>
			<p class="font-bold">封禁, 禁言, 警告, 踢出</p>
		</div>
		<div class="mb-6 px-6">
			<Tabs :default-value="route.path">
				<TabsList class="w-full">
					<TabsTrigger v-for="item in tabItems" :key="item.path" :value="item.path" @click="navigateTo(item.path)">
						<Icon :name="item.icon" />
						<span>{{ item.label }}</span>
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
		<div class="mx-auto">
			<slot />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabItems = [
	{ icon: "gravity-ui:ban", label: "封禁", path: "/litebans" },
	{ icon: "gravity-ui:comment-slash", label: "禁言", path: "/litebans/mutes" },
	{ icon: "gravity-ui:exclamation-shape", label: "警告", path: "/litebans/warnings" },
	{ icon: "gravity-ui:broom-motion", label: "踢出", path: "/litebans/kicks" },
];

const route = useRoute();
const activeTab = ref(route.path);

watch(activeTab, (newTab) => {
	navigateTo(newTab);
});
</script>
