<template>
	<div class="mx-auto flex max-w-6xl flex-col gap-8 py-24 max-md:px-4">
		<div class="prose">
			<NuxtLink to="/" class="text-base-content/75 mb-2 flex items-center gap-1 text-sm no-underline">
				<icon name="gravity-ui:arrow-uturn-ccw-left" />
				回到首页
			</NuxtLink>
			<h1 class="flex items-center gap-2"><icon name="gravity-ui:server" />服务器性能监控</h1>
			<p>在这里, 你可以查看橙服所有服务器的运行状态</p>
		</div>
		<maps />
		<ul class="flex flex-col gap-2">
			<li>
				<div class="card card-border bg-base-100/25 text-base-content shadow-xs backdrop-blur-md">
					<div class="card-body flex gap-2" v-if="Object.keys(serverInfo2).length === 0">
						<p>游戏服务器-主服-枣庄</p>
						<p>服务器已离线, 或者正在加载</p>
					</div>
					<div class="card-body flex gap-2" v-else>
						<p>游戏服务器-主服-枣庄</p>
						<div class="flex items-center gap-2">
							<Icon name="icon-park-solid:windows" class="text-4xl" />
							<div>
								<p class="text-lg">{{ serverInfo2.os?.platform }}</p>
								<p class="text-base-content/75">{{ serverInfo2.os?.distro }}</p>
							</div>
						</div>
						<div class="ml-11 flex items-center gap-1">
							<Icon name="gravity-ui:clock" />
							<span>服务器已运行 {{ (serverInfo2.time?.uptime / (24 * 60 * 60)).toFixed(1) }} 天</span>
						</div>
						<div class="flex flex-col gap-4">
							<div>
								<div class="collapse">
									<input type="checkbox" />
									<div class="collapse-title px-0 font-semibold">
										<div class="flex items-center justify-between">
											<span>CPU 使用率</span>
											<span>{{ serverInfo2.cpu?.currentLoad.toFixed(1) }}%</span>
										</div>
										<cprogress :usage="serverInfo2.cpu?.currentLoad"></cprogress>
									</div>
									<div class="collapse-content">
										<ul class="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
											<li v-for="(cpu, index) in serverInfo2.cpu?.cpus" :key="index" class="flex items-center justify-center">
												<div class="stats">
													<div class="stat p-0">
														<div class="stat-title">cpu {{ index + 1 }}</div>
														<div class="stat-value">{{ cpu.load.toFixed(1) }} %</div>
														<div class="stat-desc">
															<cprogress :usage="cpu.load"></cprogress>
														</div>
													</div>
												</div>
											</li>
										</ul>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between">
										<span>内存使用率</span>
										<span>{{ serverInfo2.memory?.usage.toFixed(1) }}%</span>
									</div>
									<cprogress :usage="serverInfo2.memory?.usage"></cprogress>
								</div>
							</div>
							<ul class="grid grid-cols-4">
								<li v-for="(disk, index) in serverInfo2.disk" :key="index">
									<div class="stat flex flex-col place-items-center gap-1 p-0">
										<div class="stat-title">{{ disk.fs }}</div>
										<div class="stat-value">
											<ringprogress :usage="disk.use"></ringprogress>
										</div>
										<div class="stat-desc">剩余可用: {{ (disk.available / (1024 * 1024 * 1024)).toFixed(2) }} GB</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</li>
			<li>
				<div class="card card-border bg-base-100/25 text-base-content shadow-xs backdrop-blur-md">
					<div class="card-body flex gap-2" v-if="Object.keys(serverInfo).length === 0">
						<p>游戏服务器-主服-宁波</p>
						<p>服务器已离线, 或者正在加载</p>
					</div>
					<div class="card-body flex gap-2" v-else>
						<p>游戏服务器-主服-宁波</p>
						<div class="flex items-center gap-2">
							<Icon name="icon-park-solid:windows" class="text-4xl" />
							<div>
								<p class="text-lg">{{ serverInfo.os?.platform }}</p>
								<p class="text-base-content/75">{{ serverInfo.os?.distro }}</p>
							</div>
						</div>
						<div class="ml-11 flex items-center gap-1">
							<Icon name="gravity-ui:clock" />
							<span>服务器已运行 {{ (serverInfo.time?.uptime / (24 * 60 * 60)).toFixed(1) }} 天</span>
						</div>
						<div class="flex flex-col gap-4">
							<div>
								<div class="collapse">
									<input type="checkbox" />
									<div class="collapse-title px-0 font-semibold">
										<div class="flex items-center justify-between">
											<span>CPU 使用率</span>
											<span>{{ serverInfo.cpu?.currentLoad.toFixed(1) }}%</span>
										</div>
										<cprogress :usage="serverInfo.cpu?.currentLoad"></cprogress>
									</div>
									<div class="collapse-content">
										<ul class="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
											<li v-for="(cpu, index) in serverInfo.cpu?.cpus" :key="index" class="flex items-center justify-center">
												<div class="stats">
													<div class="stat p-0">
														<div class="stat-title">cpu {{ index + 1 }}</div>
														<div class="stat-value">{{ cpu.load.toFixed(1) }} %</div>
														<div class="stat-desc">
															<cprogress :usage="cpu.load"></cprogress>
														</div>
													</div>
												</div>
											</li>
										</ul>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between">
										<span>内存使用率</span>
										<span>{{ serverInfo.memory?.usage.toFixed(1) }}%</span>
									</div>
									<cprogress :usage="serverInfo.memory?.usage"></cprogress>
								</div>
							</div>
							<ul class="flex items-center justify-between">
								<li v-for="(disk, index) in serverInfo.disk" :key="index">
									<div class="stat flex flex-col place-items-center gap-1 p-0">
										<div class="stat-title">{{ disk.fs }}</div>
										<div class="stat-value">
											<ringprogress :usage="disk.use"></ringprogress>
										</div>
										<div class="stat-desc">剩余可用: {{ (disk.available / (1024 * 1024 * 1024)).toFixed(2) }} GB</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</li>
			<li>
				<div class="card card-border bg-base-100/25 text-base-content shadow-xs backdrop-blur-md">
					<div class="card-body flex gap-2" v-if="Object.keys(serverInfo1).length === 0">
						<p>游戏服务器-子服-宿迁</p>
						<p>服务器已离线, 或者正在加载</p>
					</div>
					<div class="card-body flex gap-2" v-else>
						<p>游戏服务器-子服-宿迁</p>
						<div class="flex items-center gap-2">
							<Icon name="icon-park-solid:windows" class="text-4xl" />
							<div>
								<p class="text-lg">{{ serverInfo1.os?.platform }}</p>
								<p class="text-base-content/75">{{ serverInfo1.os?.distro }}</p>
							</div>
						</div>
						<div class="ml-11 flex items-center gap-1">
							<Icon name="gravity-ui:clock" />
							<span>服务器已运行 {{ (serverInfo1.time?.uptime / (24 * 60 * 60)).toFixed(1) }} 天</span>
						</div>
						<div class="flex flex-col gap-4">
							<div>
								<div class="collapse">
									<input type="checkbox" />
									<div class="collapse-title px-0 font-semibold">
										<div class="flex items-center justify-between">
											<span>CPU 使用率</span>
											<span>{{ serverInfo1.cpu?.currentLoad.toFixed(1) }}%</span>
										</div>
										<cprogress :usage="serverInfo1.cpu?.currentLoad"></cprogress>
									</div>
									<div class="collapse-content">
										<ul class="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
											<li v-for="(cpu, index) in serverInfo1.cpu?.cpus" :key="index" class="flex items-center justify-center">
												<div class="stats">
													<div class="stat p-0">
														<div class="stat-title">cpu {{ index + 1 }}</div>
														<div class="stat-value">{{ cpu.load.toFixed(1) }} %</div>
														<div class="stat-desc">
															<cprogress :usage="cpu.load"></cprogress>
														</div>
													</div>
												</div>
											</li>
										</ul>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between">
										<span>内存使用率</span>
										<span>{{ serverInfo1.memory?.usage.toFixed(1) }}%</span>
									</div>
									<cprogress :usage="serverInfo1.memory?.usage"></cprogress>
								</div>
							</div>
							<ul class="grid grid-cols-4">
								<li v-for="(disk, index) in serverInfo1.disk" :key="index">
									<div class="stat flex flex-col place-items-center gap-1 p-0">
										<div class="stat-title">{{ disk.fs }}</div>
										<div class="stat-value">
											<ringprogress :usage="disk.use"></ringprogress>
										</div>
										<div class="stat-desc">剩余可用: {{ (disk.available / (1024 * 1024 * 1024)).toFixed(2) }} GB</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
const serverInfo = ref({});
const serverInfo1 = ref({});
const serverInfo2 = ref({});

onMounted(async () => {
	const { $socket, $zf, $zz } = useNuxtApp() as any;

	$socket.on("server", (data: any) => {
		serverInfo.value = data;
	});
	$zf.on("server", (data: any) => {
		serverInfo1.value = data;
	});
	$zf.on("server", (data: any) => {
		serverInfo2.value = data;
	});
});
</script>
