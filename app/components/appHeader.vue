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
		</template>
	</UHeader>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const route = useRoute();
</script>
