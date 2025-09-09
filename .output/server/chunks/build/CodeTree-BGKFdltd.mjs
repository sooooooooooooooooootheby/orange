import { useSlots, computed, ref, watch, unref, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, renderList, mergeProps, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttrs, ssrRenderVNode } from 'vue/server-renderer';
import { TreeItem, TreeRoot } from 'reka-ui';
import { createReusableTemplate } from '@vueuse/core';
import { g as useAppConfig, t as tv, m as _sfc_main$y } from './server.mjs';
import _sfc_main$1 from './CodeIcon-CEgeWq6N.mjs';
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

const theme = {
  "slots": {
    "root": "relative lg:h-[450px] my-5 grid lg:grid-cols-3 border border-muted rounded-md",
    "list": "isolate relative p-2 border-b lg:border-b-0 lg:border-e border-muted overflow-y-auto",
    "item": "",
    "listWithChildren": "ms-4.5 border-s border-default",
    "itemWithChildren": "ps-1.5 -ms-px",
    "link": "relative group peer w-full px-2.5 py-1.5 before:inset-y-px before:inset-x-0 flex items-center gap-1.5 text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    "linkLeadingIcon": "size-4 shrink-0",
    "linkLabel": "truncate",
    "linkTrailing": "ms-auto inline-flex gap-1.5 items-center",
    "linkTrailingIcon": "size-5 transform transition-transform duration-200 shrink-0 group-data-expanded:rotate-180",
    "content": "overflow-hidden lg:col-span-2 flex flex-col [&>div]:my-0 [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div>div]:border-0 [&>div>pre]:border-b-0 [&>div>pre]:border-s-0 [&>div>pre]:border-e-0 [&>div>pre]:rounded-l-none [&>div>pre]:flex-1 [&>div]:overflow-y-auto"
  },
  "variants": {
    "active": {
      "true": {
        "link": "text-highlighted before:bg-elevated"
      },
      "false": {
        "link": [
          "hover:text-highlighted hover:before:bg-elevated/50",
          "transition-colors before:transition-colors"
        ]
      }
    }
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "ProseCodeTree",
  __ssrInlineRender: true,
  props: {
    defaultValue: { type: String, required: false },
    expandAll: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const [DefineTreeTemplate, ReuseTreeTemplate] = createReusableTemplate();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.codeTree || {} })());
    const model = ref(props.defaultValue ? { path: props.defaultValue } : void 0);
    const lastSelectedItem = ref();
    const rerenderCount = ref(1);
    const flatItems = computed(() => {
      rerenderCount.value;
      return slots.default?.()?.flatMap(transformSlot).filter(Boolean) || [];
    });
    const items = computed(() => buildTree(flatItems.value));
    function buildTree(items2) {
      const map = /* @__PURE__ */ new Map();
      const root = [];
      items2.forEach((item) => {
        const parts = item.label.split("/");
        let path = "";
        parts.forEach((part, i) => {
          path = path ? `${path}/${part}` : part;
          if (!map.has(path)) {
            const node = { label: part, path, ...i < parts.length - 1 && { children: [] } };
            map.set(path, node);
            if (i === 0) {
              root.push(node);
            } else {
              map.get(parts.slice(0, i).join("/"))?.children?.push(node);
            }
          }
        });
      });
      const sort = (nodes) => nodes.sort(
        (a, b) => !!a.children === !!b.children ? a.label.localeCompare(b.label) : b.children ? 1 : -1
      ).map((n) => ({ ...n, children: n.children && sort(n.children) }));
      return sort(root);
    }
    function transformSlot(slot, index) {
      if (typeof slot.type === "symbol") {
        return slot.children?.map(transformSlot);
      }
      return {
        label: slot.props?.filename || slot.props?.label || `${index}`,
        icon: slot.props?.icon,
        component: slot
      };
    }
    const expanded = computed(() => {
      if (props.expandAll) {
        const allPaths = /* @__PURE__ */ new Set();
        flatItems.value.forEach((item) => {
          const parts2 = item.label.split("/");
          for (let i = 1; i < parts2.length; i++) {
            allPaths.add(parts2.slice(0, i).join("/"));
          }
        });
        return Array.from(allPaths);
      }
      const path = model.value?.path;
      if (!path) {
        return [];
      }
      const parts = path.split("/");
      return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
    });
    watch(model, (value) => {
      const item = flatItems.value.find((item2) => value?.path === item2.label);
      if (item?.component) {
        lastSelectedItem.value = item;
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineTreeTemplate), null, {
        default: withCtx(({ items: items2, level }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(items2, (item, index) => {
              _push2(`<li class="${ssrRenderClass(level > 0 ? ui.value.itemWithChildren({ class: props.ui?.itemWithChildren }) : ui.value.item({ class: props.ui?.item }))}"${_scopeId}>`);
              _push2(ssrRenderComponent(unref(TreeItem), {
                "as-child": "",
                level,
                value: item
              }, {
                default: withCtx(({ isExpanded, isSelected }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<button class="${ssrRenderClass(ui.value.link({ class: props.ui?.link, active: isSelected }))}"${_scopeId2}>`);
                    if (item.children?.length) {
                      _push3(ssrRenderComponent(_sfc_main$y, {
                        name: isExpanded ? unref(appConfig).ui.icons.folderOpen : unref(appConfig).ui.icons.folder,
                        class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(ssrRenderComponent(_sfc_main$1, {
                        filename: item.label,
                        class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                      }, null, _parent3, _scopeId2));
                    }
                    _push3(`<span class="${ssrRenderClass(ui.value.linkLabel({ class: props.ui?.linkLabel }))}"${_scopeId2}>${ssrInterpolate(item.label)}</span>`);
                    if (item.children?.length) {
                      _push3(`<span class="${ssrRenderClass(ui.value.linkTrailing({ class: props.ui?.linkTrailing }))}"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_sfc_main$y, {
                        name: unref(appConfig).ui.icons.chevronDown,
                        class: ui.value.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })
                      }, null, _parent3, _scopeId2));
                      _push3(`</span>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</button>`);
                    if (item.children?.length && isExpanded) {
                      _push3(`<ul class="${ssrRenderClass(ui.value.listWithChildren({ class: props.ui?.listWithChildren }))}"${_scopeId2}>`);
                      _push3(ssrRenderComponent(unref(ReuseTreeTemplate), {
                        items: item.children,
                        level: level + 1
                      }, null, _parent3, _scopeId2));
                      _push3(`</ul>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createVNode("button", {
                        class: ui.value.link({ class: props.ui?.link, active: isSelected })
                      }, [
                        item.children?.length ? (openBlock(), createBlock(_sfc_main$y, {
                          key: 0,
                          name: isExpanded ? unref(appConfig).ui.icons.folderOpen : unref(appConfig).ui.icons.folder,
                          class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(_sfc_main$1, {
                          key: 1,
                          filename: item.label,
                          class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                        }, null, 8, ["filename", "class"])),
                        createVNode("span", {
                          class: ui.value.linkLabel({ class: props.ui?.linkLabel })
                        }, toDisplayString(item.label), 3),
                        item.children?.length ? (openBlock(), createBlock("span", {
                          key: 2,
                          class: ui.value.linkTrailing({ class: props.ui?.linkTrailing })
                        }, [
                          createVNode(_sfc_main$y, {
                            name: unref(appConfig).ui.icons.chevronDown,
                            class: ui.value.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })
                          }, null, 8, ["name", "class"])
                        ], 2)) : createCommentVNode("", true)
                      ], 2),
                      item.children?.length && isExpanded ? (openBlock(), createBlock("ul", {
                        key: 0,
                        class: ui.value.listWithChildren({ class: props.ui?.listWithChildren })
                      }, [
                        createVNode(unref(ReuseTreeTemplate), {
                          items: item.children,
                          level: level + 1
                        }, null, 8, ["items", "level"])
                      ], 2)) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(items2, (item, index) => {
                return openBlock(), createBlock("li", {
                  key: `${level}-${index}`,
                  class: level > 0 ? ui.value.itemWithChildren({ class: props.ui?.itemWithChildren }) : ui.value.item({ class: props.ui?.item })
                }, [
                  createVNode(unref(TreeItem), {
                    "as-child": "",
                    level,
                    value: item
                  }, {
                    default: withCtx(({ isExpanded, isSelected }) => [
                      createVNode("button", {
                        class: ui.value.link({ class: props.ui?.link, active: isSelected })
                      }, [
                        item.children?.length ? (openBlock(), createBlock(_sfc_main$y, {
                          key: 0,
                          name: isExpanded ? unref(appConfig).ui.icons.folderOpen : unref(appConfig).ui.icons.folder,
                          class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(_sfc_main$1, {
                          key: 1,
                          filename: item.label,
                          class: ui.value.linkLeadingIcon({ class: props.ui?.linkLeadingIcon })
                        }, null, 8, ["filename", "class"])),
                        createVNode("span", {
                          class: ui.value.linkLabel({ class: props.ui?.linkLabel })
                        }, toDisplayString(item.label), 3),
                        item.children?.length ? (openBlock(), createBlock("span", {
                          key: 2,
                          class: ui.value.linkTrailing({ class: props.ui?.linkTrailing })
                        }, [
                          createVNode(_sfc_main$y, {
                            name: unref(appConfig).ui.icons.chevronDown,
                            class: ui.value.linkTrailingIcon({ class: props.ui?.linkTrailingIcon })
                          }, null, 8, ["name", "class"])
                        ], 2)) : createCommentVNode("", true)
                      ], 2),
                      item.children?.length && isExpanded ? (openBlock(), createBlock("ul", {
                        key: 0,
                        class: ui.value.listWithChildren({ class: props.ui?.listWithChildren })
                      }, [
                        createVNode(unref(ReuseTreeTemplate), {
                          items: item.children,
                          level: level + 1
                        }, null, 8, ["items", "level"])
                      ], 2)) : createCommentVNode("", true)
                    ]),
                    _: 2
                  }, 1032, ["level", "value"])
                ], 2);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div${ssrRenderAttrs(mergeProps(_ctx.$attrs, {
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }))}>`);
      _push(ssrRenderComponent(unref(TreeRoot), {
        modelValue: model.value,
        "onUpdate:modelValue": ($event) => model.value = $event,
        class: ui.value.list({ class: props.ui?.list }),
        items: items.value,
        "get-key": (item2) => item2.path,
        "default-expanded": expanded.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ReuseTreeTemplate), {
              items: items.value,
              level: 0
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(ReuseTreeTemplate), {
                items: items.value,
                level: 0
              }, null, 8, ["items"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="${ssrRenderClass(ui.value.content({ class: props.ui?.content }))}">`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(lastSelectedItem.value?.component), null, null), _parent);
      _push(`</div></div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@bab_01b8e4c3f51a2b4e0cb534dba2e2c4de/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=CodeTree-BGKFdltd.mjs.map
