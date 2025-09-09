import { h as handleHead } from './handleHead-BLMoKGtz.mjs';
import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { g as useAppConfig } from './server.mjs';
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
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const appConfig = useAppConfig();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-2" }, _attrs))}><div class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(unref(appConfig).admin.fz.name))}${ssrRenderAttr("alt", unref(appConfig).admin.fz.name)} class="w-12"><div><p class="text-lg font-bold">${ssrInterpolate(unref(appConfig).admin.fz.name)}</p><p class="text-sm">${ssrInterpolate(unref(appConfig).admin.fz.role)}</p></div></div><div class="flex flex-col gap-2"><!--[-->`);
      ssrRenderList(unref(appConfig).admin.admin, (item) => {
        _push(`<div class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.name))}${ssrRenderAttr("alt", item.name)} class="w-12"><div><p class="text-lg font-bold">${ssrInterpolate(item.name)}</p><p class="text-sm">${ssrInterpolate(item.role)}</p></div></div>`);
      });
      _push(`<!--]--><!--[-->`);
      ssrRenderList(unref(appConfig).admin.lowadmin, (item) => {
        _push(`<div class="flex gap-2 border-1 p-2 rounded-lg bg-default border-default"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.name))}${ssrRenderAttr("alt", item.name)} class="w-12"><div><p class="text-lg font-bold">${ssrInterpolate(item.name)}</p><p class="text-sm">${ssrInterpolate(item.role)}</p></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/content/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = Object.assign(_sfc_main, { __name: "Admin" });

export { admin as default };
//# sourceMappingURL=admin-CCMZk11T.mjs.map
