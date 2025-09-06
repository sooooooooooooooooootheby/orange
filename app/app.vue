<template>
	<UApp>
		<appHeader />
		<NuxtLoadingIndicator color="#F8BB77" />
		<UMain>
			<NuxtLayout>
				<NuxtPage />
				<div class="pattern-dots-md fixed top-0 left-0 -z-1 h-screen w-screen text-gray-200 dark:text-gray-600"></div>
			</NuxtLayout>
		</UMain>
		<appFooter />
	</UApp>
</template>

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
