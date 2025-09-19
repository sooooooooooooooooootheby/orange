<template>
	<div class="mx-auto min-h-[calc(100vh-var(--ui-header-height))] max-w-(--ui-container) py-12 max-md:px-4">
		<div>
			<p class="text-4xl">蓝图</p>
			<p class="text-gray-400">Blue Maps</p>
			<br />
			<p class="text-lg font-bold">✨这里是什么地方?✨</p>
			<p>「蓝图」是我们为服务器的玩家打造的展示小屋! 不管是超级壮观的漂亮城堡, 还是嗡嗡作响的超高效生电机器, 这里全都可以秀出来!</p>
			<p>你可以在这里：</p>
			<p>✅ 晒出你的宝贝作品, 收获大家的点赞!</p>
			<p>✅ 偷偷围观大佬们的超神设计, get新灵感!</p>

			<UModal title="投稿需知" description="">
				<UButton label="投稿需知" color="neutral" variant="soft" class="mt-2" />

				<template #body>
					<p>如果你也想展示你心仪的作品, 那就在QQ上私聊 <code>AliceIClodia</code> 吧!</p>
					<p class="text-gray-500 text-sm">注: 请添加 <code>AliceIClodia</code> 为好友, 说明来意, 并且将图片打包成压缩包发送.</p>
					<br>
					<p>投稿请准备一下信息</p>
					<ul class="ml-6 list-disc text-gray-500">
						<li>照片 (你可以多拍几张照片)</li>
						<li>作者 (支持多人共创)</li>
						<li>地标 (如果有的话)</li>
						<li>坐标 (可选)</li>
						<li>名字 (建筑的名字, 例如: xxx的城堡)</li>
						<li>介绍 (一段介绍)</li>
					</ul>
				</template>
			</UModal>
			<USeparator class="my-6" />
		</div>

		<UPageColumns>
			<UModal v-for="item in buleMaps" :key="item.bid" :title="item.title" :description="item.info" :ui="{ content: 'max-w-[92vw] max-h-auto sm:max-h-auto' }">
				<div label="Open" class="bg-default border-default cursor-pointer overflow-hidden rounded-lg border-1 duration-150 hover:scale-102 hover:shadow-lg">
					<img :src="item.image[0]" :alt="item.image[0]" />
					<div class="flex items-center justify-between px-4 py-3">
						<div class="flex items-center gap-2">
							<img :src="handleHead(item.authors[0])" :alt="item.authors[0]" class="size-12" v-if="item.authors[0]" />
							<div>
								<p class="text-xl font-bold">{{ item.title }}</p>
								<p class="text-sm text-gray-400 dark:text-gray-600">{{ item.authors[0] }}</p>
							</div>
						</div>
						<div class="flex cursor-pointer items-center justify-end gap-1 text-gray-500" @click="setLike(item.bid)">
							<Icon name="gravity-ui:heart" />
							<span>{{ item.liked }}</span>
						</div>
					</div>
				</div>

				<template #content>
					<div class="flex gap-2 p-1 max-md:flex-col">
						<UCarousel v-slot="item" loop auto-height :autoplay="{ delay: 4000 }" :items="item.image" class="mx-auto">
							<img :src="item.item" :alt="item" class="rounded-lg" />
						</UCarousel>
						<div class="flex md:w-sm shrink-0 flex-col p-4 w-full">
							<div class="flex-1">
								<p class="text-2xl">{{ item.title }}</p>
								<p class="text-gray-500">{{ item.info }}</p>
							</div>
							<div>
								<div class="flex cursor-pointer items-center gap-1 text-gray-500" @click="setLike(item.bid)">
									<Icon name="gravity-ui:heart" />
									<span>{{ item.liked }}</span>
								</div>
								<p class="text-sm text-gray-400 dark:text-gray-600">
									{{ handleTime(item.time) }}
								</p>
							</div>
							<USeparator class="my-2" />
							<div class="scrollbar-hide flex max-h-48 flex-col gap-2 overflow-y-scroll">
								<div class="flex items-center gap-2" v-for="(author, index) in item?.authors" :key="`${author}-${index}`">
									<img :src="handleHead(author)" :alt="author" class="size-8" />
									<p class="text-base">{{ author }}</p>
								</div>
							</div>
							<USeparator class="my-2" />
							<div>
								<div class="flex items-center gap-1">
									<Icon name="gravity-ui:house" />
									<span>地标: {{ item?.warp }}</span>
								</div>
								<div class="flex items-center gap-1" v-if="item.coordinate.x !== 0 || item.coordinate.x !== 0 || item.coordinate.x !== 0">
									<Icon name="gravity-ui:map-pin" />
									<span>坐标: x: {{ item?.coordinate.x }}, z: {{ item?.coordinate.z }}, y: {{ item?.coordinate.y }}</span>
								</div>
							</div>
						</div>
					</div>
				</template>
			</UModal>
		</UPageColumns>
	</div>
</template>

<script lang="ts" setup>
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface LikeResponse {
	success: boolean;
	liked: boolean;
	totalLikes: number;
}

const { data: buleMaps } = await useAsyncData("blueMaps", async () => {
	const res = await queryCollection("blueMaps").all();
	const likes = await Promise.all(res.map((item) => $fetch<{ success: boolean; data: { bid: number; totalLikes: number } }>(`/api/blueMaps/getLike?bid=${item.bid}`)));

	return res.map((item, index) => ({
		...item,
		liked: likes[index]?.data.totalLikes ?? 0,
	}));
});

const likeCooldowns = new Map<number, boolean>();

const setLike = async (bid: number) => {
	if (likeCooldowns.get(bid)) return;
	likeCooldowns.set(bid, true);
	setTimeout(() => likeCooldowns.set(bid, false), 1000);

	const fp = await FingerprintJS.load();
	const fingerprint = await fp.get();

	const res = await $fetch<LikeResponse>("/api/blueMaps/toggleLike", {
		method: "POST",
		body: { bid, fingerprint: fingerprint.visitorId },
	});

	if (res.success && buleMaps.value) {
		buleMaps.value = buleMaps.value.map((item) => (item.bid === bid ? { ...item, liked: res.totalLikes } : item));
	}
};
</script>
