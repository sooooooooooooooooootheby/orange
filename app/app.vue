<template>
	<div class="bg-default min-h-screen max-w-screen">
		<AppHeader />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
		<AppFooter />
	</div>
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
