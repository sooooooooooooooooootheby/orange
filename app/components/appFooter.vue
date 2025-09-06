<template>
	<UFooter class="bg-default border-t border-default py-4">
		<template #left>
			<div class="flex flex-col items-center md:items-start">
				<p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }} Orangecraftmc</p>
				<p class="text-muted text-sm">鄂ICP备2025144636号</p>
			</div>
		</template>
		<template #right>
			<a href="https://space.bilibili.com/1915573443?spm_id_from=333.788.upinfo.detail.click" target="_blank">
				<Icon name="mingcute:bilibili-fill" class="text-xl text-gray-400 duration-300 hover:text-gray-500" />
			</a>
		</template>
	</UFooter>
</template>

<script setup lang="ts"></script>
