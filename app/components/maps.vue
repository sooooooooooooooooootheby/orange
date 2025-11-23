<template>
	<div class="border-base-300 bg-base-100 h-128 w-full rounded-lg border">
		<div v-if="!mapLoaded" class="flex h-full items-center justify-center">
			<div class="loading loading-spinner loading-lg"></div>
			<span class="ml-2">地图加载中...</span>
		</div>
		<div v-else ref="mapContainer" class="h-full w-full"></div>
	</div>
</template>

<script lang="ts" setup>
import * as echarts from "echarts";

const mapContainer = ref(null);
const mapLoaded = ref(false);

const fetchMapData = async () => {
	try {
		const response = await fetch("/geo.json");
		const chinaJSON = await response.json();
		mapLoaded.value = !mapLoaded.value;
		return chinaJSON;
	} catch (error) {
		console.error("获取地图数据失败:", error);
		return null;
	}
};

const scatterData = [
	{ name: "宁波 - 主服务器", value: [121.549, 29.868, 10] },
	{ name: "宿迁 - 子服务器", value: [118.275, 33.963, 8] },
];

onMounted(async () => {
	const chinaJSON = await fetchMapData();

	if (!chinaJSON) {
		console.error("无法加载地图数据");
		return;
	}

	const myChart = echarts.init(mapContainer.value);
	echarts.registerMap("china", chinaJSON);

	const lightOption = {
		geo: {
			map: "china",
			roam: true,
			silent: false,
			zoom: 2,
			center: [105, 36],
			label: {
				show: false,
			},
			itemStyle: {
				areaColor: "#F5F6FA",
				borderColor: "#CFD1D5",
				borderWidth: 1,
			},
			emphasis: {
				disabled: false,
				itemStyle: {
					areaColor: "#FEF1CC",
				},
				label: {
					show: true,
					color: "#52525C",
				},
			},
		},
		series: [
			{
				type: "scatter",
				coordinateSystem: "geo",
				data: scatterData,
				symbolSize: 6,
				silent: true,
				label: {
					show: true,
					formatter: "{b}",
					position: "right",
					fontSize: 12,
					backgroundColor: "rgba(255,255,255,0.8)",
					borderRadius: 2,
					padding: [2, 4],
				},
				itemStyle: {
					color: "#ff6b35",
				},
			},
		],
	};
	const darkOption = {
		geo: {
			map: "china",
			roam: true,
			silent: false,
			zoom: 2,
			center: [105, 36],
			label: {
				show: false,
			},
			itemStyle: {
				areaColor: "#171B21",
				borderColor: "#252830",
				borderWidth: 1,
			},
			emphasis: {
				disabled: false,
				itemStyle: {
					areaColor: "#948F7D",
				},
				label: {
					show: true,
					color: "rgba(255,255,255,0.8)",
				},
			},
		},
		series: [
			{
				type: "scatter",
				coordinateSystem: "geo",
				data: scatterData,
				symbolSize: 6,
				silent: true,
				label: {
					show: true,
					formatter: "{b}",
					position: "right",
					fontSize: 12,
					color: "rgba(255,255,255,0.8)",
					backgroundColor: "rgba(255,255,255,0.2)",
					borderRadius: 2,
					padding: [2, 4],
				},
				itemStyle: {
					color: "#ff6b35",
				},
			},
		],
	};

	// 检测主题变化
	const observer = new MutationObserver(() => {
		const isDark = document.documentElement.getAttribute("data-theme") === "dark";
		const themeOption = isDark ? darkOption : lightOption;
		myChart.setOption(themeOption, true);
	});

	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});

	// 初始设置
	const isDark = document.documentElement.getAttribute("data-theme") === "dark";
	const themeOption = isDark ? darkOption : lightOption;
	myChart.setOption(themeOption, true);
	mapLoaded.value = true;
});
</script>
