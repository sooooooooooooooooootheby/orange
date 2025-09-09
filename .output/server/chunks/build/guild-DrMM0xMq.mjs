import { h as handleTime } from './handleTime-BloDdbsL.mjs';
import { h as handleHead } from './handleHead-BLMoKGtz.mjs';
import { defineComponent, computed, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { d as useAsyncData } from './server.mjs';
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

function toColoredHtml(input) {
  if (typeof input !== "string" || !input) return "";
  const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
  const graphemes = [];
  const indexToGrapheme = /* @__PURE__ */ new Map();
  if (segmenter) {
    const segs = segmenter.segment(input);
    for (const s of segs) {
      graphemes.push({ index: s.index, text: s.segment });
      indexToGrapheme.set(s.index, s.segment);
    }
  } else {
    let i2 = 0;
    for (const cp of Array.from(input)) {
      indexToGrapheme.set(i2, cp);
      graphemes.push({ index: i2, text: cp });
      i2 += cp.length;
    }
  }
  let color = null;
  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;
  let nextOnceColor = null;
  const out = [];
  const esc = (s) => s.replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]
  );
  const styleOf = (c) => {
    const styles = [];
    if (c) styles.push(`color:${c}`);
    if (bold) styles.push("font-weight:700");
    if (italic) styles.push("font-style:italic");
    const decos = [];
    if (underline) decos.push("underline");
    if (strike) decos.push("line-through");
    if (decos.length) styles.push(`text-decoration:${decos.join(" ")}`);
    return styles.length ? ` style="${styles.join(";")}"` : "";
  };
  const isHex = (ch) => /^[0-9a-fA-F]$/.test(ch);
  let i = 0;
  const len = input.length;
  while (i < len) {
    const ch = input[i];
    if (ch === "&" && i + 8 <= len && input[i + 1] === "#") {
      const hex = input.slice(i + 2, i + 8);
      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        nextOnceColor = `#${hex.toLowerCase()}`;
        i += 8;
        continue;
      }
    }
    if (ch === "&" && i + 14 <= len && input[i + 1] === "x") {
      let ok = true;
      let hex = "";
      for (let k = 0; k < 6; k++) {
        const amp = input[i + 2 + k * 2];
        const hd = input[i + 3 + k * 2];
        if (amp !== "&" || !isHex(hd)) {
          ok = false;
          break;
        }
        hex += hd;
      }
      if (ok) {
        color = `#${hex.toLowerCase()}`;
        i += 14;
        continue;
      }
    }
    if (ch === "&" && i + 1 < len) {
      const code = input[i + 1].toLowerCase();
      if (["l", "o", "n", "m", "r"].includes(code)) {
        if (code === "r") {
          color = null;
          bold = italic = underline = strike = false;
        } else if (code === "l") bold = true;
        else if (code === "o") italic = true;
        else if (code === "n") underline = true;
        else if (code === "m") strike = true;
        i += 2;
        continue;
      }
    }
    const g = indexToGrapheme.get(i);
    if (g == null) {
      const safeChar = esc(input[i]);
      out.push(`<span${styleOf(color)}>${safeChar}</span>`);
      i += 1;
      nextOnceColor = null;
      continue;
    }
    const appliedColor = nextOnceColor || color;
    nextOnceColor = null;
    const safeG = esc(g);
    out.push(`<span${styleOf(appliedColor)}>${safeG}</span>`);
    i += g.length;
  }
  return `<span class="mc-colored">${out.join("")}</span>`;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "guild",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const score = (level, prosperity_degree, money, member_count) => {
      return level * 1e3 + prosperity_degree * 0.1 + money * 1 + member_count * 100;
    };
    const sorting = computed(() => {
      return data.value?.ranking.sort((a, b) => {
        return b.score - a.score;
      });
    });
    const { data } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("mountains", async () => {
      const res = await $fetch("/api/guild");
      const ranking = res.data.map((item) => {
        return {
          ...item,
          score: score(item.level, item.prosperity_degree, item.money, item.member_count)
        };
      });
      return { ranking, time: res.cacheTime };
    })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(data)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto mb-12 max-w-2xl" }, _attrs))}><div class="mb-2 flex items-center justify-between"><span>排名</span><span class="text-xs text-gray-400">更新于 ${ssrInterpolate(("handleTime" in _ctx ? _ctx.handleTime : unref(handleTime))(unref(data).time))}</span></div><div class="flex flex-col gap-3"><!--[-->`);
        ssrRenderList(unref(sorting), (item, index) => {
          _push(`<div><div class="bg-default border-default flex flex-col gap-1 rounded-lg border-1 px-3 py-2"><div class="flex items-center gap-2"><img${ssrRenderAttr("src", ("handleHead" in _ctx ? _ctx.handleHead : unref(handleHead))(item.creator))} alt="item.creator" class="mb-0! w-10!"><div class="flex flex-col justify-center"><span>${("toColoredHtml" in _ctx ? _ctx.toColoredHtml : unref(toColoredHtml))(item.guild_name) ?? ""}</span><span class="text-sm text-gray-600"> 会长: ${ssrInterpolate(item.creator)}</span></div></div><p class="text-sm text-gray-600">${ssrInterpolate(item.description)}</p><div class="flex w-full"><div class="flex w-1/5 flex-col gap-0.5"><span class="text-xs text-gray-400">评分</span><span class="${ssrRenderClass({ "text-teal-500": index === 2, "text-indigo-500": index === 1, "text-rose-500": index === 0 })}">${ssrInterpolate(item.score)}</span></div><div class="flex w-1/5 flex-col gap-0.5"><span class="text-xs text-gray-400">等级</span><span>${ssrInterpolate(item.level)}</span></div><div class="flex w-1/5 flex-col gap-0.5"><span class="text-xs text-gray-400">会员</span><span>${ssrInterpolate(item.member_count)}</span></div><div class="flex w-1/5 flex-col gap-0.5"><span class="text-xs text-gray-400">活跃</span><span>${ssrInterpolate(item.prosperity_degree)}</span></div><div class="flex w-1/5 flex-col gap-0.5"><span class="text-xs text-gray-400">资金</span><span>${ssrInterpolate(item.money)}</span></div></div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/content/guild.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guild = Object.assign(_sfc_main, { __name: "Guild" });

export { guild as default };
//# sourceMappingURL=guild-DrMM0xMq.mjs.map
