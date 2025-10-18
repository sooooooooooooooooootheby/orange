<template>
	<div class="my-18 max-md:px-4 md:max-w-6xl md:px-4 md:mx-auto md:my-16 md:flex relative">
		<div class="w-48 shrink-0 pt-12 fixed max-md:hidden">
			<ul class="text-[15px] text-default-1 flex flex-col gap-0.5">
				<li v-for="item in appConfig.navigation" :key="item.title">
					<NuxtLink
						:to="item.path"
						class="flex items-center gap-1 hover:bg-default-1 py-1 px-2 rounded-md"
						:class="{ 'text-[#FccA96]': isPath(item.path) }"
					>
						<Icon :name="item.icon" />{{ item.title }}
					</NuxtLink>
					<ul v-if="item.children" class="ml-5 flex flex-col gap-0.5">
						<li v-for="items in item.children">
							<NuxtLink
								:to="items.path"
								class="flex items-center gap-1 hover:bg-default-1 py-1 px-2 rounded-md"
								:class="{ 'text-[#FccA96]': isPath(items.path) }"
							>
								<Icon :name="item.icon" />{{ items.title }}
							</NuxtLink>
						</li>
					</ul>
				</li>
			</ul>
		</div>
		<div class="w-48 h-12 shrink-0 max-md:hidden"></div>
		<div class="enhancer px-4">
			<ContentRenderer v-if="page" :value="page" />
		</div>
	</div>
</template>

<script lang="ts" setup>
const route = useRoute();
const appConfig = useAppConfig();

const { data: page } = await useAsyncData(route.path, () => queryCollection("docs").path(route.path).first());

const isPath = (path: string) => {
	return route.path === path;
};

useSeoMeta({
	title: `${page.value?.title} | Orange Craft Mc`,
	ogTitle: `${page.value?.title} | Orange Craft Mc`,
});
</script>
