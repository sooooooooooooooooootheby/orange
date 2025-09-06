import { computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { useClipboard } from '@vueuse/core';
import { f as useLocale, d as useAppConfig, t as tv, w as _sfc_main$t } from './server.mjs';
import _sfc_main$1 from './CodeIcon-Cwqxg0Jg.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'better-sqlite3';
import 'vue-router';
import '@iconify/vue';
import 'tailwindcss/colors';
import 'reka-ui';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const theme = {
  "slots": {
    "root": "relative my-5 group",
    "header": "flex items-center gap-1.5 border border-muted bg-default border-b-0 relative rounded-t-md px-4 py-3",
    "filename": "text-default text-sm/6",
    "icon": "size-4 shrink-0",
    "copy": "absolute top-[11px] right-[11px] lg:opacity-0 lg:group-hover:opacity-100 transition",
    "base": "group font-mono text-sm/6 border border-muted bg-muted rounded-md px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto focus:outline-none"
  },
  "variants": {
    "filename": {
      "true": {
        "root": "[&>pre]:rounded-t-none [&>pre]:my-0 my-5"
      }
    }
  }
};
const _sfc_main = {
  __name: "ProsePre",
  __ssrInlineRender: true,
  props: {
    icon: { type: [String, Object], required: false },
    code: { type: String, required: false },
    language: { type: String, required: false },
    filename: { type: String, required: false },
    highlights: { type: Array, required: false },
    hideHeader: { type: Boolean, required: false },
    meta: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const { t } = useLocale();
    const { copy, copied } = useClipboard();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.pre || {} })());
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ui.value.root({ class: [props.ui?.root], filename: !!__props.filename })
      }, _attrs))}>`);
      if (__props.filename && !__props.hideHeader) {
        _push(`<div class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}">`);
        _push(ssrRenderComponent(_sfc_main$1, {
          icon: __props.icon,
          filename: __props.filename,
          class: ui.value.icon({ class: props.ui?.icon })
        }, null, _parent));
        _push(`<span class="${ssrRenderClass(ui.value.filename({ class: props.ui?.filename }))}">${ssrInterpolate(__props.filename)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$t, {
        icon: unref(copied) ? unref(appConfig).ui.icons.copyCheck : unref(appConfig).ui.icons.copy,
        color: "neutral",
        variant: "outline",
        size: "sm",
        "aria-label": unref(t)("prose.pre.copy"),
        class: ui.value.copy({ class: props.ui?.copy }),
        tabindex: "-1",
        onClick: ($event) => unref(copy)(props.code || "")
      }, null, _parent));
      _push(`<pre${ssrRenderAttrs(mergeProps({
        class: ui.value.base({ class: [props.ui?.base, props.class] })
      }, _ctx.$attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</pre></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Pre-okayFW7E.mjs.map
