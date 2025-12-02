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
	event.target.src = `https://mchead.s22y.moe/3d/java/username/${props.fallback}`;
};

const avatarUrl = (name: string) => {
	if (name === "Rcon") {
		return `https://mchead.s22y.moe/3d/java/username/Console`;
	} else if (name.startsWith("zPE_")) {
		return `https://mchead.s22y.moe/3d/bedrock/username/${name.replace(/^zPE_/, "")}`;
	} else {
		return `https://mchead.s22y.moe/3d/java/username/${name}`;
	}
};
</script>
