<template>
	<div class="relative w-full overflow-hidden">
		<div class="flex items-center transition-transform duration-500" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
			<div v-for="(img, i) in images" :key="i" class="w-full shrink-0">
				<img :src="img" class="w-full rounded-lg object-cover" />
			</div>
		</div>

		<div class="absolute right-0 bottom-2 left-0 flex justify-center gap-2 py-2">
			<button v-for="(img, i) in images" :key="i" class="btn btn-xs" :class="{ 'btn-neutral': i === currentIndex }" @click="setIndex(i)">
				{{ i + 1 }}
			</button>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	images: {
		type: Array,
		default: () => [],
	},
});

const currentIndex = ref(0);

const setIndex = (i) => {
	currentIndex.value = i;
};
</script>
