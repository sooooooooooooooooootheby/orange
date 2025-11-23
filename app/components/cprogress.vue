<template>
	<progress
		class="progress progress-success w-full"
		:class="{ 'progress-warning': props.usage >= 70, 'progress-error!': props.usage >= 85 }"
		:value="props.usage || 0"
		max="100"
	></progress>
</template>

<script lang="ts" setup>
const props = defineProps(["usage"]);
</script>

<style scoped>
/* 为DaisyUI的progress元素值的变化添加过渡 */
.progress {
	transition: all 0.2s ease-in-out;
}

/* 关键：直接针对value属性变化的样式 */
.progress[value] {
	transition: all 0.2s ease-in-out;
}

/* 如果需要更精细的控制，可以针对value属性的伪元素 */
.progress[value]::-webkit-progress-value {
	transition: all 0.2s ease-in-out;
}

.progress[value]::-moz-progress-bar {
	transition: all 0.2s ease-in-out;
}
</style>
