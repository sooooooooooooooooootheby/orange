<template>
	<div class="h-16 w-full backdrop-blur-lg bg-white/75 dark:bg-[#121212]/75 border-b-1 border-default fixed top-0 left-0 z-3">
		<div class="h-full flex justify-between items-center px-4 md:hidden">
			<div class="flex items-center gap-2">
				<Drawer>
					<DrawerTrigger class="flex items-center">
						<Icon name="gravity-ui:bars" />
					</DrawerTrigger>
					<DrawerContent>
						<DrawerTitle></DrawerTitle>
						<DrawerDescription class="h-[50vh] overflow-scroll p-4">
							<ul class="flex flex-col gap-3">
								<DrawerClose class="flex">
									<li class="text-default">
										<NuxtLink to="/">首页 - Home</NuxtLink>
									</li>
								</DrawerClose>
								<DrawerClose class="flex">
									<li class="text-default" data-slot="drawer-close">
										<NuxtLink to="/litebans">封神榜 - LiteBans</NuxtLink>
									</li>
								</DrawerClose>
								<DrawerClose class="flex">
									<li class="text-default">
										<NuxtLink to="/bluemaps">蓝图 - BlueMap</NuxtLink>
									</li>
								</DrawerClose>
								<DrawerClose class="flex">
									<li class="font-bold text-lg mb-1 text-default">服务器指北 - Docs</li>
								</DrawerClose>
								<li v-for="item in appConfig.navigation" :key="item.title">
									<DrawerClose class="flex">
										<NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
									</DrawerClose>
									<ul v-if="item.children" class="ml-4 flex flex-col gap-0.5">
										<DrawerClose class="flex flex-col items-start gap-2 mt-2">
											<li v-for="items in item.children">
												<NuxtLink :to="items.path">{{ items.title }}</NuxtLink>
											</li>
										</DrawerClose>
									</ul>
								</li>
							</ul>
						</DrawerDescription>
					</DrawerContent>
				</Drawer>

				<span class="font-bold">Orange Craft Mc</span>
			</div>
			<theme />
		</div>
		<div class="max-w-6xl md:px-4 h-full mx-auto flex justify-between items-center max-md:hidden">
			<div class="w-1/3 flex items-center gap-2">
				<logo class="w-4" />
				<span class="font-bold">Orange Craft Mc</span>
			</div>
			<ul class="w-1/3 flex justify-center items-center gap-2 text-default-1 text-sm">
				<li class="hover:bg-default-1 duration-100 p-1 rounded-sm" :class="{ 'text-[#FccA96]': isPath('/') }">
					<NuxtLink to="/">首页</NuxtLink>
				</li>
				<li class="hover:bg-default-1 duration-100 p-1 rounded-sm" :class="{ 'text-[#FccA96]': isPath('/docs') }">
					<NuxtLink to="/docs">服务器指北</NuxtLink>
				</li>
				<li class="hover:bg-default-1 duration-100 p-1 rounded-sm" :class="{ 'text-[#FccA96]': isPath('/litebans') }">
					<NuxtLink to="/litebans">封神榜</NuxtLink>
				</li>
				<li class="hover:bg-default-1 duration-100 p-1 rounded-sm" :class="{ 'text-[#FccA96]': isPath('/bluemaps') }">
					<NuxtLink to="/bluemaps">蓝图</NuxtLink>
				</li>
			</ul>
			<div class="w-1/3 flex justify-end">
				<theme />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
const appConfig = useAppConfig();
const route = useRoute();

const isPath = (path: string) => {
	if (path === "/") {
		return route.path === path;
	}
	return route.path.includes(path);
};
</script>
