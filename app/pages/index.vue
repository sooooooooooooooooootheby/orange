<template>
	<div class="pattern-dots-md text-base-content/10 h-auto w-full pt-28">
		<div class="mx-auto flex min-h-screen max-w-4xl flex-col gap-20 text-gray-600 max-md:px-4">
			<div class="flex flex-col items-center justify-center gap-12">
				<div class="flex items-center gap-2">
					<img src="/logo.jpg" alt="logo" class="w-12" />
					<span class="text-base-content text-3xl font-bold">OrangeCraft</span>
				</div>
				<div class="text-center">
					<p class="text-base-content/80">欢迎来到橙服 · 纯净不删档生存</p>
					<p class="text-base-content/80">我们致力于打造一个沉浸、生动、自由的 Minecraft 世界.</p>
					<div class="flex justify-center gap-1">
						<button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/docs" class="flex items-center"> 🍊 服务器指北<icon name="gravity-ui:caret-right" /> </NuxtLink>
						</button>
						<button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/litebans" class="flex items-center">小黑屋</NuxtLink>
						</button>
						<button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/guild" class="flex items-center">公会</NuxtLink>
						</button>
						<!-- <button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/logs" class="flex items-center">服务器日志</NuxtLink>
						</button> -->
					</div>
				</div>
			</div>

			<div class="stack">
				<div class="card bg-base-200 text-center shadow-md">
					<div class="card-body p-0">
						<img src="https://orangecraftmc.obs.cn-south-1.myhuaweicloud.com/bg.webp" alt="cover" class="rounded-lg" />
					</div>
				</div>
				<div class="card bg-base-200 text-center shadow">
					<div class="card-body"></div>
				</div>
				<div class="card bg-base-200 text-center shadow-sm">
					<div class="card-body"></div>
				</div>
			</div>

			<ContentRenderer v-if="data" :value="data" class="prose max-w-full" />

			<div v-if="server">
				<p class="mb-8 text-center text-2xl font-bold">服务器运行状态</p>
				<div class="bg-base-100 rounded-lg border border-gray-200 p-6">
					<div class="mb-4 text-lg flex items-center gap-2">
						<div class="bg-success size-2 rounded-full" :class="{ 'bg-error!': !server.online }"></div>
						<span>游戏服务器</span>
					</div>
					<div class="mb-2 flex gap-2">
						<img :src="server.icon" :alt="server.host" class="rounded-lg" />
						<div class="flex flex-col">
							<span class="text-lg">{{ server.host }}</span>
							<span class="text-sm" v-html="formattedText"></span>
						</div>
					</div>
					<div class="stats">
						<div class="stat px-0">
							<div class="stat-title">当前在线玩家</div>
							<div class="stat-value text-success">{{ server.players.online }}</div>
							<div class="stat-desc">玩家上限: {{ server.players.max }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<footer class="footer sm:footer-horizontal bg-base-200 text-base-content mt-12 p-10">
			<aside>
				<img src="/logo.jpg" alt="logo" class="w-16" />
				<p>
					Love comes from OrangeCraftMC.
					<br />
					Copyright © 2025 Orangecraftmc
					<br />
					鄂ICP备2025144636号
				</p>
			</aside>
			<nav>
				<h6 class="footer-title">Navigation</h6>
				<NuxtLink to="docs" class="link link-hover">服务器指北</NuxtLink>
				<NuxtLink to="/litebans" class="link link-hover">小黑屋</NuxtLink>
				<NuxtLink to="/guild" class="link link-hover">公会</NuxtLink>
				<!-- <NuxtLink to="/logs" class="link link-hover">服务器日志</NuxtLink> -->
			</nav>
			<nav>
				<h6 class="footer-title">Social</h6>
				<div class="grid grid-flow-col gap-4">
					<a href="https://space.bilibili.com/1915573443?spm_id_from=333.788.upinfo.detail.click" target="_blank">
						<Icon name="mingcute:bilibili-fill" class="link link-hover text-xl" />
					</a>
				</div>
			</nav>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner";
import "vue-sonner/style.css";

const { data } = await useAsyncData("index", () => queryCollection("index").first());

interface MinecraftServerStatus {
	online: boolean;
	host: string;
	port: number;
	ip_address: string;
	eula_blocked: boolean;
	retrieved_at: number;
	expires_at: number;
	srv_record: null | {
		host: string;
		port: number;
	};
	version: {
		name_raw: string;
		name_clean: string;
		name_html: string;
		protocol: number;
	};
	players: {
		online: number;
		max: number;
		list: Array<{
			uuid: string;
			name_raw: string;
			name_clean: string;
			name_html: string;
		}>;
	};
	motd: {
		raw: string;
		clean: string;
		html: string;
	};
	icon: string;
	mods: Array<{
		name: string;
		version: string;
	}>;
	software: null | string;
	plugins: Array<{
		name: string;
		version: string;
	}>;
}

const { data: server } = await useFetch<MinecraftServerStatus>("https://api.mcstatus.io/v2/status/java/orangecraftmc.com");

const formattedText = computed(() => {
	return server.value?.motd.clean.replace(/\n/g, "<br>");
});
</script>
