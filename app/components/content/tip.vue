<template>
	<div role="alert" class="alert alert-soft" :class="`alert-${props.type}`">
		<span><slot mdc-unwrap="p" /></span>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps({ type: { type: String } });
</script>
