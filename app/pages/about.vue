<template>
	<div v-if="about">
		<div class="mx-auto min-h-[calc(100vh-var(--ui-header-height))] px-4 py-12 md:w-4xl">
			<ContentRenderer :value="about" />
		</div>
	</div>
</template>

<script lang="ts" setup>
const { data: about } = await useAsyncData("about", () => queryCollection("about").first());
</script>
