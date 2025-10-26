<template>
	<div class="pattern-cross-dots-lg text-base-content/10 min-h-screen w-full">
		<div class="mx-auto max-w-2xl py-24 max-md:px-4">
			<div class="prose mb-8">
				<NuxtLink to="/" class="text-base-content/75 mb-2 flex items-center gap-1 text-sm no-underline">
					<icon name="gravity-ui:arrow-uturn-ccw-left" />
					回到首页
				</NuxtLink>
				<h1 class="flex items-center gap-2"><icon name="gravity-ui:file-text" />服务器日志</h1>
				<p>在这里 你可以看到OrangeCraft如何从一无所有到现在的.</p>
			</div>
			<ContentRenderer v-if="data" :value="data" />
		</div>
	</div>
</template>

<script lang="ts" setup>
const { data } = await useAsyncData("logs", () => queryCollection("logs").first());
</script>
