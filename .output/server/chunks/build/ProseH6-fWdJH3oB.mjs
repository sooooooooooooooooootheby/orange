import { computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { e as useRuntimeConfig } from './server.mjs';
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

const _sfc_main = {
  __name: "ProseH6",
  __ssrInlineRender: true,
  props: {
    id: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const { headings } = useRuntimeConfig().public.mdc;
    const generate = computed(() => props.id && (typeof headings?.anchorLinks === "boolean" && headings?.anchorLinks === true || typeof headings?.anchorLinks === "object" && headings?.anchorLinks?.h6));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<h6${ssrRenderAttrs(mergeProps({
        id: props.id
      }, _attrs))}>`);
      if (props.id && unref(generate)) {
        _push(`<a${ssrRenderAttr("href", `#${props.id}`)}>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</a>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
      _push(`</h6>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProseH6-fWdJH3oB.mjs.map
