<template>
	<UHeader mode="slideover">
		<template #title>
			<logo />
		</template>

		<UNavigationMenu :items="appConfig.route" />

		<template #right>
			<UColorModeButton />
		</template>

		<template #body>
			<UNavigationMenu :items="appConfig.route" orientation="vertical" />
			<div v-if="route.path.includes('docs')">
				<USeparator class="my-4" v-if="route.path.includes('docs')" />
				<UContentSearchButton class="mb-4 w-full px-2" variant="outline">搜索...</UContentSearchButton>
				<UContentNavigation type="single" :navigation="appConfig.navigation" v-if="route.path.includes('docs')" />
			</div>
		</template>
	</UHeader>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const route = useRoute();
</script>
