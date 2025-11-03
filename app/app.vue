<template>
	<div class="bg-base-100">
		<Toaster />
		<NuxtRouteAnnouncer />
		<NuxtLoadingIndicator color="#F8BE82" />
		<div class="pattern-checks-xl text-base-content/4 fixed z-1 min-h-screen w-full"></div>
		<div class="relative z-2">
			<NuxtLayout>
				<theme />
				<NuxtPage />
			</NuxtLayout>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Toaster } from "@/components/ui/sonner";

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
	filter: blur(0.25rem);
}
.layout-enter-active,
.layout-leave-active {
	transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
	opacity: 0;
	filter: blur(0.25rem);
}
</style>
