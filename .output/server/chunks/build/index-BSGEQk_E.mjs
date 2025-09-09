import { b as useSeoMeta, a as __nuxt_component_0$1, c as __nuxt_component_1$2 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';
import 'better-sqlite3';
import 'vue-router';
import '@iconify/vue';
import 'tailwindcss/colors';
import 'reka-ui';
import '@vueuse/core';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: `Orange Craft Mc`,
      ogTitle: `Orange Craft Mc`
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_Icon = __nuxt_component_1$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-8 px-4" }, _attrs))}><div class="flex h-[calc(100vh-var(--ui-header-height)-32px)] flex-col items-center justify-center"><p class="text-3xl font-bold text-gray-800 md:text-5xl dark:text-gray-200"><span class="text-orange-400">O</span>rangeCraftMC</p><p class="text-3xl font-bold text-gray-800 md:text-5xl dark:text-gray-200"><span class="text-orange-400">橙</span>子工艺.</p><p class="text-xs text-gray-600 md:text-lg dark:text-gray-400">一个不删档的<span>1.21.x</span>原版增强服务器!</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/docs",
        class: "mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-gray-800 px-2 py-1 text-gray-50 duration-300 hover:bg-gray-700 hover:shadow-lg max-md:mt-2 max-md:text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>🍊</span><span class="text-gray-400"${_scopeId}>|</span><span class="text-sm"${_scopeId}>服务器指北</span>`);
            _push2(ssrRenderComponent(_component_Icon, { name: "gravity-ui:arrow-right" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("span", null, "🍊"),
              createVNode("span", { class: "text-gray-400" }, "|"),
              createVNode("span", { class: "text-sm" }, "服务器指北"),
              createVNode(_component_Icon, { name: "gravity-ui:arrow-right" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="mx-auto w-[72vw] overflow-hidden rounded-lg border-1 border-gray-200 shadow-xl max-md:w-full dark:border-gray-800"><div class="relative flex w-full items-center justify-center bg-white py-1.5 dark:bg-black"><div class="absolute left-2 flex gap-1.5"><div class="size-2.5 rounded-full border-1 border-red-400 bg-red-300"></div><div class="size-2.5 rounded-full border-1 border-yellow-400 bg-yellow-300"></div><div class="size-2.5 rounded-full border-1 border-green-400 bg-green-300"></div></div><p class="text-xs">Minecraft 1.21.8 - Orange craft mc</p></div><img src="https://orangecraftmc.obs.cn-south-1.myhuaweicloud.com/cover/cover.webp" alt="cover" class="w-full"></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BSGEQk_E.mjs.map
