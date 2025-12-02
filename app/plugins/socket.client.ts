import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
	const socket = io("https://orange.s22y.moe", {
		path: "/mainserver/socket.io",
		transports: ["websocket"],
	});
	const zfSocket = io("https://orange.s22y.moe", {
		path: "/rainserver/socket.io/",
		transports: ["websocket"],
	});
	const zzSocket = io("https://orange.s22y.moe", {
		path: "/zzserver/socket.io/",
		transports: ["websocket"],
	});

	// 全局提供
	nuxtApp.provide("socket", socket);
	nuxtApp.provide("zf", zfSocket);
	nuxtApp.provide("zz", zzSocket);
});
