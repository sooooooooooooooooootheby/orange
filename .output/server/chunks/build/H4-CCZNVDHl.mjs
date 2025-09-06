import { computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { d as useAppConfig, e as useRuntimeConfig, t as tv } from './server.mjs';
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
import '@vueuse/core';
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
    "base": "text-lg text-highlighted font-bold mt-6 mb-2 scroll-mt-[calc(24px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(24px+var(--ui-header-height))] [&>a]:focus-visible:outline-primary",
    "link": ""
  }
};
const _sfc_main = {
  __name: "ProseH4",
  __ssrInlineRender: true,
  props: {
    id: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const { headings } = useRuntimeConfig().public?.mdc || {};
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.h4 || {} })());
    const generate = computed(() => props.id && typeof headings?.anchorLinks === "object" && headings.anchorLinks.h4);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<h4${ssrRenderAttrs(mergeProps({
        id: __props.id,
        class: ui.value.base({ class: props.class })
      }, _attrs))}>`);
      if (__props.id && generate.value) {
        _push(`<a${ssrRenderAttr("href", `#${__props.id}`)} class="${ssrRenderClass(ui.value.link({ class: props.ui?.link }))}">`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</a>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
      _push(`</h4>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=H4-CCZNVDHl.mjs.map
