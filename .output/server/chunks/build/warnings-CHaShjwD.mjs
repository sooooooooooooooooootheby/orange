import { _ as _sfc_main$1 } from './Alert-6Z56cRp8.mjs';
import { d as useAsyncData, e as _sfc_main$a } from './server.mjs';
import { h as handleHead } from './handleHead-BLMoKGtz.mjs';
import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import 'reka-ui';
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
  __name: "warnings",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("warnings", () => $fetch("/api/litebans/warnings"))), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UAlert = _sfc_main$1;
      const _component_USeparator = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(error)) {
        _push(ssrRenderComponent(_component_UAlert, {
          color: "error",
          variant: "soft",
          title: "警告列表获取失败",
          description: unref(error).message,
          icon: "gravity-ui:exclamation-shape"
        }, null, _parent));
      } else {
        _push(`<div><div class="flex flex-col gap-2"><!--[-->`);
        ssrRenderList(unref(data)?.data, (item) => {
          _push(`<div><div class="border-default bg-default flex flex-col gap-2 rounded-lg border-1 p-3"><div class="flex gap-2"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.name))} alt="item.name" class="size-12"><div class="w-full overflow-hidden"><p class="text-lg font-bold">${ssrInterpolate(item.name)}</p><p class="truncate text-sm text-gray-400 dark:text-gray-600">${ssrInterpolate(item.uuid)}</p></div></div>`);
          _push(ssrRenderComponent(_component_USeparator, { type: "dashed" }, null, _parent));
          _push(`<p><span class="font-bold">${ssrInterpolate(item.name)}</span> 因为 <span class="font-bold">&quot;${ssrInterpolate(item.reason)}&quot;</span> 被 <span class="font-bold">${ssrInterpolate(item.banned_by_name)}</span> 警告 </p></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bans/warnings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=warnings-CHaShjwD.mjs.map
