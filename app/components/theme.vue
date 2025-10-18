<template>
	<div class="flex items-center text-lg cursor-pointer">
		<Icon name="gravity-ui:sun" @click="$colorMode.preference = 'dark'" v-if="colorMode.value === 'light'" />
		<Icon name="gravity-ui:moon" @click="$colorMode.preference = 'light'" v-else />
	</div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();
</script>
