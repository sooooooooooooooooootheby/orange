import { unref, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const _sfc_main = {
  __name: "ProseScript",
  __ssrInlineRender: true,
  props: {
    src: { type: String, required: true }
  },
  setup(__props) {
    const isDev = false;
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isDev)) {
        _push(`<div${ssrRenderAttrs(_attrs)}> Rendering the <code>script</code> element is dangerous and is disabled by default. Consider implementing your own <code>ProseScript</code> element to have control over script rendering. </div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Script-C40Fx2Av.mjs.map
