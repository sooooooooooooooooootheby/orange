<template>
	<div class="px-4 mt-18 flex flex-col gap-4 md:max-w-4xl md:mx-auto md:pt-12">
		<div class="flex flex-col items-start gap-1 md:text-sm">
			<p class="text-4xl font-bold">蓝图</p>
			<p class="text-gray-400">Blue Maps</p>
			<br />
			<p class="text-lg font-bold">✨这里是什么地方?✨</p>
			<p>
				「蓝图」是我们为服务器的玩家打造的展示小屋! 不管是超级壮观的漂亮城堡, 还是嗡嗡作响的超高效生电机器,
				这里全都可以秀出来!
			</p>
			<p>你可以在这里：</p>
			<p>✅ 晒出你的宝贝作品, 收获大家的点赞!</p>
			<p>✅ 偷偷围观大佬们的超神设计, get新灵感!</p>
			<Drawer>
				<DrawerTrigger class="flex items-center">
					<div class="bg-gray-800 text-gray-50 py-2 px-4 rounded-lg">投稿须知</div>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerTitle></DrawerTitle>
					<DrawerDescription class="p-4 pb-8">
						<p class="text-default">如果你也想展示你心仪的作品, 那就在QQ上私聊 <code>AliceIClodia</code> 吧!</p>
						<p class="text-sm text-gray-500">
							注: 请添加 <code>AliceIClodia</code> 为好友, 说明来意, 并且将图片打包成压缩包发送.
						</p>
						<br />
						<p class="text-default">投稿请准备一下信息</p>
						<ul class="ml-6 list-disc text-gray-500">
							<li>照片 (你可以多拍几张照片)</li>
							<li>作者 (支持多人共创)</li>
							<li>地标 (如果有的话)</li>
							<li>坐标 (可选)</li>
							<li>名字 (建筑的名字, 例如: xxx的城堡)</li>
							<li>介绍 (一段介绍)</li>
						</ul>
					</DrawerDescription>
				</DrawerContent>
			</Drawer>
		</div>
		<div class="flex flex-col gap-3 md:grid-cols-2 md:grid">
			<Dialog v-for="item in blueMaps" :key="item.bid">
				<DialogTrigger>
					<Card class="border-default md:h-full">
						<CardHeader>
							<CardTitle class="text-left">{{ item.title }}</CardTitle>
							<CardDescription class="truncate text-left">{{ item.info }}</CardDescription>
						</CardHeader>
						<CardContent>
							<img :src="item.image[0]" :alt="item.image[0]" class="rounded-lg" />
						</CardContent>
					</Card>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle class="text-start">{{ item.title }}</DialogTitle>
						<DialogDescription class="text-start">{{ item.info }}</DialogDescription>
					</DialogHeader>
					<Carousel>
						<CarouselContent>
							<CarouselItem v-for="image in item.image">
								<img :src="image" :alt="image" class="rounded-lg" />
							</CarouselItem>
						</CarouselContent>
					</Carousel>
					<div class="border-t-1 border-dashed border-default"></div>
					<div class="scrollbar-hide flex max-h-48 flex-col gap-2 overflow-y-scroll">
						<div
							class="flex items-center gap-2"
							v-for="(author, index) in item?.authors"
							:key="`${author}-${index}`"
						>
							<img :src="handleHead(author)" :alt="author" class="size-8" />
							<p class="text-base">{{ author }}</p>
						</div>
					</div>
					<div class="text-gray-600">
						<div class="flex items-center gap-1">
							<Icon name="gravity-ui:house" />
							<span>地标: {{ item?.warp }}</span>
						</div>
						<div
							class="flex items-center gap-1"
							v-if="item.coordinate.x !== 0 || item.coordinate.x !== 0 || item.coordinate.x !== 0"
						>
							<Icon name="gravity-ui:map-pin" />
							<span>
								坐标: x: {{ item?.coordinate.x }}, z: {{ item?.coordinate.z }}, y: {{ item?.coordinate.y }}
							</span>
						</div>
					</div>
					<div class="border-t-1 border-dashed border-gray-400"></div>
					<div class="flex justify-between">
						<p class="text-sm text-gray-400 dark:text-gray-600">
							{{ handleTime(item.time) }}
						</p>
						<div class="flex cursor-pointer items-center gap-1 text-gray-500 text-sm" @click="setLike(item.bid)">
							<Icon name="gravity-ui:heart" />
							<span>{{ item.liked }}</span>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	</div>
</template>

<script lang="ts" setup>
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface LikeResponse {
	success: boolean;
	liked: boolean;
	totalLikes: number;
}

const { data: blueMaps } = await useAsyncData("blueMaps", async () => {
	const res = await queryCollection("blueMaps").all();
	const likes = await Promise.all(
		res.map((item) =>
			$fetch<{ success: boolean; data: { bid: number; totalLikes: number } }>(`/api/blueMaps/getLike?bid=${item.bid}`)
		)
	);

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

	if (res.success && blueMaps.value) {
		blueMaps.value = blueMaps.value.map((item) => (item.bid === bid ? { ...item, liked: res.totalLikes } : item));
	}
};
</script>
