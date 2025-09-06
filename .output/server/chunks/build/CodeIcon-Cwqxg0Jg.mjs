import { computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { m as defu } from '../nitro/nitro.mjs';
import { d as useAppConfig, i as _sfc_main$y } from './server.mjs';
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
  "package.json": "i-vscode-icons-file-type-node",
  "tsconfig.json": "i-vscode-icons-file-type-tsconfig",
  ".npmrc": "i-vscode-icons-file-type-npm",
  ".editorconfig": "i-vscode-icons-file-type-editorconfig",
  ".eslintrc": "i-vscode-icons-file-type-eslint",
  ".eslintrc.cjs": "i-vscode-icons-file-type-eslint",
  ".eslintignore": "i-vscode-icons-file-type-eslint",
  "eslint.config.js": "i-vscode-icons-file-type-eslint",
  "eslint.config.mjs": "i-vscode-icons-file-type-eslint",
  "eslint.config.cjs": "i-vscode-icons-file-type-eslint",
  ".gitignore": "i-vscode-icons-file-type-git",
  "yarn.lock": "i-vscode-icons-file-type-yarn",
  ".env": "i-vscode-icons-file-type-dotenv",
  ".env.example": "i-vscode-icons-file-type-dotenv",
  ".vscode/settings.json": "i-vscode-icons-file-type-vscode",
  "nuxt": "i-vscode-icons-file-type-nuxt",
  ".nuxtrc": "i-vscode-icons-file-type-nuxt",
  ".nuxtignore": "i-vscode-icons-file-type-nuxt",
  "nuxt.config.js": "i-vscode-icons-file-type-nuxt",
  "nuxt.config.ts": "i-vscode-icons-file-type-nuxt",
  "nuxt.schema.ts": "i-vscode-icons-file-type-nuxt",
  "tailwind.config.js": "i-vscode-icons-file-type-tailwind",
  "tailwind.config.ts": "i-vscode-icons-file-type-tailwind",
  "vue": "i-vscode-icons-file-type-vue",
  "ts": "i-vscode-icons-file-type-typescript",
  "tsx": "i-vscode-icons-file-type-typescript",
  "mjs": "i-vscode-icons-file-type-js",
  "cjs": "i-vscode-icons-file-type-js",
  "js": "i-vscode-icons-file-type-js",
  "jsx": "i-vscode-icons-file-type-js",
  "md": "i-vscode-icons-file-type-markdown",
  "py": "i-vscode-icons-file-type-python",
  "cs": "i-vscode-icons-file-type-csharp",
  "asm": "i-vscode-icons-file-type-assembly",
  "f": "i-vscode-icons-file-type-fortran",
  "hs": "i-vscode-icons-file-type-haskell",
  "fs": "i-vscode-icons-file-type-fsharp",
  "kt": "i-vscode-icons-file-type-kotlin",
  "rs": "i-vscode-icons-file-type-rust",
  "rb": "i-vscode-icons-file-type-ruby",
  "lsp": "i-vscode-icons-file-type-lisp",
  "ps1": "i-vscode-icons-file-type-powershell",
  "psd1": "i-vscode-icons-file-type-powershell",
  "psm1": "i-vscode-icons-file-type-powershell",
  "go": "i-vscode-icons-file-type-go",
  "gleam": "i-vscode-icons-file-type-gleam",
  "bicep": "i-vscode-icons-file-type-bicep",
  "bicepparam": "i-vscode-icons-file-type-bicep",
  "exs": "i-vscode-icons-file-type-elixir",
  "erl": "i-vscode-icons-file-type-erlang",
  "sbt": "i-vscode-icons-file-type-scala",
  "h": "i-vscode-icons-file-type-cppheader",
  "ino": "i-vscode-icons-file-type-arduino",
  "pl": "i-vscode-icons-file-type-perl",
  "jl": "i-vscode-icons-file-type-julia",
  "dart": "i-vscode-icons-file-type-dartlang",
  "ico": "i-vscode-icons-file-type-favicon",
  "npm": "i-vscode-icons-file-type-npm",
  "pnpm": "i-vscode-icons-file-type-pnpm",
  "npx": "i-vscode-icons-file-type-npm",
  "yarn": "i-vscode-icons-file-type-yarn",
  "bun": "i-vscode-icons-file-type-bun",
  "yml": "i-vscode-icons-file-type-yaml",
  "terminal": "i-lucide-terminal"
};
const _sfc_main = {
  __name: "ProseCodeIcon",
  __ssrInlineRender: true,
  props: {
    icon: { type: [String, Object], required: false },
    filename: { type: String, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const icons = computed(() => defu(appConfig.ui?.prose?.codeIcon || {}, theme));
    const icon = computed(() => {
      if (props.icon) {
        return props.icon;
      }
      if (!props.filename) {
        return;
      }
      const cleanFilename = props.filename.replace(/\s*\(.*\)\s*$/, "");
      const extension = cleanFilename.includes(".") && cleanFilename.split(".").pop();
      const name = cleanFilename.split("/").pop();
      return (name && icons.value[name.toLowerCase()]) ?? (extension && (icons.value[extension] ?? `i-vscode-icons-file-type-${extension}`));
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (icon.value) {
        _push(ssrRenderComponent(_sfc_main$y, mergeProps({ name: icon.value }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=CodeIcon-Cwqxg0Jg.mjs.map
