<template>
	<div class="drawer md:drawer-open mx-auto w-full max-w-360">
		<input id="my-drawer-4" type="checkbox" class="drawer-toggle" checked />
		<div class="drawer-content flex flex-col py-16 max-md:px-4 max-md:pt-8 md:pl-16">
			<div class="pb-4 md:hidden">
				<label for="my-drawer-4" class="drawer-button flex items-center gap-1">
					<icon name="gravity-ui:layout-side-content" />
				</label>
			</div>
			<div class="breadcrumbs text-sm text-base-content">
				<ul>
					<li><icon name="gravity-ui:folder" class="mr-1.5" />home</li>
					<li v-for="item in breadcrumbs">{{ item }}</li>
				</ul>
			</div>
			<slot />
		</div>

		<div class="drawer-side md:is-drawer-close:overflow-visible md:*:bg-transparent">
			<label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
			<div class="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 is-drawer-open:p-2 flex min-h-full flex-col items-start">
				<div class="is-drawer-close:justify-center flex w-full flex-col justify-center gap-3 p-2 py-4">
					<div class="is-drawer-close:hidden flex items-center gap-1">
						<img src="/logo.jpg" alt="logo" class="w-5" />
						<span class="text-base-content font-bold">OrangeCraft</span>
					</div>
					<button class="btn btn-sm" @click="navigateTo('/')"><icon name="gravity-ui:house" />回到首页</button>
				</div>
				<ul class="menu w-full grow text-base-content/75">
					<li v-for="item in navigation?.[0]?.children" :key="item.title">
						<details open v-if="item.children">
							<summary>{{ item.title }}</summary>
							<ul>
								<template v-for="child in item.children" :key="child.path">
									<li v-if="!child.isHide" class="relative">
										<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }">
											{{ child.title }}
										</NuxtLink>
										<span class="absolute -right-1 -top-1 h-2 w-2 bg-rose-600 p-0 rounded-full" v-if="child.isHot"></span>
									</li>
								</template>
							</ul>
						</details>
						<button class="is-drawer-close:tooltip is-drawer-close:tooltip-right relative" :class="{ 'menu-active': item.path === route.path }" :data-tip="item.title" v-else-if="!item.isHide">
							<icon :name="String(item.icon ?? '')" class="my-1.5 inline-block size-4" />
							<NuxtLink :to="item.path" class="is-drawer-close:hidden">{{ item.title }}</NuxtLink>
							<span class="absolute -right-1 -top-1 h-2 w-2 bg-rose-600 p-0 rounded-full" v-if="item.isHot"></span>
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const appConfig = useAppConfig();
const route = useRoute();

const breadcrumbs = computed<string[]>(() => {
	return route.path.split("/").filter(Boolean);
});

const { data: navigation } = await useAsyncData("navigation", () => {
	return queryCollectionNavigation("docs", ["order", "icon", "isHide", "isHot"]).order("order", "ASC");
});
</script>
