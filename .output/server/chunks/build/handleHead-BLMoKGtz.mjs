const handleHead = (name) => {
  if (name.startsWith("zPE_")) {
    return `https://orangecraftmc.top/head/3d/bedrock/username/${name.replace(/^zPE_/, "")}`;
  } else {
    return `https://orangecraftmc.top/head/3d/java/username/${name}`;
  }
};

export { handleHead as h };
//# sourceMappingURL=handleHead-BLMoKGtz.mjs.map
