import { _ as _sfc_main$1 } from './Alert-6Z56cRp8.mjs';
import { d as useAsyncData, e as _sfc_main$a, f as _sfc_main$g } from './server.mjs';
import { h as handleHead } from './handleHead-BLMoKGtz.mjs';
import { h as handleTime } from './handleTime-BloDdbsL.mjs';
import { defineComponent, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("bans", () => $fetch("/api/litebans/bans"))), __temp = await __temp, __restore(), __temp);
    const isBan = (removed_by_date, until) => {
      if (removed_by_date) {
        return false;
      }
      if (until !== 0) {
        const now = (/* @__PURE__ */ new Date()).getTime();
        if (now > until) {
          return false;
        }
      }
      return true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UAlert = _sfc_main$1;
      const _component_USeparator = _sfc_main$a;
      const _component_UBadge = _sfc_main$g;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(error)) {
        _push(ssrRenderComponent(_component_UAlert, {
          color: "error",
          variant: "soft",
          title: "封禁列表获取失败",
          description: unref(error).message,
          icon: "gravity-ui:exclamation-shape"
        }, null, _parent));
      } else {
        _push(`<div><div class="flex flex-col gap-2"><!--[-->`);
        ssrRenderList(unref(data)?.data, (item) => {
          _push(`<div><div class="border-default bg-default flex flex-col gap-2 rounded-lg border-1 p-3"><div class="flex gap-2"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.name))} alt="item.name" class="size-12"><div class="w-full overflow-hidden"><p class="text-lg font-bold">${ssrInterpolate(item.name)}</p><p class="truncate text-sm text-gray-400 dark:text-gray-600">${ssrInterpolate(item.uuid)}</p></div></div>`);
          _push(ssrRenderComponent(_component_USeparator, { type: "dashed" }, null, _parent));
          _push(`<div class="flex flex-col gap-1"><div class="flex gap-1"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.banned_by_name))} alt="item.name" class="size-6"><span>${ssrInterpolate(item.banned_by_name)}</span></div><p class="text-sm text-gray-400 dark:text-gray-600">${ssrInterpolate(item.reason)}</p><div class="mt-2 flex items-center gap-1">`);
          if (item.until === 0 && isBan(item.removed_by_date, item.until)) {
            _push(ssrRenderComponent(_component_UBadge, {
              icon: "gravity-ui:clock",
              size: "md",
              color: "error",
              variant: "soft",
              class: "rounded-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` 永久封禁 `);
                } else {
                  return [
                    createTextVNode(" 永久封禁 ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else if (!item.removed_by_date) {
            _push(ssrRenderComponent(_component_UBadge, {
              icon: "gravity-ui:clock",
              size: "md",
              color: "success",
              variant: "soft",
              class: "rounded-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(("handleTime" in _ctx ? _ctx.handleTime : unref(handleTime))(item.until))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(("handleTime" in _ctx ? _ctx.handleTime : unref(handleTime))(item.until)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (isBan(item.removed_by_date, item.until)) {
            _push(ssrRenderComponent(_component_UBadge, {
              icon: "gravity-ui:ban",
              size: "md",
              color: "error",
              variant: "soft",
              class: "rounded-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` 封禁中 `);
                } else {
                  return [
                    createTextVNode(" 封禁中 ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_UBadge, {
              icon: "gravity-ui:circle-check",
              size: "md",
              color: "success",
              variant: "soft",
              class: "rounded-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` 已解封 `);
                } else {
                  return [
                    createTextVNode(" 已解封 ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          }
          if (item.ipban.data[0] !== 0) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: "error",
              variant: "outline",
              size: "md",
              class: "rounded-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Ban IP`);
                } else {
                  return [
                    createTextVNode("Ban IP")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bans/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BWq18WCi.mjs.map
