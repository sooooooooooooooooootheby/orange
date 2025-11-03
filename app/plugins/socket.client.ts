import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
	const socket = io("http://110.42.9.214:3000", {
		path: "/", // 你服务端的路径
		transports: ["websocket"],
	});

	// 全局提供
	nuxtApp.provide("socket", socket);
});
