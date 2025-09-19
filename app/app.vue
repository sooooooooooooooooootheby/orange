<template>
	<UApp>
		<appHeader />
		<NuxtLayout>
			<NuxtPage />
			<div class="pattern-dots-md fixed top-0 left-0 -z-1 h-screen w-screen text-gray-200 dark:text-gray-600"></div>
		</NuxtLayout>
		<appFooter />
	</UApp>
</template>

<script lang="ts" setup>
onMounted(() => {
	console.log(
		`\n 你在找什么?\n \n %c GITHUB %c https://github.com/sooooooooooooooooootheby/orange \n\n%c 记得给我点个star⭐ ฅ^•ﻌ•^ฅ`,
		"color: #ffffff; background: #FE9A00; padding:5px 0;",
		"background: #FFEDD4; padding:5px 0;",
		"background: #fff;"
	);
});
</script>

<style>
.page-enter-active,
.page-leave-active {
	transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
	opacity: 0;
	filter: blur(1rem);
}
.layout-enter-active,
.layout-leave-active {
	transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
	filter: grayscale(1);
}
</style>
