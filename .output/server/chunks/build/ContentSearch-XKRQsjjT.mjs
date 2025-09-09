import { mergeModels, useSlots, useModel, computed, useTemplateRef, mergeProps, unref, isRef, withCtx, createSlots, renderList, renderSlot, createVNode, ref, toValue, createBlock, createCommentVNode, openBlock, withKeys, createTextVNode, toDisplayString, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { useForwardProps, useForwardPropsEmits, ListboxRoot, ListboxFilter, ListboxContent, ListboxGroup, ListboxGroupLabel, ListboxItem, ListboxItemIndicator } from 'reka-ui';
import { m as defu } from '../_/nitro.mjs';
import { reactivePick, useDebounceFn, useActiveElement, useEventListener } from '@vueuse/core';
import { r as useLocale, O as useContentSearch, P as useColorMode, g as useAppConfig, K as omit, t as tv, Q as _sfc_main$k, F as transformUI, N as useKbd, s as _sfc_main$t, o as get, E as _sfc_main$u, L as pickLinkProps, M as _sfc_main$v, m as _sfc_main$y, n as _sfc_main$w, p as _sfc_main$x, H as _sfc_main$e } from './server.mjs';
import { useFuse } from '@vueuse/integrations/useFuse';
import { _ as _sfc_main$2 } from './Input-5fThu2tf.mjs';
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

function truncateHTMLFromStart(html, maxLength) {
  let truncated = "";
  let totalLength = 0;
  let insideTag = false;
  for (let i = html.length - 1; i >= 0; i--) {
    if (html[i] === ">") {
      insideTag = true;
    } else if (html[i] === "<") {
      insideTag = false;
      truncated = html[i] + truncated;
      continue;
    }
    if (!insideTag) {
      totalLength++;
    }
    if (totalLength <= maxLength) {
      truncated = html[i] + truncated;
    } else {
      truncated = "..." + truncated;
      break;
    }
  }
  return truncated;
}
function highlight(item, searchTerm, forceKey, omitKeys) {
  function generateHighlightedText(value, indices = []) {
    value = value || "";
    let content = "";
    let nextUnhighlightedRegionStartingIndex = 0;
    indices.forEach((region) => {
      if (region.length === 2 && region[0] === region[1]) {
        return;
      }
      const lastIndiceNextIndex = region[1] + 1;
      const isMatched = lastIndiceNextIndex - region[0] >= searchTerm.length;
      content += [
        value.substring(nextUnhighlightedRegionStartingIndex, region[0]),
        isMatched && `<mark>`,
        value.substring(region[0], lastIndiceNextIndex),
        isMatched && "</mark>"
      ].filter(Boolean).join("");
      nextUnhighlightedRegionStartingIndex = lastIndiceNextIndex;
    });
    content += value.substring(nextUnhighlightedRegionStartingIndex);
    const markIndex = content.indexOf("<mark>");
    if (markIndex !== -1) {
      content = truncateHTMLFromStart(content, content.length - markIndex);
    }
    return content;
  }
  if (!item.matches?.length) {
    return;
  }
  for (const match of item.matches) {
    if (forceKey && match.key !== forceKey) {
      continue;
    }
    if (omitKeys?.includes(match.key)) {
      continue;
    }
    return generateHighlightedText(match.value, match.indices);
  }
}
const theme$1 = {
  "slots": {
    "root": "flex flex-col min-h-0 min-w-0 divide-y divide-default",
    "input": "[&>input]:h-12",
    "close": "",
    "back": "p-0",
    "content": "relative overflow-hidden flex flex-col",
    "footer": "p-1",
    "viewport": "relative divide-y divide-default scroll-py-1 overflow-y-auto flex-1 focus:outline-none",
    "group": "p-1 isolate",
    "empty": "py-6 text-center text-sm text-muted",
    "label": "p-1.5 text-xs font-semibold text-highlighted",
    "item": "group relative w-full flex items-center gap-1.5 p-1.5 text-sm select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75",
    "itemLeadingIcon": "shrink-0 size-5",
    "itemLeadingAvatar": "shrink-0",
    "itemLeadingAvatarSize": "2xs",
    "itemLeadingChip": "shrink-0 size-5",
    "itemLeadingChipSize": "md",
    "itemTrailing": "ms-auto inline-flex gap-1.5 items-center",
    "itemTrailingIcon": "shrink-0 size-5",
    "itemTrailingHighlightedIcon": "shrink-0 size-5 text-dimmed hidden group-data-highlighted:inline-flex",
    "itemTrailingKbds": "hidden lg:inline-flex items-center shrink-0 gap-0.5",
    "itemTrailingKbdsSize": "md",
    "itemLabel": "truncate space-x-1 text-dimmed",
    "itemLabelBase": "text-highlighted [&>mark]:text-inverted [&>mark]:bg-primary",
    "itemLabelPrefix": "text-default",
    "itemLabelSuffix": "text-dimmed [&>mark]:text-inverted [&>mark]:bg-primary"
  },
  "variants": {
    "active": {
      "true": {
        "item": "text-highlighted before:bg-elevated",
        "itemLeadingIcon": "text-default"
      },
      "false": {
        "item": [
          "text-default data-highlighted:not-data-disabled:text-highlighted data-highlighted:not-data-disabled:before:bg-elevated/50",
          "transition-colors before:transition-colors"
        ],
        "itemLeadingIcon": [
          "text-dimmed group-data-highlighted:not-group-data-disabled:text-default",
          "transition-colors"
        ]
      }
    },
    "loading": {
      "true": {
        "itemLeadingIcon": "animate-spin"
      }
    }
  }
};
const _sfc_main$1 = {
  __name: "UCommandPalette",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    icon: { type: [String, Object], required: false },
    selectedIcon: { type: [String, Object], required: false },
    trailingIcon: { type: [String, Object], required: false },
    placeholder: { type: String, required: false },
    autofocus: { type: Boolean, required: false, default: true },
    close: { type: [Boolean, Object], required: false },
    closeIcon: { type: [String, Object], required: false },
    back: { type: [Boolean, Object], required: false, default: true },
    backIcon: { type: [String, Object], required: false },
    groups: { type: Array, required: false },
    fuse: { type: Object, required: false },
    labelKey: { type: String, required: false, default: "label" },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    multiple: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    modelValue: { type: null, required: false, default: "" },
    defaultValue: { type: null, required: false },
    highlightOnHover: { type: Boolean, required: false },
    selectionBehavior: { type: String, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: [String, Object], required: false }
  }, {
    "searchTerm": { type: String, ...{ default: "" } },
    "searchTermModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["update:modelValue", "highlight", "entryFocus", "leave", "update:open"], ["update:searchTerm"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const searchTerm = useModel(__props, "searchTerm", { type: String, ...{ default: "" } });
    const { t } = useLocale();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "disabled", "multiple", "modelValue", "defaultValue", "highlightOnHover", "selectionBehavior"), emits);
    const inputProps = useForwardProps(reactivePick(props, "loading", "loadingIcon"));
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.commandPalette || {} })());
    const fuse = computed(() => defu({}, props.fuse, {
      fuseOptions: {
        ignoreLocation: true,
        threshold: 0.1,
        keys: [props.labelKey, "suffix"]
      },
      resultLimit: 12,
      matchAllWhenSearchEmpty: true
    }));
    const history = ref([]);
    const placeholder = computed(() => history.value[history.value.length - 1]?.placeholder || props.placeholder || t("commandPalette.placeholder"));
    const groups = computed(() => history.value?.length ? [history.value[history.value.length - 1]] : props.groups);
    const items = computed(() => groups.value?.filter((group) => {
      if (!group.id) {
        console.warn(`[@nuxt/ui] CommandPalette group is missing an \`id\` property`);
        return false;
      }
      if (group.ignoreFilter) {
        return false;
      }
      return true;
    })?.flatMap((group) => group.items?.map((item) => ({ ...item, group: group.id })) || []) || []);
    const { results: fuseResults } = useFuse(searchTerm, items, fuse);
    function getGroupWithItems(group, items2) {
      if (group?.postFilter && typeof group.postFilter === "function") {
        items2 = group.postFilter(searchTerm.value, items2);
      }
      return {
        ...group,
        items: items2.slice(0, fuse.value.resultLimit).map((item) => {
          return {
            ...item,
            labelHtml: highlight(item, searchTerm.value, props.labelKey),
            suffixHtml: highlight(item, searchTerm.value, void 0, [props.labelKey])
          };
        })
      };
    }
    const filteredGroups = computed(() => {
      const groupsById = fuseResults.value.reduce((acc, result) => {
        const { item, matches } = result;
        if (!item.group) {
          return acc;
        }
        acc[item.group] ||= [];
        acc[item.group]?.push({ ...item, matches });
        return acc;
      }, {});
      const fuseGroups = Object.entries(groupsById).map(([id, items2]) => {
        const group = groups.value?.find((group2) => group2.id === id);
        if (!group) {
          return;
        }
        return getGroupWithItems(group, items2);
      }).filter((group) => !!group);
      const nonFuseGroups = groups.value?.map((group, index) => ({ ...group, index }))?.filter((group) => group.ignoreFilter && group.items?.length)?.map((group) => ({ ...getGroupWithItems(group, group.items || []), index: group.index })) || [];
      return nonFuseGroups.reduce((acc, group) => {
        acc.splice(group.index, 0, group);
        return acc;
      }, [...fuseGroups]);
    });
    const listboxRootRef = useTemplateRef("listboxRootRef");
    function navigate(item) {
      if (!item.children?.length) {
        return;
      }
      history.value.push({
        id: `history-${history.value.length}`,
        label: item.label,
        slot: item.slot,
        placeholder: item.placeholder,
        items: item.children
      });
      searchTerm.value = "";
      listboxRootRef.value?.highlightFirstItem();
    }
    function navigateBack() {
      if (!history.value.length) {
        return;
      }
      history.value.pop();
      searchTerm.value = "";
      listboxRootRef.value?.highlightFirstItem();
    }
    function onBackspace() {
      if (!searchTerm.value) {
        navigateBack();
      }
    }
    function onSelect(e, item) {
      if (item.children?.length) {
        e.preventDefault();
        navigate(item);
      } else {
        item.onSelect?.(e);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ListboxRoot), mergeProps(unref(rootProps), {
        ref_key: "listboxRootRef",
        ref: listboxRootRef,
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ListboxFilter), {
              modelValue: searchTerm.value,
              "onUpdate:modelValue": ($event) => searchTerm.value = $event,
              "as-child": ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_sfc_main$2, mergeProps({
                    placeholder: placeholder.value,
                    variant: "none",
                    autofocus: __props.autofocus
                  }, unref(inputProps), {
                    icon: __props.icon || unref(appConfig).ui.icons.search,
                    class: ui.value.input({ class: props.ui?.input }),
                    onKeydown: onBackspace
                  }), createSlots({ _: 2 }, [
                    history.value?.length && (__props.back || !!slots.back) ? {
                      name: "leading",
                      fn: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderSlot(_ctx.$slots, "back", { ui: ui.value }, () => {
                            _push4(ssrRenderComponent(_sfc_main$t, mergeProps({
                              icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                              color: "neutral",
                              variant: "link",
                              "aria-label": unref(t)("commandPalette.back")
                            }, typeof __props.back === "object" ? __props.back : {}, {
                              class: ui.value.back({ class: props.ui?.back }),
                              onClick: navigateBack
                            }), null, _parent4, _scopeId3));
                          }, _push4, _parent4, _scopeId3);
                        } else {
                          return [
                            renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                              createVNode(_sfc_main$t, mergeProps({
                                icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                                color: "neutral",
                                variant: "link",
                                "aria-label": unref(t)("commandPalette.back")
                              }, typeof __props.back === "object" ? __props.back : {}, {
                                class: ui.value.back({ class: props.ui?.back }),
                                onClick: navigateBack
                              }), null, 16, ["icon", "aria-label", "class"])
                            ])
                          ];
                        }
                      }),
                      key: "0"
                    } : void 0,
                    __props.close || !!slots.close ? {
                      name: "trailing",
                      fn: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderSlot(_ctx.$slots, "close", { ui: ui.value }, () => {
                            if (__props.close) {
                              _push4(ssrRenderComponent(_sfc_main$t, mergeProps({
                                icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                color: "neutral",
                                variant: "ghost",
                                "aria-label": unref(t)("commandPalette.close")
                              }, typeof __props.close === "object" ? __props.close : {}, {
                                class: ui.value.close({ class: props.ui?.close }),
                                onClick: ($event) => emits("update:open", false)
                              }), null, _parent4, _scopeId3));
                            } else {
                              _push4(`<!---->`);
                            }
                          }, _push4, _parent4, _scopeId3);
                        } else {
                          return [
                            renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                              __props.close ? (openBlock(), createBlock(_sfc_main$t, mergeProps({
                                key: 0,
                                icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                                color: "neutral",
                                variant: "ghost",
                                "aria-label": unref(t)("commandPalette.close")
                              }, typeof __props.close === "object" ? __props.close : {}, {
                                class: ui.value.close({ class: props.ui?.close }),
                                onClick: ($event) => emits("update:open", false)
                              }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                            ])
                          ];
                        }
                      }),
                      key: "1"
                    } : void 0
                  ]), _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_sfc_main$2, mergeProps({
                      placeholder: placeholder.value,
                      variant: "none",
                      autofocus: __props.autofocus
                    }, unref(inputProps), {
                      icon: __props.icon || unref(appConfig).ui.icons.search,
                      class: ui.value.input({ class: props.ui?.input }),
                      onKeydown: withKeys(onBackspace, ["backspace"])
                    }), createSlots({ _: 2 }, [
                      history.value?.length && (__props.back || !!slots.back) ? {
                        name: "leading",
                        fn: withCtx(() => [
                          renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                            createVNode(_sfc_main$t, mergeProps({
                              icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                              color: "neutral",
                              variant: "link",
                              "aria-label": unref(t)("commandPalette.back")
                            }, typeof __props.back === "object" ? __props.back : {}, {
                              class: ui.value.back({ class: props.ui?.back }),
                              onClick: navigateBack
                            }), null, 16, ["icon", "aria-label", "class"])
                          ])
                        ]),
                        key: "0"
                      } : void 0,
                      __props.close || !!slots.close ? {
                        name: "trailing",
                        fn: withCtx(() => [
                          renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                            __props.close ? (openBlock(), createBlock(_sfc_main$t, mergeProps({
                              key: 0,
                              icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                              color: "neutral",
                              variant: "ghost",
                              "aria-label": unref(t)("commandPalette.close")
                            }, typeof __props.close === "object" ? __props.close : {}, {
                              class: ui.value.close({ class: props.ui?.close }),
                              onClick: ($event) => emits("update:open", false)
                            }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                          ])
                        ]),
                        key: "1"
                      } : void 0
                    ]), 1040, ["placeholder", "autofocus", "icon", "class"])
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(ListboxContent), {
              class: ui.value.content({ class: props.ui?.content })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (filteredGroups.value?.length) {
                    _push3(`<div role="presentation" class="${ssrRenderClass(ui.value.viewport({ class: props.ui?.viewport }))}"${_scopeId2}><!--[-->`);
                    ssrRenderList(filteredGroups.value, (group) => {
                      _push3(ssrRenderComponent(unref(ListboxGroup), {
                        key: `group-${group.id}`,
                        class: ui.value.group({ class: props.ui?.group })
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            if (unref(get)(group, props.labelKey)) {
                              _push4(ssrRenderComponent(unref(ListboxGroupLabel), {
                                class: ui.value.label({ class: props.ui?.label })
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(`${ssrInterpolate(unref(get)(group, props.labelKey))}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else {
                              _push4(`<!---->`);
                            }
                            _push4(`<!--[-->`);
                            ssrRenderList(group.items, (item, index) => {
                              _push4(ssrRenderComponent(unref(ListboxItem), {
                                key: `group-${group.id}-${index}`,
                                value: unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                                disabled: item.disabled,
                                "as-child": "",
                                onSelect: ($event) => onSelect($event, item)
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(_sfc_main$u, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                      default: withCtx(({ active, ...slotProps }, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                            class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                          }), {
                                            default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                ssrRenderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                                  item,
                                                  index
                                                }, () => {
                                                  ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                                    item,
                                                    index
                                                  }, () => {
                                                    if (item.loading) {
                                                      _push7(ssrRenderComponent(_sfc_main$y, {
                                                        name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                        class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                                      }, null, _parent7, _scopeId6));
                                                    } else if (item.icon) {
                                                      _push7(ssrRenderComponent(_sfc_main$y, {
                                                        name: item.icon,
                                                        class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                                      }, null, _parent7, _scopeId6));
                                                    } else if (item.avatar) {
                                                      _push7(ssrRenderComponent(_sfc_main$w, mergeProps({
                                                        size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                                      }, { ref_for: true }, item.avatar, {
                                                        class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                                      }), null, _parent7, _scopeId6));
                                                    } else if (item.chip) {
                                                      _push7(ssrRenderComponent(_sfc_main$x, mergeProps({
                                                        size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                        inset: "",
                                                        standalone: ""
                                                      }, { ref_for: true }, item.chip, {
                                                        class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                                      }), null, _parent7, _scopeId6));
                                                    } else {
                                                      _push7(`<!---->`);
                                                    }
                                                  }, _push7, _parent7, _scopeId6);
                                                  if (item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`]) {
                                                    _push7(`<span class="${ssrRenderClass(ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active }))}"${_scopeId6}>`);
                                                    ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                      item,
                                                      index
                                                    }, () => {
                                                      if (item.prefix) {
                                                        _push7(`<span class="${ssrRenderClass(ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] }))}"${_scopeId6}>${ssrInterpolate(item.prefix)}</span>`);
                                                      } else {
                                                        _push7(`<!---->`);
                                                      }
                                                      _push7(`<span class="${ssrRenderClass(ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }))}"${_scopeId6}>${(item.labelHtml || unref(get)(item, props.labelKey)) ?? ""}</span><span class="${ssrRenderClass(ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }))}"${_scopeId6}>${(item.suffixHtml || item.suffix) ?? ""}</span>`);
                                                    }, _push7, _parent7, _scopeId6);
                                                    _push7(`</span>`);
                                                  } else {
                                                    _push7(`<!---->`);
                                                  }
                                                  _push7(`<span class="${ssrRenderClass(ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] }))}"${_scopeId6}>`);
                                                  ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                    item,
                                                    index
                                                  }, () => {
                                                    if (item.children && item.children.length > 0) {
                                                      _push7(ssrRenderComponent(_sfc_main$y, {
                                                        name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                        class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                      }, null, _parent7, _scopeId6));
                                                    } else if (item.kbds?.length) {
                                                      _push7(`<span class="${ssrRenderClass(ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] }))}"${_scopeId6}><!--[-->`);
                                                      ssrRenderList(item.kbds, (kbd, kbdIndex) => {
                                                        _push7(ssrRenderComponent(_sfc_main$e, mergeProps({
                                                          key: kbdIndex,
                                                          size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                        }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent7, _scopeId6));
                                                      });
                                                      _push7(`<!--]--></span>`);
                                                    } else if (group.highlightedIcon) {
                                                      _push7(ssrRenderComponent(_sfc_main$y, {
                                                        name: group.highlightedIcon,
                                                        class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                      }, null, _parent7, _scopeId6));
                                                    } else {
                                                      _push7(`<!---->`);
                                                    }
                                                  }, _push7, _parent7, _scopeId6);
                                                  if (!item.children?.length) {
                                                    _push7(ssrRenderComponent(unref(ListboxItemIndicator), { "as-child": "" }, {
                                                      default: withCtx((_6, _push8, _parent8, _scopeId7) => {
                                                        if (_push8) {
                                                          _push8(ssrRenderComponent(_sfc_main$y, {
                                                            name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                            class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                          }, null, _parent8, _scopeId7));
                                                        } else {
                                                          return [
                                                            createVNode(_sfc_main$y, {
                                                              name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                              class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                            }, null, 8, ["name", "class"])
                                                          ];
                                                        }
                                                      }),
                                                      _: 2
                                                    }, _parent7, _scopeId6));
                                                  } else {
                                                    _push7(`<!---->`);
                                                  }
                                                  _push7(`</span>`);
                                                }, _push7, _parent7, _scopeId6);
                                              } else {
                                                return [
                                                  renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                                    item,
                                                    index
                                                  }, () => [
                                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                                      item,
                                                      index
                                                    }, () => [
                                                      item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                                        key: 0,
                                                        name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                        class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                                      }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                                        key: 1,
                                                        name: item.icon,
                                                        class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                                      }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                                        key: 2,
                                                        size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                                      }, { ref_for: true }, item.avatar, {
                                                        class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                                      }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                                        key: 3,
                                                        size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                        inset: "",
                                                        standalone: ""
                                                      }, { ref_for: true }, item.chip, {
                                                        class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                                      }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                                    ]),
                                                    item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                                      key: 0,
                                                      class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                                    }, [
                                                      renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                        item,
                                                        index
                                                      }, () => [
                                                        item.prefix ? (openBlock(), createBlock("span", {
                                                          key: 0,
                                                          class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                                        }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                                        createVNode("span", {
                                                          class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                          innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                                        }, null, 10, ["innerHTML"]),
                                                        createVNode("span", {
                                                          class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                          innerHTML: item.suffixHtml || item.suffix
                                                        }, null, 10, ["innerHTML"])
                                                      ])
                                                    ], 2)) : createCommentVNode("", true),
                                                    createVNode("span", {
                                                      class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                                    }, [
                                                      renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                        item,
                                                        index
                                                      }, () => [
                                                        item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                          key: 0,
                                                          name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                          class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                        }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                          key: 1,
                                                          class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                                        }, [
                                                          (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                            return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                              key: kbdIndex,
                                                              size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                            }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                          }), 128))
                                                        ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                          key: 2,
                                                          name: group.highlightedIcon,
                                                          class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                        }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                      ]),
                                                      !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                                        key: 0,
                                                        "as-child": ""
                                                      }, {
                                                        default: withCtx(() => [
                                                          createVNode(_sfc_main$y, {
                                                            name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                            class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                          }, null, 8, ["name", "class"])
                                                        ]),
                                                        _: 2
                                                      }, 1024)) : createCommentVNode("", true)
                                                    ], 2)
                                                  ])
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                              class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                            }), {
                                              default: withCtx(() => [
                                                renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                                  item,
                                                  index
                                                }, () => [
                                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                                    item,
                                                    index
                                                  }, () => [
                                                    item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                                      key: 0,
                                                      name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                                    }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                                      key: 1,
                                                      name: item.icon,
                                                      class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                                    }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                                      key: 2,
                                                      size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                                    }, { ref_for: true }, item.avatar, {
                                                      class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                                    }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                                      key: 3,
                                                      size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                      inset: "",
                                                      standalone: ""
                                                    }, { ref_for: true }, item.chip, {
                                                      class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                                    }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                                  ]),
                                                  item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                                    key: 0,
                                                    class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                                  }, [
                                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                      item,
                                                      index
                                                    }, () => [
                                                      item.prefix ? (openBlock(), createBlock("span", {
                                                        key: 0,
                                                        class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                                      }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                                      createVNode("span", {
                                                        class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                        innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                                      }, null, 10, ["innerHTML"]),
                                                      createVNode("span", {
                                                        class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                        innerHTML: item.suffixHtml || item.suffix
                                                      }, null, 10, ["innerHTML"])
                                                    ])
                                                  ], 2)) : createCommentVNode("", true),
                                                  createVNode("span", {
                                                    class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                                  }, [
                                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                      item,
                                                      index
                                                    }, () => [
                                                      item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                        key: 0,
                                                        name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                        class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                      }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                        key: 1,
                                                        class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                                      }, [
                                                        (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                          return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                            key: kbdIndex,
                                                            size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                          }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                        }), 128))
                                                      ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                        key: 2,
                                                        name: group.highlightedIcon,
                                                        class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                      }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                    ]),
                                                    !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                                      key: 0,
                                                      "as-child": ""
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode(_sfc_main$y, {
                                                          name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                          class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                        }, null, 8, ["name", "class"])
                                                      ]),
                                                      _: 2
                                                    }, 1024)) : createCommentVNode("", true)
                                                  ], 2)
                                                ])
                                              ]),
                                              _: 2
                                            }, 1040, ["class"])
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(_sfc_main$u, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                        default: withCtx(({ active, ...slotProps }) => [
                                          createVNode(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                            class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                          }), {
                                            default: withCtx(() => [
                                              renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                                item,
                                                index
                                              }, () => [
                                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                                  item,
                                                  index
                                                }, () => [
                                                  item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                                    key: 0,
                                                    name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                    class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                                  }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                                    key: 1,
                                                    name: item.icon,
                                                    class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                                  }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                                    key: 2,
                                                    size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                                  }, { ref_for: true }, item.avatar, {
                                                    class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                                  }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                                    key: 3,
                                                    size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                    inset: "",
                                                    standalone: ""
                                                  }, { ref_for: true }, item.chip, {
                                                    class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                                ]),
                                                item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                                  key: 0,
                                                  class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                                }, [
                                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                    item,
                                                    index
                                                  }, () => [
                                                    item.prefix ? (openBlock(), createBlock("span", {
                                                      key: 0,
                                                      class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                                    }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                                    createVNode("span", {
                                                      class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                      innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                                    }, null, 10, ["innerHTML"]),
                                                    createVNode("span", {
                                                      class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                      innerHTML: item.suffixHtml || item.suffix
                                                    }, null, 10, ["innerHTML"])
                                                  ])
                                                ], 2)) : createCommentVNode("", true),
                                                createVNode("span", {
                                                  class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                                }, [
                                                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                    item,
                                                    index
                                                  }, () => [
                                                    item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                      key: 0,
                                                      name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                      class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                    }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                      key: 1,
                                                      class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                                    }, [
                                                      (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                        return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                          key: kbdIndex,
                                                          size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                        }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                      }), 128))
                                                    ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                      key: 2,
                                                      name: group.highlightedIcon,
                                                      class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                  ]),
                                                  !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                                    key: 0,
                                                    "as-child": ""
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(_sfc_main$y, {
                                                        name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                        class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                      }, null, 8, ["name", "class"])
                                                    ]),
                                                    _: 2
                                                  }, 1024)) : createCommentVNode("", true)
                                                ], 2)
                                              ])
                                            ]),
                                            _: 2
                                          }, 1040, ["class"])
                                        ]),
                                        _: 2
                                      }, 1040)
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            });
                            _push4(`<!--]-->`);
                          } else {
                            return [
                              unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                                key: 0,
                                class: ui.value.label({ class: props.ui?.label })
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                                ]),
                                _: 2
                              }, 1032, ["class"])) : createCommentVNode("", true),
                              (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                                return openBlock(), createBlock(unref(ListboxItem), {
                                  key: `group-${group.id}-${index}`,
                                  value: unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                                  disabled: item.disabled,
                                  "as-child": "",
                                  onSelect: ($event) => onSelect($event, item)
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_sfc_main$u, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                      default: withCtx(({ active, ...slotProps }) => [
                                        createVNode(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                          class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                        }), {
                                          default: withCtx(() => [
                                            renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                              item,
                                              index
                                            }, () => [
                                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                                item,
                                                index
                                              }, () => [
                                                item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                                  key: 0,
                                                  name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                  class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                                }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                                  key: 1,
                                                  name: item.icon,
                                                  class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                                }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                                  key: 2,
                                                  size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                                }, { ref_for: true }, item.avatar, {
                                                  class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                                }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                                  key: 3,
                                                  size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                  inset: "",
                                                  standalone: ""
                                                }, { ref_for: true }, item.chip, {
                                                  class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                                }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                              ]),
                                              item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                                key: 0,
                                                class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                              }, [
                                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                  item,
                                                  index
                                                }, () => [
                                                  item.prefix ? (openBlock(), createBlock("span", {
                                                    key: 0,
                                                    class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                                  }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                                  createVNode("span", {
                                                    class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                    innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                                  }, null, 10, ["innerHTML"]),
                                                  createVNode("span", {
                                                    class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                    innerHTML: item.suffixHtml || item.suffix
                                                  }, null, 10, ["innerHTML"])
                                                ])
                                              ], 2)) : createCommentVNode("", true),
                                              createVNode("span", {
                                                class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                              }, [
                                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                  item,
                                                  index
                                                }, () => [
                                                  item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                    key: 0,
                                                    name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                    class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                  }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                    key: 1,
                                                    class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                                  }, [
                                                    (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                      return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                        key: kbdIndex,
                                                        size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                      }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                    }), 128))
                                                  ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                    key: 2,
                                                    name: group.highlightedIcon,
                                                    class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                ]),
                                                !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                                  key: 0,
                                                  "as-child": ""
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(_sfc_main$y, {
                                                      name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                      class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                    }, null, 8, ["name", "class"])
                                                  ]),
                                                  _: 2
                                                }, 1024)) : createCommentVNode("", true)
                                              ], 2)
                                            ])
                                          ]),
                                          _: 2
                                        }, 1040, ["class"])
                                      ]),
                                      _: 2
                                    }, 1040)
                                  ]),
                                  _: 2
                                }, 1032, ["value", "disabled", "onSelect"]);
                              }), 128))
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]--></div>`);
                  } else {
                    _push3(`<div class="${ssrRenderClass(ui.value.empty({ class: props.ui?.empty }))}"${_scopeId2}>`);
                    ssrRenderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => {
                      _push3(`${ssrInterpolate(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData"))}`);
                    }, _push3, _parent3, _scopeId2);
                    _push3(`</div>`);
                  }
                } else {
                  return [
                    filteredGroups.value?.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      role: "presentation",
                      class: ui.value.viewport({ class: props.ui?.viewport })
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(filteredGroups.value, (group) => {
                        return openBlock(), createBlock(unref(ListboxGroup), {
                          key: `group-${group.id}`,
                          class: ui.value.group({ class: props.ui?.group })
                        }, {
                          default: withCtx(() => [
                            unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                              key: 0,
                              class: ui.value.label({ class: props.ui?.label })
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                              ]),
                              _: 2
                            }, 1032, ["class"])) : createCommentVNode("", true),
                            (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                              return openBlock(), createBlock(unref(ListboxItem), {
                                key: `group-${group.id}-${index}`,
                                value: unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                                disabled: item.disabled,
                                "as-child": "",
                                onSelect: ($event) => onSelect($event, item)
                              }, {
                                default: withCtx(() => [
                                  createVNode(_sfc_main$u, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                    default: withCtx(({ active, ...slotProps }) => [
                                      createVNode(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                        class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                      }), {
                                        default: withCtx(() => [
                                          renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                            item,
                                            index
                                          }, () => [
                                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                              item,
                                              index
                                            }, () => [
                                              item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                                key: 0,
                                                name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                                class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                              }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                                key: 1,
                                                name: item.icon,
                                                class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                              }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                                key: 2,
                                                size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                              }, { ref_for: true }, item.avatar, {
                                                class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                              }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                                key: 3,
                                                size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                                inset: "",
                                                standalone: ""
                                              }, { ref_for: true }, item.chip, {
                                                class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                              }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                            ]),
                                            item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                              key: 0,
                                              class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                            }, [
                                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                                item,
                                                index
                                              }, () => [
                                                item.prefix ? (openBlock(), createBlock("span", {
                                                  key: 0,
                                                  class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                                }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                                createVNode("span", {
                                                  class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                  innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                                }, null, 10, ["innerHTML"]),
                                                createVNode("span", {
                                                  class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                  innerHTML: item.suffixHtml || item.suffix
                                                }, null, 10, ["innerHTML"])
                                              ])
                                            ], 2)) : createCommentVNode("", true),
                                            createVNode("span", {
                                              class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                            }, [
                                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                                item,
                                                index
                                              }, () => [
                                                item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                  key: 0,
                                                  name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                  class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                  key: 1,
                                                  class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                                }, [
                                                  (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                    return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                      key: kbdIndex,
                                                      size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                    }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                  }), 128))
                                                ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                  key: 2,
                                                  name: group.highlightedIcon,
                                                  class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                              ]),
                                              !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                                key: 0,
                                                "as-child": ""
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(_sfc_main$y, {
                                                    name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                    class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                  }, null, 8, ["name", "class"])
                                                ]),
                                                _: 2
                                              }, 1024)) : createCommentVNode("", true)
                                            ], 2)
                                          ])
                                        ]),
                                        _: 2
                                      }, 1040, ["class"])
                                    ]),
                                    _: 2
                                  }, 1040)
                                ]),
                                _: 2
                              }, 1032, ["value", "disabled", "onSelect"]);
                            }), 128))
                          ]),
                          _: 2
                        }, 1032, ["class"]);
                      }), 128))
                    ], 2)) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: ui.value.empty({ class: props.ui?.empty })
                    }, [
                      renderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => [
                        createTextVNode(toDisplayString(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData")), 1)
                      ])
                    ], 2))
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            if (!!slots.footer) {
              _push2(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "footer", { ui: ui.value }, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(unref(ListboxFilter), {
                modelValue: searchTerm.value,
                "onUpdate:modelValue": ($event) => searchTerm.value = $event,
                "as-child": ""
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$2, mergeProps({
                    placeholder: placeholder.value,
                    variant: "none",
                    autofocus: __props.autofocus
                  }, unref(inputProps), {
                    icon: __props.icon || unref(appConfig).ui.icons.search,
                    class: ui.value.input({ class: props.ui?.input }),
                    onKeydown: withKeys(onBackspace, ["backspace"])
                  }), createSlots({ _: 2 }, [
                    history.value?.length && (__props.back || !!slots.back) ? {
                      name: "leading",
                      fn: withCtx(() => [
                        renderSlot(_ctx.$slots, "back", { ui: ui.value }, () => [
                          createVNode(_sfc_main$t, mergeProps({
                            icon: __props.backIcon || unref(appConfig).ui.icons.arrowLeft,
                            color: "neutral",
                            variant: "link",
                            "aria-label": unref(t)("commandPalette.back")
                          }, typeof __props.back === "object" ? __props.back : {}, {
                            class: ui.value.back({ class: props.ui?.back }),
                            onClick: navigateBack
                          }), null, 16, ["icon", "aria-label", "class"])
                        ])
                      ]),
                      key: "0"
                    } : void 0,
                    __props.close || !!slots.close ? {
                      name: "trailing",
                      fn: withCtx(() => [
                        renderSlot(_ctx.$slots, "close", { ui: ui.value }, () => [
                          __props.close ? (openBlock(), createBlock(_sfc_main$t, mergeProps({
                            key: 0,
                            icon: __props.closeIcon || unref(appConfig).ui.icons.close,
                            color: "neutral",
                            variant: "ghost",
                            "aria-label": unref(t)("commandPalette.close")
                          }, typeof __props.close === "object" ? __props.close : {}, {
                            class: ui.value.close({ class: props.ui?.close }),
                            onClick: ($event) => emits("update:open", false)
                          }), null, 16, ["icon", "aria-label", "class", "onClick"])) : createCommentVNode("", true)
                        ])
                      ]),
                      key: "1"
                    } : void 0
                  ]), 1040, ["placeholder", "autofocus", "icon", "class"])
                ]),
                _: 3
              }, 8, ["modelValue", "onUpdate:modelValue"]),
              createVNode(unref(ListboxContent), {
                class: ui.value.content({ class: props.ui?.content })
              }, {
                default: withCtx(() => [
                  filteredGroups.value?.length ? (openBlock(), createBlock("div", {
                    key: 0,
                    role: "presentation",
                    class: ui.value.viewport({ class: props.ui?.viewport })
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(filteredGroups.value, (group) => {
                      return openBlock(), createBlock(unref(ListboxGroup), {
                        key: `group-${group.id}`,
                        class: ui.value.group({ class: props.ui?.group })
                      }, {
                        default: withCtx(() => [
                          unref(get)(group, props.labelKey) ? (openBlock(), createBlock(unref(ListboxGroupLabel), {
                            key: 0,
                            class: ui.value.label({ class: props.ui?.label })
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(get)(group, props.labelKey)), 1)
                            ]),
                            _: 2
                          }, 1032, ["class"])) : createCommentVNode("", true),
                          (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item, index) => {
                            return openBlock(), createBlock(unref(ListboxItem), {
                              key: `group-${group.id}-${index}`,
                              value: unref(omit)(item, ["matches", "group", "onSelect", "labelHtml", "suffixHtml", "children"]),
                              disabled: item.disabled,
                              "as-child": "",
                              onSelect: ($event) => onSelect($event, item)
                            }, {
                              default: withCtx(() => [
                                createVNode(_sfc_main$u, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                  default: withCtx(({ active, ...slotProps }) => [
                                    createVNode(_sfc_main$v, mergeProps({ ref_for: true }, slotProps, {
                                      class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], active: active || item.active })
                                    }), {
                                      default: withCtx(() => [
                                        renderSlot(_ctx.$slots, item.slot || group.slot || "item", {
                                          item,
                                          index
                                        }, () => [
                                          renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : group.slot ? `${group.slot}-leading` : `item-leading`, {
                                            item,
                                            index
                                          }, () => [
                                            item.loading ? (openBlock(), createBlock(_sfc_main$y, {
                                              key: 0,
                                              name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                                              class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], loading: true })
                                            }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$y, {
                                              key: 1,
                                              name: item.icon,
                                              class: ui.value.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon], active: active || item.active })
                                            }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$w, mergeProps({
                                              key: 2,
                                              size: item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.value.itemLeadingAvatarSize()
                                            }, { ref_for: true }, item.avatar, {
                                              class: ui.value.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active: active || item.active })
                                            }), null, 16, ["size", "class"])) : item.chip ? (openBlock(), createBlock(_sfc_main$x, mergeProps({
                                              key: 3,
                                              size: item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.value.itemLeadingChipSize(),
                                              inset: "",
                                              standalone: ""
                                            }, { ref_for: true }, item.chip, {
                                              class: ui.value.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip], active: active || item.active })
                                            }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                                          ]),
                                          item.labelHtml || unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`] ? (openBlock(), createBlock("span", {
                                            key: 0,
                                            class: ui.value.itemLabel({ class: [props.ui?.itemLabel, item.ui?.itemLabel], active: active || item.active })
                                          }, [
                                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : group.slot ? `${group.slot}-label` : `item-label`, {
                                              item,
                                              index
                                            }, () => [
                                              item.prefix ? (openBlock(), createBlock("span", {
                                                key: 0,
                                                class: ui.value.itemLabelPrefix({ class: [props.ui?.itemLabelPrefix, item.ui?.itemLabelPrefix] })
                                              }, toDisplayString(item.prefix), 3)) : createCommentVNode("", true),
                                              createVNode("span", {
                                                class: ui.value.itemLabelBase({ class: [props.ui?.itemLabelBase, item.ui?.itemLabelBase], active: active || item.active }),
                                                innerHTML: item.labelHtml || unref(get)(item, props.labelKey)
                                              }, null, 10, ["innerHTML"]),
                                              createVNode("span", {
                                                class: ui.value.itemLabelSuffix({ class: [props.ui?.itemLabelSuffix, item.ui?.itemLabelSuffix], active: active || item.active }),
                                                innerHTML: item.suffixHtml || item.suffix
                                              }, null, 10, ["innerHTML"])
                                            ])
                                          ], 2)) : createCommentVNode("", true),
                                          createVNode("span", {
                                            class: ui.value.itemTrailing({ class: [props.ui?.itemTrailing, item.ui?.itemTrailing] })
                                          }, [
                                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : group.slot ? `${group.slot}-trailing` : `item-trailing`, {
                                              item,
                                              index
                                            }, () => [
                                              item.children && item.children.length > 0 ? (openBlock(), createBlock(_sfc_main$y, {
                                                key: 0,
                                                name: __props.trailingIcon || unref(appConfig).ui.icons.chevronRight,
                                                class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                              }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                                                key: 1,
                                                class: ui.value.itemTrailingKbds({ class: [props.ui?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                                              }, [
                                                (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                                                  return openBlock(), createBlock(_sfc_main$e, mergeProps({
                                                    key: kbdIndex,
                                                    size: item.ui?.itemTrailingKbdsSize || props.ui?.itemTrailingKbdsSize || ui.value.itemTrailingKbdsSize()
                                                  }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                                }), 128))
                                              ], 2)) : group.highlightedIcon ? (openBlock(), createBlock(_sfc_main$y, {
                                                key: 2,
                                                name: group.highlightedIcon,
                                                class: ui.value.itemTrailingHighlightedIcon({ class: [props.ui?.itemTrailingHighlightedIcon, item.ui?.itemTrailingHighlightedIcon] })
                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                            ]),
                                            !item.children?.length ? (openBlock(), createBlock(unref(ListboxItemIndicator), {
                                              key: 0,
                                              "as-child": ""
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_sfc_main$y, {
                                                  name: __props.selectedIcon || unref(appConfig).ui.icons.check,
                                                  class: ui.value.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, item.ui?.itemTrailingIcon] })
                                                }, null, 8, ["name", "class"])
                                              ]),
                                              _: 2
                                            }, 1024)) : createCommentVNode("", true)
                                          ], 2)
                                        ])
                                      ]),
                                      _: 2
                                    }, 1040, ["class"])
                                  ]),
                                  _: 2
                                }, 1040)
                              ]),
                              _: 2
                            }, 1032, ["value", "disabled", "onSelect"]);
                          }), 128))
                        ]),
                        _: 2
                      }, 1032, ["class"]);
                    }), 128))
                  ], 2)) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: ui.value.empty({ class: props.ui?.empty })
                  }, [
                    renderSlot(_ctx.$slots, "empty", { searchTerm: searchTerm.value }, () => [
                      createTextVNode(toDisplayString(searchTerm.value ? unref(t)("commandPalette.noMatch", { searchTerm: searchTerm.value }) : unref(t)("commandPalette.noData")), 1)
                    ])
                  ], 2))
                ]),
                _: 3
              }, 8, ["class"]),
              !!slots.footer ? (openBlock(), createBlock("div", {
                key: 0,
                class: ui.value.footer({ class: props.ui?.footer })
              }, [
                renderSlot(_ctx.$slots, "footer", { ui: ui.value })
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@bab_01b8e4c3f51a2b4e0cb534dba2e2c4de/node_modules/@nuxt/ui/dist/runtime/components/CommandPalette.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "modal": "sm:max-w-3xl sm:h-[28rem]",
    "input": "[&>input]:text-base/5"
  }
};
const chainedShortcutRegex = /^[^-]+.*-.*[^-]+$/;
const combinedShortcutRegex = /^[^_]+.*_.*[^_]+$/;
const shiftableKeys = ["arrowleft", "arrowright", "arrowup", "arrowright", "tab", "escape", "enter", "backspace"];
function defineShortcuts(config, options = {}) {
  const chainedInputs = ref([]);
  const clearChainedInput = () => {
    chainedInputs.value.splice(0, chainedInputs.value.length);
  };
  const debouncedClearChainedInput = useDebounceFn(clearChainedInput, options.chainDelay ?? 800);
  const { macOS } = useKbd();
  const activeElement = useActiveElement();
  const onKeyDown = (e) => {
    if (!e.key) {
      return;
    }
    const alphabetKey = /^[a-z]{1}$/i.test(e.key);
    const shiftableKey = shiftableKeys.includes(e.key.toLowerCase());
    let chainedKey;
    chainedInputs.value.push(e.key);
    if (chainedInputs.value.length >= 2) {
      chainedKey = chainedInputs.value.slice(-2).join("-");
      for (const shortcut of shortcuts.value.filter((s) => s.chained)) {
        if (shortcut.key !== chainedKey) {
          continue;
        }
        if (shortcut.enabled) {
          e.preventDefault();
          shortcut.handler(e);
        }
        clearChainedInput();
        return;
      }
    }
    for (const shortcut of shortcuts.value.filter((s) => !s.chained)) {
      if (e.key.toLowerCase() !== shortcut.key) {
        continue;
      }
      if (e.metaKey !== shortcut.metaKey) {
        continue;
      }
      if (e.ctrlKey !== shortcut.ctrlKey) {
        continue;
      }
      if ((alphabetKey || shiftableKey) && e.shiftKey !== shortcut.shiftKey) {
        continue;
      }
      if (shortcut.enabled) {
        e.preventDefault();
        shortcut.handler(e);
      }
      clearChainedInput();
      return;
    }
    debouncedClearChainedInput();
  };
  const usingInput = computed(() => {
    const tagName = activeElement.value?.tagName;
    const contentEditable = activeElement.value?.contentEditable;
    const usingInput2 = !!(tagName === "INPUT" || tagName === "TEXTAREA" || contentEditable === "true" || contentEditable === "plaintext-only");
    if (usingInput2) {
      return activeElement.value?.name || true;
    }
    return false;
  });
  const shortcuts = computed(() => {
    return Object.entries(toValue(config)).map(([key, shortcutConfig]) => {
      if (!shortcutConfig) {
        return null;
      }
      let shortcut;
      if (key.includes("-") && key !== "-" && !key.includes("_") && !key.match(chainedShortcutRegex)?.length) {
        console.trace(`[Shortcut] Invalid key: "${key}"`);
      }
      if (key.includes("_") && key !== "_" && !key.match(combinedShortcutRegex)?.length) {
        console.trace(`[Shortcut] Invalid key: "${key}"`);
      }
      const chained = key.includes("-") && key !== "-" && !key.includes("_");
      if (chained) {
        shortcut = {
          key: key.toLowerCase(),
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false
        };
      } else {
        const keySplit = key.toLowerCase().split("_").map((k) => k);
        shortcut = {
          key: keySplit.filter((k) => !["meta", "command", "ctrl", "shift", "alt", "option"].includes(k)).join("_"),
          metaKey: keySplit.includes("meta") || keySplit.includes("command"),
          ctrlKey: keySplit.includes("ctrl"),
          shiftKey: keySplit.includes("shift"),
          altKey: keySplit.includes("alt") || keySplit.includes("option")
        };
      }
      shortcut.chained = chained;
      if (!macOS.value && shortcut.metaKey && !shortcut.ctrlKey) {
        shortcut.metaKey = false;
        shortcut.ctrlKey = true;
      }
      if (typeof shortcutConfig === "function") {
        shortcut.handler = shortcutConfig;
      } else if (typeof shortcutConfig === "object") {
        shortcut = { ...shortcut, handler: shortcutConfig.handler };
      }
      if (!shortcut.handler) {
        console.trace("[Shortcut] Invalid value");
        return null;
      }
      let enabled = true;
      if (!shortcutConfig.usingInput) {
        enabled = !usingInput.value;
      } else if (typeof shortcutConfig.usingInput === "string") {
        enabled = usingInput.value === shortcutConfig.usingInput;
      }
      shortcut.enabled = enabled;
      return shortcut;
    }).filter(Boolean);
  });
  return useEventListener("keydown", onKeyDown);
}
const _sfc_main = {
  __name: "UContentSearch",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    icon: { type: [String, Object], required: false },
    placeholder: { type: String, required: false },
    autofocus: { type: Boolean, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: [String, Object], required: false },
    close: { type: [Boolean, Object], required: false, default: true },
    closeIcon: { type: [String, Object], required: false },
    shortcut: { type: String, required: false, default: "meta_k" },
    links: { type: Array, required: false },
    navigation: { type: Array, required: false },
    groups: { type: Array, required: false },
    files: { type: Array, required: false },
    fuse: { type: Object, required: false },
    colorMode: { type: Boolean, required: false, default: true },
    class: { type: null, required: false },
    ui: { type: void 0, required: false }
  }, {
    "searchTerm": { type: String, ...{ default: "" } },
    "searchTermModifiers": {}
  }),
  emits: ["update:searchTerm"],
  setup(__props, { expose: __expose }) {
    const props = __props;
    const slots = useSlots();
    const searchTerm = useModel(__props, "searchTerm", { type: String, ...{ default: "" } });
    const { t } = useLocale();
    const { open } = useContentSearch();
    const colorMode = useColorMode();
    const appConfig = useAppConfig();
    const commandPaletteProps = useForwardProps(reactivePick(props, "icon", "placeholder", "autofocus", "loading", "loadingIcon", "close", "closeIcon"));
    const proxySlots = omit(slots, ["content"]);
    const fuse = computed(() => defu({}, props.fuse, {
      fuseOptions: {
        includeMatches: true
      }
    }));
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.contentSearch || {} })());
    function mapLinksItems(links) {
      return links.flatMap((link) => [{
        ...link,
        suffix: link.description,
        icon: link.icon || appConfig.ui.icons.file
      }, ...link.children?.map((child) => ({
        ...child,
        prefix: link.label + " >",
        suffix: child.description,
        icon: child.icon || link.icon || appConfig.ui.icons.file
      })) || []]);
    }
    function mapNavigationItems(children, parent) {
      return children.flatMap((link) => {
        if (link.children?.length) {
          return mapNavigationItems(link.children, link);
        }
        return props.files?.filter((file) => file.id === link.path || file.id.startsWith(`${link.path}#`))?.map((file) => mapFile(file, link, parent)) || [];
      });
    }
    function mapFile(file, link, parent) {
      const prefix = [...new Set([parent?.title, ...file.titles].filter(Boolean))];
      return {
        prefix: prefix?.length ? prefix.join(" > ") + " >" : void 0,
        label: file.id === link.path ? link.title : file.title,
        suffix: file.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
        to: file.id,
        icon: link.icon || parent?.icon || (file.level > 1 ? appConfig.ui.icons.hash : appConfig.ui.icons.file),
        level: file.level
      };
    }
    const groups = computed(() => {
      const groups2 = [];
      if (props.links?.length) {
        groups2.push({ id: "links", label: t("contentSearch.links"), items: mapLinksItems(props.links) });
      }
      if (props.navigation?.length) {
        if (props.navigation.some((link) => !!link.children?.length)) {
          groups2.push(...props.navigation.map((group) => ({ id: group.path, label: group.title, items: mapNavigationItems(group.children || []), postFilter })));
        } else {
          groups2.push({ id: "docs", items: mapNavigationItems(props.navigation), postFilter });
        }
      }
      groups2.push(...props.groups || []);
      if (props.colorMode && !colorMode?.forced) {
        groups2.push({
          id: "theme",
          label: t("contentSearch.theme"),
          items: [{
            label: t("colorMode.system"),
            icon: appConfig.ui.icons.system,
            active: colorMode.preference === "system",
            onSelect: () => {
              colorMode.preference = "system";
            }
          }, {
            label: t("colorMode.light"),
            icon: appConfig.ui.icons.light,
            active: colorMode.preference === "light",
            onSelect: () => {
              colorMode.preference = "light";
            }
          }, {
            label: t("colorMode.dark"),
            icon: appConfig.ui.icons.dark,
            active: colorMode.preference === "dark",
            onSelect: () => {
              colorMode.preference = "dark";
            }
          }]
        });
      }
      return groups2;
    });
    function postFilter(query, items) {
      if (!query) {
        return items?.filter((item) => item.level === 1);
      }
      return items;
    }
    function onSelect(item) {
      if (item.disabled) {
        return;
      }
      open.value = false;
      searchTerm.value = "";
    }
    defineShortcuts({
      [props.shortcut]: {
        usingInput: true,
        handler: () => open.value = !open.value
      }
    });
    const commandPaletteRef = useTemplateRef("commandPaletteRef");
    __expose({
      commandPaletteRef
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$k, mergeProps({
        open: unref(open),
        "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null,
        title: unref(t)("contentSearch.title"),
        description: unref(t)("contentSearch.description"),
        class: ui.value.modal({ class: [props.ui?.modal, props.class] })
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "content", {}, () => {
              _push2(ssrRenderComponent(_sfc_main$1, mergeProps({
                ref_key: "commandPaletteRef",
                ref: commandPaletteRef,
                "search-term": searchTerm.value,
                "onUpdate:searchTerm": ($event) => searchTerm.value = $event
              }, unref(commandPaletteProps), {
                groups: groups.value,
                fuse: fuse.value,
                ui: unref(transformUI)(unref(omit)(ui.value, ["modal"]), props.ui),
                "onUpdate:modelValue": onSelect,
                "onUpdate:open": ($event) => open.value = $event
              }), createSlots({ _: 2 }, [
                renderList(unref(proxySlots), (_2, name) => {
                  return {
                    name,
                    fn: withCtx((slotData, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        ssrRenderSlot(_ctx.$slots, name, slotData, null, _push3, _parent3, _scopeId2);
                      } else {
                        return [
                          renderSlot(_ctx.$slots, name, slotData)
                        ];
                      }
                    })
                  };
                })
              ]), _parent2, _scopeId));
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "content", {}, () => [
                createVNode(_sfc_main$1, mergeProps({
                  ref_key: "commandPaletteRef",
                  ref: commandPaletteRef,
                  "search-term": searchTerm.value,
                  "onUpdate:searchTerm": ($event) => searchTerm.value = $event
                }, unref(commandPaletteProps), {
                  groups: groups.value,
                  fuse: fuse.value,
                  ui: unref(transformUI)(unref(omit)(ui.value, ["modal"]), props.ui),
                  "onUpdate:modelValue": onSelect,
                  "onUpdate:open": ($event) => open.value = $event
                }), createSlots({ _: 2 }, [
                  renderList(unref(proxySlots), (_2, name) => {
                    return {
                      name,
                      fn: withCtx((slotData) => [
                        renderSlot(_ctx.$slots, name, slotData)
                      ])
                    };
                  })
                ]), 1040, ["search-term", "onUpdate:searchTerm", "groups", "fuse", "ui", "onUpdate:open"])
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@bab_01b8e4c3f51a2b4e0cb534dba2e2c4de/node_modules/@nuxt/ui/dist/runtime/components/content/ContentSearch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ContentSearch-XKRQsjjT.mjs.map
