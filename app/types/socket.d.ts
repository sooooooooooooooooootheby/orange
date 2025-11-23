declare module "#app" {
	interface NuxtApp {
		$socket: ReturnType<typeof import("socket.io-client").io>;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$socket: ReturnType<typeof import("socket.io-client").io>;
	}
}
