<template>
	<div class="mb-8 px-4">
		<div class="flex h-[calc(100vh-var(--ui-header-height)-32px)] flex-col items-center justify-center">
			<p class="text-3xl font-bold text-gray-800 md:text-5xl dark:text-gray-200"><span class="text-orange-400">O</span>rangeCraftMC</p>
			<p class="text-3xl font-bold text-gray-800 md:text-5xl dark:text-gray-200"><span class="text-orange-400">橙</span>子工艺.</p>
			<p class="text-xs text-gray-600 md:text-lg dark:text-gray-400">一个不删档的<span>1.21.x</span>原版增强服务器!</p>
			<NuxtLink
				to="/docs"
				class="mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-gray-800 px-2 py-1 text-gray-50 duration-300 hover:bg-gray-700 hover:shadow-lg max-md:mt-2 max-md:text-xs"
			>
				<span>🍊</span>
				<span class="text-gray-400">|</span>
				<span class="text-sm">服务器指北</span>
				<Icon name="gravity-ui:arrow-right" />
			</NuxtLink>
		</div>
		<div class="mx-auto w-[72vw] overflow-hidden rounded-lg border-1 border-gray-200 shadow-xl max-md:w-full dark:border-gray-800">
			<div class="relative flex w-full items-center justify-center bg-white py-1.5 dark:bg-black">
				<div class="absolute left-2 flex gap-1.5">
					<div class="size-2.5 rounded-full border-1 border-red-400 bg-red-300"></div>
					<div class="size-2.5 rounded-full border-1 border-yellow-400 bg-yellow-300"></div>
					<div class="size-2.5 rounded-full border-1 border-green-400 bg-green-300"></div>
				</div>
				<p class="text-xs">Minecraft 1.21.8 - Orange craft mc</p>
			</div>
			<img src="https://orangecraftmc.obs.cn-south-1.myhuaweicloud.com/cover/cover.webp" alt="cover" class="w-full" />
		</div>
	</div>
</template>

<script lang="ts" setup>
useSeoMeta({
	title: `Orange Craft Mc`,
	ogTitle: `Orange Craft Mc`,
});
</script>