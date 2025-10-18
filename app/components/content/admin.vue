<template>
	<div class="flex flex-col gap-2">
		<div class="bg-default border-default flex gap-2 rounded-lg border-1 p-2">
			<ClientOnly>
				<img :src="handleHead(appConfig.admin.fz.name)" :alt="appConfig.admin.fz.name" class="size-12 m-0!" />
			</ClientOnly>
			<div>
				<p class="text-lg font-bold m-0!">{{ appConfig.admin.fz.name }}</p>
				<p class="text-sm m-0!">{{ appConfig.admin.fz.role }}</p>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<div v-for="item in appConfig.admin.admin" class="bg-default border-default flex gap-2 rounded-lg border-1 p-2">
				<ClientOnly>
					<img :src="handleHead(item.name)" :alt="item.name" class="size-12 m-0!" />
				</ClientOnly>
				<div>
					<p class="text-lg font-bold m-0!">{{ item.name }}</p>
					<p class="text-sm m-0!">{{ item.role }}</p>
				</div>
			</div>
			<div v-for="item in appConfig.admin.lowadmin" class="bg-default border-default flex gap-2 rounded-lg border-1 p-2">
				<ClientOnly>
					<img :src="handleHead(item.name)" :alt="item.name" class="size-12 m-0!" />
				</ClientOnly>
				<div>
					<p class="text-lg font-bold m-0!">{{ item.name }}</p>
					<p class="text-sm m-0!">{{ item.role }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const appConfig = useAppConfig();
</script>
