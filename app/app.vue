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
const toast = useToast();

const showToast = () => {
	toast.add({
		title: "网站的彩蛋还没被人发现哦",
		description: h("div", [
			h("p", "当你你进入了这个网站, 还能看到这条提示就说明彩蛋还没被人发现."),
			h("p", "发现彩蛋请私聊AliceIClodia, 领取一百大橙通宝."),
			h("p", "彩蛋提示: `哦干呢`"),
		]),
		duration: 18000,
	});
}

onMounted(() => {
	showToast();
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
