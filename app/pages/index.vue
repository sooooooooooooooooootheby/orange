<template>
	<div class="pt-28">
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
						<button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/blueMaps" class="flex items-center">蓝图</NuxtLink>
						</button>
						<button class="btn btn-sm btn-neutral mt-4">
							<NuxtLink to="/server" class="flex items-center">服务器状态</NuxtLink>
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
						<img src="/image/bg.webp" alt="cover" class="zoom rounded-lg" />
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

			<!-- <div v-if="server">
				<p class="text-base-content mb-8 text-center text-2xl font-bold">服务器运行状态</p>
				<div class="border-base-content/10 bg-base-100/25 text-base-content rounded-lg border p-6 shadow-xs backdrop-blur-md">
					<div class="mb-4 flex items-center gap-2 text-lg">
						<div class="bg-success size-2 rounded-full" :class="{ 'bg-error!': !server.online }"></div>
						<span>游戏服务器</span>
					</div>
					<div class="mb-2 flex items-center gap-2">
						<img :src="server.icon" :alt="server.host" class="h-16 w-16 rounded-lg" />
						<div class="flex flex-col">
							<span class="text-lg">生存服</span>
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
					<ClientOnly>
						<div>
							<div class="flex items-center justify-between">
								<span>CPU 使用率</span>
								<span>{{ serverInfo.cpu?.currentLoad.toFixed(1) }}%</span>
							</div>
							<cprogress :usage="serverInfo.cpu?.currentLoad"></cprogress>
						</div>
						<div>
							<div class="flex items-center justify-between">
								<span>内存使用率</span>
								<span>{{ serverInfo.memory?.usage.toFixed(1) }}%</span>
							</div>
							<cprogress :usage="serverInfo.memory?.usage"></cprogress>
						</div>
					</ClientOnly>
				</div>
			</div> -->
			<div v-if="server">
				<p class="text-base-content mb-8 text-center text-2xl font-bold">服务器运行状态</p>
				<div class="border-base-content/10 bg-base-100/25 text-base-content rounded-lg border p-6 shadow-xs backdrop-blur-md">
					<div class="mb-4 flex items-center gap-2 text-lg">
						<!-- 添加空值检查 -->
						<div class="bg-success size-2 rounded-full" :class="{ 'bg-error!': !(server && server.online) }"></div>
						<span>游戏服务器</span>
					</div>
					<div v-if="server.icon" class="mb-2 flex items-center gap-2">
						<img :src="server.icon" :alt="server.host" class="h-16 w-16 rounded-lg" />
						<div class="flex flex-col">
							<span class="text-lg">生存服</span>
							<span class="text-sm" v-html="formattedText"></span>
						</div>
					</div>
					<div v-else class="mb-2">
						<div class="flex flex-col">
							<span class="text-lg">生存服</span>
							<span class="text-sm" v-html="formattedText"></span>
						</div>
					</div>
					<div class="stats">
						<div class="stat px-0">
							<div class="stat-title">当前在线玩家</div>
							<div class="stat-value text-success">{{ server.players?.online || 0 }}</div>
							<div class="stat-desc">玩家上限: {{ server.players?.max || 0 }}</div>
						</div>
					</div>
					<ClientOnly>
						<div>
							<div class="flex items-center justify-between">
								<span>CPU 使用率</span>
								<!-- 添加空值检查 -->
								<span>{{ (serverInfo.cpu?.currentLoad || 0).toFixed(1) }}%</span>
							</div>
							<cprogress :usage="serverInfo.cpu?.currentLoad || 0"></cprogress>
						</div>
						<div>
							<div class="flex items-center justify-between">
								<span>内存使用率</span>
								<!-- 添加空值检查 -->
								<span>{{ (serverInfo.memory?.usage || 0).toFixed(1) }}%</span>
							</div>
							<cprogress :usage="serverInfo.memory?.usage || 0"></cprogress>
						</div>
					</ClientOnly>
				</div>
			</div>

			<!-- 添加加载状态显示 -->
			<div v-else>
				<p class="text-base-content mb-8 text-center text-2xl font-bold">服务器运行状态</p>
				<div class="border-base-content/10 bg-base-100/25 text-base-content rounded-lg border p-6 shadow-xs backdrop-blur-md">
					<div class="flex items-center justify-center">
						<span class="loading loading-spinner loading-lg"></span>
						<span class="ml-2">正在获取服务器状态...</span>
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
				<NuxtLink to="/blueMaps" class="link link-hover">蓝图</NuxtLink>
				<NuxtLink to="/server" class="link link-hover">服务器状态</NuxtLink>
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
import Cprogress from "~/components/cprogress.vue";

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
	if (!server.value?.motd?.clean) {
		return "加载中..."; // 或者返回默认值，如 "服务器信息加载中..."
	}
	return server.value.motd.clean.replace(/\n/g, "<br>");
});

const serverInfo = ref({});

onMounted(() => {
	const { $socket } = useNuxtApp() as any;

	$socket.on("server", (data: any) => {
		serverInfo.value = data;
	});
});
</script>
