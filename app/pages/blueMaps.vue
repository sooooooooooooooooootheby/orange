<template>
	<div class="mx-auto max-w-6xl py-24 max-md:px-4">
		<div class="prose mb-8">
			<NuxtLink to="/" class="text-base-content/75 mb-2 flex items-center gap-1 text-sm no-underline">
				<icon name="gravity-ui:arrow-uturn-ccw-left" />
				回到首页
			</NuxtLink>
			<h1 class="flex items-center gap-2"><icon name="gravity-ui:file" />蓝图</h1>
			<p>在这里你也可以看到由玩家投稿的机器 / 建筑.</p>
			<p>如果你也想把自己的建筑展示出来, 点击下面的投稿须知查看投稿方法.</p>
			<button class="btn btn-sm btn-neutral" onclick="tgxz.showModal()">投稿须知</button>
			<dialog id="tgxz" class="modal">
				<div class="modal-box">
					<h3 class="mt-0">投稿须知</h3>
					<p class="text-sm">如果你想要投稿, 请添加 <code>AliceIClodia</code> 为好友, 说明来意, 并且将图片打包成压缩包发送.</p>
					<p>投稿请准备一下信息</p>
					<ul class="ml-6 list-disc">
						<li>照片 (你可以多拍几张照片)</li>
						<li>作者 (支持多人共创)</li>
						<li>地标 (如果有的话)</li>
						<li>名字 (建筑的名字, 例如: xxx的城堡)</li>
						<li>介绍 (一段介绍)</li>
					</ul>
					<div class="modal-action">
						<form method="dialog">
							<button class="btn btn-sm btn-neutral">关闭</button>
						</form>
					</div>
				</div>
			</dialog>
		</div>
		<div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
			<template v-for="item in buleMaps">
				<div class="stack group cursor-pointer" onclick="bluemap.showModal()" @click="blueMapItem = item">
					<div class="card bg-base-200 overflow-hidden text-center shadow-md">
						<div class="card-body relative p-0">
							<img :src="item.image[0]" :alt="item.image[0]" class="h-full w-full object-cover" />
							<div
								class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-100"
							></div>
							<div
								class="absolute bottom-0 left-0 z-2 p-6 text-left text-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-100"
							>
								<p class="text-2xl font-bold">{{ item.title }}</p>
								<p class="line-clamp-2">{{ item.info }}</p>
							</div>
						</div>
					</div>
					<div class="card bg-base-200 text-center opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100">
						<div class="card-body"></div>
					</div>
					<div class="card bg-base-200 text-center opacity-0 shadow-sm transition-opacity duration-450 group-hover:opacity-100">
						<div class="card-body"></div>
					</div>
				</div>
			</template>
			<dialog id="bluemap" class="modal">
				<div class="modal-box max-w-4xl">
					<form method="dialog">
						<button class="btn btn-sm btn-circle btn-ghost text-base-content absolute top-2 right-2">✕</button>
					</form>
					<div class="flex flex-col gap-2">
						<h3 class="text-base-content text-2xl font-bold">{{ blueMapItem.title }}</h3>
						<p class="text-base-content/80 text-sm">{{ blueMapItem.info }}</p>
						<ul>
							<template v-for="authors in blueMapItem.authors">
								<li class="flex items-center gap-2">
									<avatar :name="authors" :alt="authors" class="size-8" />
									<span class="text-base-content/90">{{ authors }}</span>
								</li>
							</template>
						</ul>
						<Carousel :images="blueMapItem.image" />
						<div class="text-base-content flex items-center gap-1" v-if="blueMapItem.warp">
							<Icon name="gravity-ui:location-arrow" /> <span>地标: </span> {{ blueMapItem.warp }}
						</div>
					</div>
				</div>
			</dialog>
		</div>
	</div>
</template>

<script lang="ts" setup>
const blueMapItem = ref({});

const { data: buleMaps } = await useAsyncData("blueMaps", () => queryCollection("blueMaps").all());
</script>
