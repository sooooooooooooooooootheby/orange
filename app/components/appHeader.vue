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
			<USeparator class="my-4" v-if="route.path.includes('docs')" />
			<UContentNavigation type="multiple" :navigation="appConfig.navigation" v-if="route.path.includes('docs')" />
		</template>
	</UHeader>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const route = useRoute();
</script>
