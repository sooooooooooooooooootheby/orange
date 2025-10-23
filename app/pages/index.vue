<template>
	<div>
		<div class="w-screen h-screen overflow-hidden absolute top-0 left-0 flex flex-col items-center md:hidden">
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-100">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-90">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-80">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-70">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-60">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-50">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-40">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-30">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-20">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-10">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-5">ORANGE</p>
			<p class="text-[#FccA96] text-8xl font-bold select-none opacity-0">ORANGE</p>
		</div>
		<div class="relative z-1 flex flex-col items-center gap-4 md:gap-12 px-4">
			<div class="w-full h-screen flex flex-col items-center justify-center gap-2">
				<div class="relative">
					<p class="font-bold text-6xl text-default relative z-2"><span class="text-[#FccA96]">橙</span>子工艺</p>
					<logo class="absolute -right-18 -top-20 w-42 z-1 max-md:hidden" />
				</div>
				<p class="text-default2 relative z-2">一个不删档的1.21.x原版增强服务器!</p>
				<NuxtLink
					to="/docs"
					class="mt-2 flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-2 py-1.5 text-gray-50 duration-300 hover:bg-gray-700 hover:shadow-lg max-md:mt-2 max-md:text-xs"
				>
					<span>🍊</span>
					<span class="text-gray-400">|</span>
					<span class="text-sm">服务器指北</span>
					<Icon name="gravity-ui:arrow-right" />
				</NuxtLink>
			</div>
			<ul class="flex flex-col gap-2 md:grid md:grid-cols-2">
				<li v-for="item in empty">
					<Empty class="bg-gray-100/5 backdrop-blur-xs border-1 border-gray-300 h-full">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon :name="item.icon" />
							</EmptyMedia>
							<EmptyTitle>{{ item.title }}</EmptyTitle>
							<EmptyDescription>{{ item.des }}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</li>
			</ul>
			<div
				class="mx-auto w-[72vw] overflow-hidden rounded-lg border-1 border-gray-200 shadow-xl max-md:w-full dark:border-gray-800"
			>
				<div class="relative flex w-full items-center justify-center bg-white py-1.5 dark:bg-black">
					<div class="absolute left-2 flex gap-1.5">
						<div class="size-2.5 rounded-full border-1 border-red-400 bg-red-300"></div>
						<div class="size-2.5 rounded-full border-1 border-yellow-400 bg-yellow-300"></div>
						<div class="size-2.5 rounded-full border-1 border-green-400 bg-green-300"></div>
					</div>
					<p class="text-xs">Minecraft 1.21.8 - Orange craft mc</p>
				</div>
				<img src="https://orangecraftmc.obs.cn-south-1.myhuaweicloud.com/bg.webp" alt="cover" class="w-full" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const empty = ref([
	{
		icon: "gravity-ui:server",
		title: "强劲的服务器",
		des: "服务器为 9950X 16c128G 100M 保证玩家流畅的游戏体验.",
	},
	{
		icon: "gravity-ui:link",
		title: "高低版本兼容",
		des: "服务器支持 Java 1.16(推荐1.21.x) 及以上的客户端 和 基岩版 1.21.90~1.21.111 进入游玩.",
	},
	// {
	// 	icon: "gravity-ui:file",
	// 	title: "问卷审核 & 正版验证",
	// 	des: "服务器开启正版验证以及较严格的问卷审核, 提高入服门口, 拒绝熊孩子.",
	// },
	{
		icon: "gravity-ui:rocket",
		title: "丰富的活动",
		des: "每月初的抢龙活动以及不定期的小型活动, 丰富玩家的游戏体验.",
	},
]);
</script>
