export const handleHead = (name: string): string => {
	if (name.startsWith("zPE_")) {
		return `https://orangecraftmc.top/head/3d/bedrock/username/${name.replace(/^zPE_/, "")}`;
	} else {
		return `https://orangecraftmc.top/head/3d/java/username/${name}`;
	}
};
