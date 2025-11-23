<template>
	<div class="flex w-full" v-if="content">
		<div class="prose w-full max-w-full md:pr-6">
			<div class="text-base-content border-base-content/10 border-b pt-8">
				<icon :name="content.icon" class="mb-2 text-6xl" />
				<h1>{{ content.title }}</h1>
				<p class="text-base-content/75">{{ content.introduction }}</p>
			</div>
			<div class="w-full pt-12 text-gray-500 md:hidden" v-if="content.body && content.body.toc && content.body.toc.links.length >= 2">
				<div>
					<div class="mb-1 flex items-center gap-1">
						<icon name="gravity-ui:list-ul" />
						<span class="text-sm font-bold">On This Page</span>
					</div>
					<div class="flex text-sm">
						<div class="border-base-content/10 mx-2 border-l-2"></div>
						<ul class="m-0! flex list-none flex-col gap-2 p-0">
							<li v-for="item in content.body.toc.links">
								<NuxtLink :to="`#${item.id}`" class="no-underline">{{ item.text }}</NuxtLink>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<ContentRenderer :value="content" class="w-full max-w-full" />
		</div>
		<div class="relative w-70 shrink-0 pt-12 text-gray-500 max-md:hidden" v-if="content.body && content.body.toc && content.body.toc.links.length >= 2">
			<div class="fixed">
				<div class="mb-2 flex items-center gap-1">
					<icon name="gravity-ui:list-ul" />
					<p class="text-sm font-bold">On This Page</p>
				</div>
				<div class="flex text-sm">
					<div class="border-base-content/10 mx-2 border-l-2"></div>
					<ul class="flex flex-col gap-2">
						<li v-for="item in content.body.toc.links">
							<NuxtLink :to="`#${item.id}`">{{ item.text }}</NuxtLink>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const route = useRoute();

const { data: content } = await useAsyncData(route.path, () => queryCollection("docs").path(route.path).first());

definePageMeta({
	layout: "docs",
});

useSeoMeta({
	title: `${content.value?.title} | Orange Craft Mc`,
	ogTitle: `${content.value?.title} | Orange Craft Mc`,
});
</script>
