<template>
	<div
		class="radial-progress text-success"
		:class="{ 'text-warning': props.usage >= 70, 'text-error!': props.usage >= 90 }"
		:style="`--value: ${usage}; --thickness: 6px;`"
		:aria-valuenow="usage"
		role="progressbar"
	>
		<span class="text-sm">{{ usage.toFixed() }}%</span>
	</div>
</template>

<script lang="ts" setup>
const props = defineProps(["usage"]);
</script>

<style scoped>
/* 为DaisyUI的progress元素值的变化添加过渡 */
.radial-progress {
	transition: all 0.2s ease-in-out;
}

/* 关键：直接针对value属性变化的样式 */
.radial-progress[value] {
	transition: all 0.2s ease-in-out;
}

/* 如果需要更精细的控制，可以针对value属性的伪元素 */
.radial-progress[value]::-webkit-progress-value {
	transition: all 0.2s ease-in-out;
}

.radial-progress[value]::-moz-progress-bar {
	transition: all 0.2s ease-in-out;
}
</style>
