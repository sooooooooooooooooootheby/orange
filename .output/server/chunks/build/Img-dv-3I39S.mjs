import { ref, computed, useId, unref, withCtx, createVNode, resolveDynamicComponent, mergeProps, createBlock, openBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderVNode, ssrRenderClass } from 'vue/server-renderer';
import { G as withLeadingSlash, t as withTrailingSlash, o as joinURL } from '../nitro/nitro.mjs';
import { DialogRoot, DialogTrigger, DialogPortal } from 'reka-ui';
import { Motion, AnimatePresence } from 'motion-v';
import { createReusableTemplate, useEventListener } from '@vueuse/core';
import { d as useAppConfig, t as tv, e as useRuntimeConfig, I as ImageComponent } from './server.mjs';
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
    "base": "rounded-md",
    "overlay": "fixed inset-0 bg-default/75 backdrop-blur-sm will-change-opacity",
    "content": "fixed inset-0 flex items-center justify-center cursor-zoom-out focus:outline-none p-4 sm:p-8"
  },
  "variants": {
    "zoom": {
      "true": "will-change-transform"
    },
    "open": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "zoom": true,
      "open": false,
      "class": "cursor-zoom-in"
    }
  ]
};
const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "ProseImg",
  __ssrInlineRender: true,
  props: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: [String, Number], required: false },
    height: { type: [String, Number], required: false },
    class: { type: null, required: false },
    zoom: { type: Boolean, required: false, default: true },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const [DefineImageTemplate, ReuseImageTemplate] = createReusableTemplate();
    const open = ref(false);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.img || {} })({
      zoom: props.zoom,
      open: open.value
    }));
    const refinedSrc = computed(() => {
      if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
        const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));
        if (_base !== "/" && !props.src.startsWith(_base)) {
          return joinURL(_base, props.src);
        }
      }
      return props.src;
    });
    const layoutId = computed(() => `${refinedSrc.value}::${useId()}`);
    if (props.zoom) {
      useEventListener(void 0, "scroll", () => {
        open.value = false;
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineImageTemplate), null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
              src: refinedSrc.value,
              alt: __props.alt,
              width: __props.width,
              height: __props.height
            }, _ctx.$attrs, {
              class: ui.value.base({ class: [props.ui?.base, props.class] })
            }), null), _parent2, _scopeId);
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
                src: refinedSrc.value,
                alt: __props.alt,
                width: __props.width,
                height: __props.height
              }, _ctx.$attrs, {
                class: ui.value.base({ class: [props.ui?.base, props.class] })
              }), null, 16, ["src", "alt", "width", "height", "class"]))
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.zoom) {
        _push(ssrRenderComponent(unref(DialogRoot), {
          open: open.value,
          "onUpdate:open": ($event) => open.value = $event,
          modal: false
        }, {
          default: withCtx(({ close }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(DialogTrigger), { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(Motion), {
                      "layout-id": layoutId.value,
                      "as-child": "",
                      transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                    }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(unref(ReuseImageTemplate))
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(Motion), {
                        "layout-id": layoutId.value,
                        "as-child": "",
                        transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(ReuseImageTemplate))
                        ]),
                        _: 1
                      }, 8, ["layout-id"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(DialogPortal), null, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(AnimatePresence), null, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          if (open.value) {
                            _push4(ssrRenderComponent(unref(Motion), {
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                              class: ui.value.overlay({ class: [props.ui?.overlay] })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (open.value) {
                            _push4(`<div class="${ssrRenderClass(ui.value.content({ class: [props.ui?.content] }))}"${_scopeId3}>`);
                            _push4(ssrRenderComponent(unref(Motion), {
                              "as-child": "",
                              "layout-id": layoutId.value,
                              transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                            }, {
                              default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(unref(ReuseImageTemplate))
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(`</div>`);
                          } else {
                            _push4(`<!---->`);
                          }
                        } else {
                          return [
                            open.value ? (openBlock(), createBlock(unref(Motion), {
                              key: 0,
                              initial: { opacity: 0 },
                              animate: { opacity: 1 },
                              exit: { opacity: 0 },
                              class: ui.value.overlay({ class: [props.ui?.overlay] })
                            }, null, 8, ["class"])) : createCommentVNode("", true),
                            open.value ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: ui.value.content({ class: [props.ui?.content] }),
                              onClick: close
                            }, [
                              createVNode(unref(Motion), {
                                "as-child": "",
                                "layout-id": layoutId.value,
                                transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                              }, {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseImageTemplate))
                                ]),
                                _: 1
                              }, 8, ["layout-id"])
                            ], 10, ["onClick"])) : createCommentVNode("", true)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(AnimatePresence), null, {
                        default: withCtx(() => [
                          open.value ? (openBlock(), createBlock(unref(Motion), {
                            key: 0,
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            class: ui.value.overlay({ class: [props.ui?.overlay] })
                          }, null, 8, ["class"])) : createCommentVNode("", true),
                          open.value ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: ui.value.content({ class: [props.ui?.content] }),
                            onClick: close
                          }, [
                            createVNode(unref(Motion), {
                              "as-child": "",
                              "layout-id": layoutId.value,
                              transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                            }, {
                              default: withCtx(() => [
                                createVNode(unref(ReuseImageTemplate))
                              ]),
                              _: 1
                            }, 8, ["layout-id"])
                          ], 10, ["onClick"])) : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1024)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(DialogTrigger), { "as-child": "" }, {
                  default: withCtx(() => [
                    createVNode(unref(Motion), {
                      "layout-id": layoutId.value,
                      "as-child": "",
                      transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(ReuseImageTemplate))
                      ]),
                      _: 1
                    }, 8, ["layout-id"])
                  ]),
                  _: 1
                }),
                createVNode(unref(DialogPortal), null, {
                  default: withCtx(() => [
                    createVNode(unref(AnimatePresence), null, {
                      default: withCtx(() => [
                        open.value ? (openBlock(), createBlock(unref(Motion), {
                          key: 0,
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          exit: { opacity: 0 },
                          class: ui.value.overlay({ class: [props.ui?.overlay] })
                        }, null, 8, ["class"])) : createCommentVNode("", true),
                        open.value ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: ui.value.content({ class: [props.ui?.content] }),
                          onClick: close
                        }, [
                          createVNode(unref(Motion), {
                            "as-child": "",
                            "layout-id": layoutId.value,
                            transition: { type: "spring", bounce: 0.2, duration: 0.4 }
                          }, {
                            default: withCtx(() => [
                              createVNode(unref(ReuseImageTemplate))
                            ]),
                            _: 1
                          }, 8, ["layout-id"])
                        ], 10, ["onClick"])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1024)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(unref(ReuseImageTemplate), null, null, _parent));
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Img-dv-3I39S.mjs.map
