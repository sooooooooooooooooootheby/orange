import { _ as _sfc_main$1 } from './Tabs-BuL_9k8g.mjs';
import { defineComponent, ref, watch, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { z as useRoute, J as navigateTo } from './server.mjs';
import 'reka-ui';
import '@vueuse/core';
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
  __name: "bans",
  __ssrInlineRender: true,
  setup(__props) {
    const tabItems = [
      { icon: "gravity-ui:ban", label: "封禁", value: "/bans" },
      { icon: "gravity-ui:comment-slash", label: "禁言", value: "/bans/mutes" },
      { icon: "gravity-ui:exclamation-shape", label: "警告", value: "/bans/warnings" },
      { icon: "gravity-ui:broom-motion", label: "踢出", value: "/bans/kicks" }
    ];
    const route = useRoute();
    const activeTab = ref(route.path);
    watch(activeTab, (newTab) => {
      navigateTo(newTab);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTabs = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-[calc(100vh-var(--ui-header-height))] max-w-(--ui-container) py-12" }, _attrs))}><div class="mb-4 flex w-full flex-col items-center"><p class="mb-2 text-4xl font-bold">封神榜</p><p>在这里你可以查看有哪些玩家被</p><p class="font-bold">封禁, 禁言, 警告, 踢出</p></div><div class="px-6 mb-6">`);
      _push(ssrRenderComponent(_component_UTabs, {
        modelValue: unref(activeTab),
        "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null,
        items: tabItems,
        class: "max-w-xl mx-auto",
        size: "xs"
      }, null, _parent));
      _push(`</div><div class="px-2 mx-auto md:w-xl">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/bans.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bans-BqwBiLfD.mjs.map
