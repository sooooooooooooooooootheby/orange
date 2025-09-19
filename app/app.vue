<template>
	<UApp>
		<UBanner title="🎉 Hi~ 欢迎来到橙子工艺官网, 如果你在网站中发现任何问题请联系 AliceIClodia." close />
		<appHeader />
		<NuxtLoadingIndicator color="#F8BB77" />
		<UMain>
			<NuxtLayout>
				<NuxtPage />
				<div class="pattern-dots-md fixed top-0 left-0 -z-1 h-screen w-screen text-gray-200 dark:text-gray-600"></div>
			</NuxtLayout>
		</UMain>
		<appFooter />
		<search />
	</UApp>
</template>

<script lang="ts" setup>
onMounted(() => {
	console.log(
		`\n 你在找什么?\n \n %c GITHUB %c https://github.com/sooooooooooooooooootheby/orange \n\n%c 记得给我点个star⭐ ฅ^•ﻌ•^ฅ`,
		"color: #ffffff; background: #FE9A00; padding:5px 0;", "background: #FFEDD4; padding:5px 0;", "background: #fff;"
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
	filter: blur(0.1rem);
}
.layout-enter-active,
.layout-leave-active {
	transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
	opacity: 0;
	filter: blur(0.1rem);
}
</style>
