<template>
	<img :src="avatarUrl(props.name)" :alt="props.alt" @error="handleImageError" />
</template>

<script lang="ts" setup>
const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	fallback: {
		type: String,
		default: "steve",
	},
	alt: {
		type: String,
		default: "",
	},
	lazy: {
		type: Boolean,
		default: false,
	},
});

const handleImageError = (event: any) => {
	event.target.src = `https://orangecraftmc.top/head/3d/java/username/${props.fallback}`;
};

const avatarUrl = (name: string) => {
	if (name === "Rcon") {
		return `https://orangecraftmc.top/head/3d/java/username/Console`;
	} else if (name.startsWith("zPE_")) {
		return `https://orangecraftmc.top/head/3d/bedrock/username/${name.replace(/^zPE_/, "")}`;
	} else {
		return `https://orangecraftmc.top/head/3d/java/username/${name}`;
	}
};
</script>
