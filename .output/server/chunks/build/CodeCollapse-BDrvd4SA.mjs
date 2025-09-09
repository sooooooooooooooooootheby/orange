import { mergeModels, useModel, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { r as useLocale, g as useAppConfig, t as tv, s as _sfc_main$t } from './server.mjs';
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

const theme = {
  "slots": {
    "root": "relative [&_pre]:h-[200px]",
    "footer": "h-16 absolute inset-x-px bottom-px rounded-b-md flex items-center justify-center",
    "trigger": "group",
    "triggerIcon": "group-data-[state=open]:rotate-180"
  },
  "variants": {
    "open": {
      "true": {
        "root": "[&_pre]:h-auto [&_pre]:min-h-[200px] [&_pre]:max-h-[80vh] [&_pre]:pb-12"
      },
      "false": {
        "root": "[&_pre]:overflow-hidden",
        "footer": "bg-gradient-to-t from-muted"
      }
    }
  }
};
const _sfc_main = {
  __name: "ProseCodeCollapse",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    icon: { type: [String, Object], required: false },
    name: { type: String, required: false },
    openText: { type: String, required: false },
    closeText: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  }, {
    "open": { type: Boolean, ...{ default: false } },
    "openModifiers": {}
  }),
  emits: ["update:open"],
  setup(__props) {
    const props = __props;
    const open = useModel(__props, "open", { type: Boolean, ...{ default: false } });
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.codeCollapse || {} })({
      open: open.value
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}">`);
      _push(ssrRenderComponent(_sfc_main$t, {
        icon: __props.icon || unref(appConfig).ui.icons.chevronDown,
        color: "neutral",
        variant: "outline",
        "data-state": open.value ? "open" : "closed",
        label: `${open.value ? props.closeText || unref(t)("prose.codeCollapse.closeText") : props.openText || unref(t)("prose.codeCollapse.openText")} ${props.name || unref(t)("prose.codeCollapse.name")}`,
        class: ui.value.trigger({ class: props.ui?.trigger }),
        ui: { leadingIcon: ui.value.triggerIcon({ class: props.ui?.triggerIcon }) },
        onClick: ($event) => open.value = !open.value
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@bab_01b8e4c3f51a2b4e0cb534dba2e2c4de/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=CodeCollapse-BDrvd4SA.mjs.map
