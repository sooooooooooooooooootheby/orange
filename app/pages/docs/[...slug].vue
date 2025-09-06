<template>
	<div v-if="page">
		<UPage class="bg-default border-default mx-auto min-h-[calc(100vh-var(--ui-header-height))] border-r-1 border-l-1 px-4 md:max-w-(--ui-container)">
			<template #left>
				<UPageAside>
					<UContentSearchButton class="mb-4 w-full px-2" variant="outline">搜索...</UContentSearchButton>
					<UContentNavigation type="multiple" :navigation="appConfig.navigation" v-if="route.path.includes('docs')" />
				</UPageAside>
			</template>
			<UPageBody>
				<ContentRenderer :value="page" />
			</UPageBody>
			<template v-if="page.body?.toc?.links?.length" #right>
				<UContentToc highlight :links="page.body?.toc?.links" v-if="page.isToc" class="md:bg-transparent! md:backdrop-blur-[0px]!" />
			</template>
			<ClientOnly>
				<LazyUContentSearch
					placeholder="你在找什么呢?"
					v-model:search-term="searchTerm"
					shortcut="meta_k"
					:files="files"
					:navigation="navigation"
					:fuse="{ resultLimit: 42 }"
				/>
			</ClientOnly>
		</UPage>
	</div>
</template>

<script lang="ts" setup>
const appConfig = useAppConfig();
const route = useRoute();

const { data: page } = await useAsyncData(route.path, () => queryCollection("docs").path(route.path).first());
if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const { data: navigation } = await useAsyncData("navigation", () => queryCollectionNavigation("docs"));
const { data: files } = await useAsyncData("search", () => queryCollectionSearchSections("docs"));
const searchTerm = ref("");

useSeoMeta({
	title: `${page.value?.title} | Orange Craft Mc`,
	ogTitle: `${page.value?.title} | Orange Craft Mc`,
});
</script>
