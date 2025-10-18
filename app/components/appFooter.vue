<template>
	<div class="bg-default border-default border-t pb-4 pt-5 md:py-8 gap-1 mt-8 relative z-10">
		<div class="max-w-6xl md:px-4 flex max-md:flex-col md:justify-between items-center mx-auto">
			<div class="flex flex-col items-center md:items-start">
				<p class="text-gray-600 text-sm">Copyright © {{ new Date().getFullYear() }} Orangecraftmc</p>
				<p class="text-gray-600 text-sm">鄂ICP备2025144636号</p>
			</div>
			<div class="flex gap-2 items-center">
				<NuxtLink href="https://space.bilibili.com/1915573443?spm_id_from=333.788.upinfo.detail.click" target="_blank">
					<Icon name="mingcute:bilibili-fill" class="text-xl text-gray-400 duration-300 hover:text-gray-500" />
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
