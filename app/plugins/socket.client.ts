import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
	const socket = io("https://orangecraftmc.top", {
		path: "/mainserver/socket.io",
		transports: ["websocket"],
	});

	// 全局提供
	nuxtApp.provide("socket", socket);
});
