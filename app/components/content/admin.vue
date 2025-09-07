<template>
	<div class="flex flex-col gap-2">
		<div class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default">
			<img :src="handleHead(appConfig.admin.fz.name)" :alt="appConfig.admin.fz.name" class="w-12" />
			<div>
				<p class="text-lg font-bold">{{ appConfig.admin.fz.name }}</p>
				<p class="text-sm">{{ appConfig.admin.fz.role }}</p>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<div v-for="item in appConfig.admin.admin" class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default">
				<img :src="handleHead(item.name)" :alt="item.name" class="w-12" />
				<div>
					<p class="text-lg font-bold">{{ item.name }}</p>
					<p class="text-sm">{{ item.role }}</p>
				</div>
			</div>
            <div v-for="item in appConfig.admin.lowadmin" class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default">
				<img :src="handleHead(item.name)" :alt="item.name" class="w-12" />
				<div>
					<p class="text-lg font-bold">{{ item.name }}</p>
					<p class="text-sm">{{ item.role }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const appConfig = useAppConfig();
</script>
