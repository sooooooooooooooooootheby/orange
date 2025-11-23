<template>
	<div class="mx-auto max-w-2xl py-24 max-md:px-4">
		<div class="prose mb-8">
			<NuxtLink to="/" class="text-base-content/75 mb-2 flex items-center gap-1 text-sm no-underline"><icon name="gravity-ui:arrow-uturn-ccw-left" />回到首页</NuxtLink>
			<h1 class="flex items-center gap-2"><icon name="gravity-ui:xmark-shape" />小黑屋</h1>
			<p>在这里你可以查看有哪些玩家被 <strong>封禁, 禁言, 警告, 踢出</strong></p>
			<p>在服务器游玩以及群聊中聊天请遵守<NuxtLink to="/docs/playrule/chat">规则</NuxtLink></p>
			<ul class="menu menu-vertical lg:menu-horizontal p-0">
				<li v-for="item in tabItems" :key="item.value">
					<NuxtLink :to="item.value" class="px-6 no-underline" :class="{ 'menu-active text-gray-50': item.value === route.path }">
						<icon :name="item.icon" />
						{{ item.label }}
					</NuxtLink>
				</li>
			</ul>
		</div>
		<slot />
	</div>
</template>

<script lang="ts" setup>
const route = useRoute();

const tabItems = [
	{ icon: "gravity-ui:ban", label: "封禁", value: "/litebans" },
	{ icon: "gravity-ui:comment-slash", label: "禁言", value: "/litebans/mutes" },
	{ icon: "gravity-ui:exclamation-shape", label: "警告", value: "/litebans/warnings" },
	{ icon: "gravity-ui:broom-motion", label: "踢出", value: "/litebans/kicks" },
];
</script>
