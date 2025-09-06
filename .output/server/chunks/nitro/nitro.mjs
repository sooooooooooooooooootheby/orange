import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync, mkdirSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { consola } from 'consola';
import Database from 'better-sqlite3';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
const appendHeader = appendResponseHeader;
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const defineAppConfig = (config) => config;

const appConfig0 = defineAppConfig({
  route: [
    {
      label: "\u670D\u52A1\u5668\u6307\u5317",
      to: "/docs"
    }
  ],
  navigation: [
    {
      title: "\u5173\u4E8E\u6211\u4EEC",
      icon: "gravity-ui:heart",
      path: "/docs"
    },
    {
      title: "\u52A0\u5165\u6211\u4EEC",
      icon: "gravity-ui:plug-connection",
      path: "/docs/join"
    },
    {
      title: "\u73A9\u6CD5\u6307\u5357",
      icon: "gravity-ui:shapes-3",
      path: "/docs/play"
    },
    {
      title: "\u7279\u8272\u73A9\u6CD5",
      icon: "gravity-ui:magic-wand",
      path: "/docs/playing"
    },
    {
      title: "\u516C\u4F1A",
      icon: "gravity-ui:persons",
      path: "/docs/guild"
    },
    {
      title: "\u7BA1\u7406\u7EC4",
      icon: "gravity-ui:thunderbolt",
      path: "/docs/admin"
    },
    {
      title: "\u670D\u52A1\u5668\u65E5\u5FD7",
      icon: "gravity-ui:file",
      path: "/docs/log"
    },
    {
      title: "\u73A9\u6CD5\u5B88\u5219",
      icon: "gravity-ui:pencil",
      children: [
        {
          title: "\u4EA4\u6D41\u5B88\u5219",
          path: "/docs/playrule/chat"
        },
        {
          title: "\u6E38\u73A9\u5B88\u5219",
          path: "/docs/playrule/play"
        }
      ]
    },
    {
      title: "\u547D\u4EE4\u5927\u5168",
      icon: "gravity-ui:terminal",
      children: [
        {
          title: "\u57FA\u7840\u6307\u4EE4",
          path: "/docs/command/base"
        },
        {
          title: "\u4F20\u9001 & \u5BB6",
          path: "/docs/command/transfer"
        },
        {
          title: "\u9886\u5730",
          path: "/docs/command/territory"
        },
        {
          title: "\u5168\u670D\u97F3\u4E50",
          path: "/docs/command/allmusic"
        }
      ]
    }
  ],
  admin: {
    fz: {
      name: "ChengPro",
      role: "\u6A59\u670D\u8150\u7AF9"
    },
    admin: [
      {
        name: "AliceIClodia",
        role: "\u6A59\u670D\u6280\u672F\u7BA1\u7406"
      },
      {
        name: "MinaFireVine",
        role: "\u6A59\u670D\u6280\u672F\u7BA1\u7406"
      },
      {
        name: "Ming_XiaoYu",
        role: "\u6A59\u670D\u6280\u672F\u7BA1\u7406"
      },
      {
        name: "lesfor",
        role: "\u6A59\u670D\u6280\u672F\u7BA1\u7406"
      },
      {
        name: "NicekillersCN",
        role: "\u6A59\u670D\u6280\u672F\u7BA1\u7406"
      }
    ],
    lowadmin: [
      {
        name: "Th_Long",
        role: "\u6A59\u670D\u7EF4\u62A4\u7BA1\u7406"
      },
      {
        name: "NAKANO666",
        role: "\u6A59\u670D\u7EF4\u62A4\u7BA1\u7406"
      },
      {
        name: "kunkun22678",
        role: "\u6A59\u670D\u7EF4\u62A4\u7BA1\u7406"
      },
      {
        name: "mantou_ya",
        role: "\u6A59\u670D\u7EF4\u62A4\u7BA1\u7406"
      }
    ]
  },
  ui: {
    mdc: true,
    colors: {
      primary: "amber",
      neutral: "slate"
    },
    navigationMenu: {
      slots: {
        link: "py-2"
      }
    },
    contentNavigation: {
      slots: {
        list: "mx-0",
        link: "py-2"
      }
    },
    pageAside: {
      slots: {
        root: "md:max-w-xl"
      }
    },
    contentToc: {
      slots: {
        root: "px-0",
        container: "px-4",
        trigger: "py-0"
      }
    },
    pageHeader: {
      slots: {
        root: "py-0"
      }
    },
    prose: {
      steps: {
        variants: {
          level: {
            "4": "[&>h4]:before:size-4 [&>h4]:before:-ms-[42.5px] [&>h4]:before:mt-[5px] [&>h4]:before:content-['']"
          }
        }
      }
    },
    banner: {
      slots: {
        container: "h-8"
      }
    },
    toast: {
      slots: {
        root: "max-md:hidden"
      }
    }
  }
});

const inlineAppConfig = {
  "nuxt": {},
  "ui": {
    "colors": {
      "primary": "green",
      "secondary": "blue",
      "success": "green",
      "info": "blue",
      "warning": "yellow",
      "error": "red",
      "neutral": "slate"
    },
    "icons": {
      "arrowDown": "i-lucide-arrow-down",
      "arrowLeft": "i-lucide-arrow-left",
      "arrowRight": "i-lucide-arrow-right",
      "arrowUp": "i-lucide-arrow-up",
      "caution": "i-lucide-circle-alert",
      "check": "i-lucide-check",
      "chevronDoubleLeft": "i-lucide-chevrons-left",
      "chevronDoubleRight": "i-lucide-chevrons-right",
      "chevronDown": "i-lucide-chevron-down",
      "chevronLeft": "i-lucide-chevron-left",
      "chevronRight": "i-lucide-chevron-right",
      "chevronUp": "i-lucide-chevron-up",
      "close": "i-lucide-x",
      "copy": "i-lucide-copy",
      "copyCheck": "i-lucide-copy-check",
      "dark": "i-lucide-moon",
      "ellipsis": "i-lucide-ellipsis",
      "error": "i-lucide-circle-x",
      "external": "i-lucide-arrow-up-right",
      "eye": "i-lucide-eye",
      "eyeOff": "i-lucide-eye-off",
      "file": "i-lucide-file",
      "folder": "i-lucide-folder",
      "folderOpen": "i-lucide-folder-open",
      "hash": "i-lucide-hash",
      "info": "i-lucide-info",
      "light": "i-lucide-sun",
      "loading": "i-lucide-loader-circle",
      "menu": "i-lucide-menu",
      "minus": "i-lucide-minus",
      "panelClose": "i-lucide-panel-left-close",
      "panelOpen": "i-lucide-panel-left-open",
      "plus": "i-lucide-plus",
      "reload": "i-lucide-rotate-ccw",
      "search": "i-lucide-search",
      "stop": "i-lucide-square",
      "success": "i-lucide-circle-check",
      "system": "i-lucide-monitor",
      "tip": "i-lucide-lightbulb",
      "upload": "i-lucide-upload",
      "warning": "i-lucide-triangle-alert"
    }
  },
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "cssLayer": "components",
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "dashicons",
      "devicon",
      "devicon-plain",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fad",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "logos",
      "ls",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "pixelarticons",
      "prime",
      "ps",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "si-glyph",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "streamline",
      "streamline-emojis",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};

const appConfig = defuFn(appConfig0, inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(opts?.normalize ? p.toLowerCase() : p)).join("") : "";
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ?? "-") : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "5ff467cd-85f6-48c5-b99f-4b3d59546279",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__nuxt_content/**": {
        "robots": false
      },
      "/__nuxt_content/docs/sql_dump.txt": {
        "prerender": true
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_fonts/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "content": {
      "wsUrl": ""
    },
    "mdc": {
      "components": {
        "prose": true,
        "map": {
          "accordion": "ProseAccordion",
          "accordion-item": "ProseAccordionItem",
          "badge": "ProseBadge",
          "callout": "ProseCallout",
          "card": "ProseCard",
          "card-group": "ProseCardGroup",
          "caution": "ProseCaution",
          "code-collapse": "ProseCodeCollapse",
          "code-group": "ProseCodeGroup",
          "code-icon": "ProseCodeIcon",
          "code-preview": "ProseCodePreview",
          "code-tree": "ProseCodeTree",
          "collapsible": "ProseCollapsible",
          "field": "ProseField",
          "field-group": "ProseFieldGroup",
          "icon": "ProseIcon",
          "kbd": "ProseKbd",
          "note": "ProseNote",
          "steps": "ProseSteps",
          "tabs": "ProseTabs",
          "tabs-item": "ProseTabsItem",
          "tip": "ProseTip",
          "warning": "ProseWarning"
        }
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    },
    "preview": {
      "api": "https://api.nuxt.studio",
      "iframeMessagingAllowedOrigins": ""
    }
  },
  "content": {
    "databaseVersion": "v3.5.0",
    "version": "3.6.3",
    "database": {
      "type": "sqlite",
      "filename": "./contents.sqlite"
    },
    "localDatabase": {
      "type": "sqlite",
      "filename": "/Users/aliceclodia/Desktop/orange/.data/content/contents.sqlite"
    },
    "integrityCheck": true
  },
  "icon": {
    "serverKnownCssClasses": []
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = "\"use strict\";(()=>{const t=window,e=document.documentElement,c=[\"dark\",\"light\"],n=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let i=n===\"system\"?u():n;const r=e.getAttribute(\"data-color-mode-forced\");r&&(i=r),l(i),t[\"__NUXT_COLOR_MODE__\"]={preference:n,value:i,getColorScheme:u,addColorScheme:l,removeColorScheme:d};function l(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.add(s):e.className+=\" \"+s,a&&e.setAttribute(\"data-\"+a,o)}function d(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.remove(s):e.className=e.className.replace(new RegExp(s,\"g\"),\"\"),a&&e.removeAttribute(\"data-\"+a)}function f(o){return t.matchMedia(\"(prefers-color-scheme\"+o+\")\")}function u(){if(t.matchMedia&&f(\"\").media!==\"not all\"){for(const o of c)if(f(\":\"+o).matches)return o}return\"light\"}})();function getStorageValue(t,e){switch(t){case\"localStorage\":return window.localStorage.getItem(e);case\"sessionStorage\":return window.sessionStorage.getItem(e);case\"cookie\":return getCookie(e);default:return null}}function getCookie(t){const c=(\"; \"+window.document.cookie).split(\"; \"+t+\"=\");if(c.length===2)return c.pop()?.split(\";\").shift()}";

const _Vs2snmX6FeFpz7aIHipNTj7wUOeUPL7D7GtQjJYD32Q = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const plugins = [
  _Vs2snmX6FeFpz7aIHipNTj7wUOeUPL7D7GtQjJYD32Q
];

const assets = {
  "/.DS_Store": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1804-3y++sUAKzaCQmjLBz2v0kvESHgc\"",
    "mtime": "2025-09-06T09:15:36.705Z",
    "size": 6148,
    "path": "../public/.DS_Store"
  },
  "/__preview.json": {
    "type": "application/json",
    "etag": "\"119f5-bNrY30oNcED5V9P/gXWVhplR4NA\"",
    "mtime": "2025-09-06T09:15:36.441Z",
    "size": 72181,
    "path": "../public/__preview.json"
  },
  "/orange.webp": {
    "type": "image/webp",
    "etag": "\"5072-NPkZKF3m3K39wWCC/DFyidHwuW0\"",
    "mtime": "2025-09-06T09:15:36.706Z",
    "size": 20594,
    "path": "../public/orange.webp"
  },
  "/_nuxt/1leCkmzE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15d-oWqWSQH3BzFDJC7qXrYiaYTbzr8\"",
    "mtime": "2025-09-06T09:15:36.634Z",
    "size": 349,
    "path": "../public/_nuxt/1leCkmzE.js"
  },
  "/_nuxt/2Ipsefta.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cc5-cg3fmED08IRT+d5gge2DE3RgVRY\"",
    "mtime": "2025-09-06T09:15:36.634Z",
    "size": 3269,
    "path": "../public/_nuxt/2Ipsefta.js"
  },
  "/_nuxt/3b2z2C9C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9c5-+RfHdisvp03IkxCncST/FKBHcBw\"",
    "mtime": "2025-09-06T09:15:36.635Z",
    "size": 2501,
    "path": "../public/_nuxt/3b2z2C9C.js"
  },
  "/_nuxt/B5ZhuSdD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a65-6xkJ+U4/WMLCUPuF9Kvz4z0wAG0\"",
    "mtime": "2025-09-06T09:15:36.636Z",
    "size": 2661,
    "path": "../public/_nuxt/B5ZhuSdD.js"
  },
  "/_nuxt/BA9cp8jR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dbc8-yKccTWMIDkvZKBzVAzptmmi+7Ok\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 56264,
    "path": "../public/_nuxt/BA9cp8jR.js"
  },
  "/_nuxt/BAoqpo9W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ac-+J2TZlam8J4Wa+E+1MQiFFChSHk\"",
    "mtime": "2025-09-06T09:15:36.637Z",
    "size": 428,
    "path": "../public/_nuxt/BAoqpo9W.js"
  },
  "/_nuxt/BCw3_xgn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"374-uhlAeaX9+vRlznAXSAm7Qjm5AQg\"",
    "mtime": "2025-09-06T09:15:36.637Z",
    "size": 884,
    "path": "../public/_nuxt/BCw3_xgn.js"
  },
  "/_nuxt/BKTCo8zB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"773-aMc1q8yOMy/aef77j3BZ4F8IHmA\"",
    "mtime": "2025-09-06T09:15:36.637Z",
    "size": 1907,
    "path": "../public/_nuxt/BKTCo8zB.js"
  },
  "/_nuxt/BLy7B7sH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"187-SFdrGjn+r4JmfRMC4STr3mg4Zv8\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 391,
    "path": "../public/_nuxt/BLy7B7sH.js"
  },
  "/_nuxt/BMHl9QLG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"207-SkqSzupbCWW8O0OW1SW5CJkB/j8\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 519,
    "path": "../public/_nuxt/BMHl9QLG.js"
  },
  "/_nuxt/BN_7HF1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"441-ZV8sW3gOP/trsjwfLG+C3bIiqms\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 1089,
    "path": "../public/_nuxt/BN_7HF1G.js"
  },
  "/_nuxt/BNvE4eg4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"223-Rhn+jqKYqgw0TDcGirINRTWxu6o\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 547,
    "path": "../public/_nuxt/BNvE4eg4.js"
  },
  "/_nuxt/BOdPqOZA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14f-c4ijlT7Oc6MN5CwW+xvInr+exBI\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 335,
    "path": "../public/_nuxt/BOdPqOZA.js"
  },
  "/_nuxt/BPfN6RDP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e9-g/BDm3kmDnrPcTNUzKxdpJDy3Vk\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 489,
    "path": "../public/_nuxt/BPfN6RDP.js"
  },
  "/_nuxt/BT9cM-Ws.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53e-iTy/RzGlDQw934ttmCARXOCm1S8\"",
    "mtime": "2025-09-06T09:15:36.638Z",
    "size": 1342,
    "path": "../public/_nuxt/BT9cM-Ws.js"
  },
  "/_nuxt/B_LrW1FW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d0-daX10OT9USZ9ghtnbtrX7uUD1kA\"",
    "mtime": "2025-09-06T09:15:36.639Z",
    "size": 976,
    "path": "../public/_nuxt/B_LrW1FW.js"
  },
  "/_nuxt/BerOB6y0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"238b-kQrCSC+dFsk9OHdtqzTCDhT8c8s\"",
    "mtime": "2025-09-06T09:15:36.639Z",
    "size": 9099,
    "path": "../public/_nuxt/BerOB6y0.js"
  },
  "/_nuxt/BfB7k7lW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"66c-X+NlpuEFMQN7BcyMFque3BY3tao\"",
    "mtime": "2025-09-06T09:15:36.639Z",
    "size": 1644,
    "path": "../public/_nuxt/BfB7k7lW.js"
  },
  "/_nuxt/BwOL44aZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"220-yEMyaP+CBUVwtQsRobhjRbKLhGU\"",
    "mtime": "2025-09-06T09:15:36.639Z",
    "size": 544,
    "path": "../public/_nuxt/BwOL44aZ.js"
  },
  "/_nuxt/BytKEO6e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1070-T3qZ9RZSfh1qC11WoK37IdjU+Rw\"",
    "mtime": "2025-09-06T09:15:36.640Z",
    "size": 4208,
    "path": "../public/_nuxt/BytKEO6e.js"
  },
  "/_nuxt/C4uBaP7b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eb-jC0CFZnyT5gXdWMINkTsl0txtSM\"",
    "mtime": "2025-09-06T09:15:36.640Z",
    "size": 491,
    "path": "../public/_nuxt/C4uBaP7b.js"
  },
  "/_nuxt/C6m4BW0z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15c-HKkokSC2LzpnEFHq/C6M+JbdK1E\"",
    "mtime": "2025-09-06T09:15:36.640Z",
    "size": 348,
    "path": "../public/_nuxt/C6m4BW0z.js"
  },
  "/_nuxt/C7meHgrJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b6-D81upNirL0A//b5jgYLbhTM2vMU\"",
    "mtime": "2025-09-06T09:15:36.640Z",
    "size": 694,
    "path": "../public/_nuxt/C7meHgrJ.js"
  },
  "/_nuxt/CAAnxjwJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e9-FILmOYeCd700/MCLD5bB8bRkx1c\"",
    "mtime": "2025-09-06T09:15:36.640Z",
    "size": 489,
    "path": "../public/_nuxt/CAAnxjwJ.js"
  },
  "/_nuxt/CCFxBth2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30c4e-Z1FTzGKfTg9A92wZZ/qJkIK9rlc\"",
    "mtime": "2025-09-06T09:15:36.643Z",
    "size": 199758,
    "path": "../public/_nuxt/CCFxBth2.js"
  },
  "/_nuxt/CEsBzu39.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"155-lahLbVDlOo4wnlv29hND6XwxeW0\"",
    "mtime": "2025-09-06T09:15:36.641Z",
    "size": 341,
    "path": "../public/_nuxt/CEsBzu39.js"
  },
  "/_nuxt/CG0l_jlT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15d-LQCsVb57hX8YkxNZAYOWMQCHIeQ\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 349,
    "path": "../public/_nuxt/CG0l_jlT.js"
  },
  "/_nuxt/CJbyh2XP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b599-7oS6HdA9UIjC8nCBDoCkGlzZIso\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 46489,
    "path": "../public/_nuxt/CJbyh2XP.js"
  },
  "/_nuxt/CLvJhkVE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e4-EqJhlsoqD9WTepnbw6yJc8qTN0o\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 484,
    "path": "../public/_nuxt/CLvJhkVE.js"
  },
  "/_nuxt/CNsBY1gs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"165-hCmRkB5arKFA47Ep98vLXX/2Ixs\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 357,
    "path": "../public/_nuxt/CNsBY1gs.js"
  },
  "/_nuxt/CPCYZ9AK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b8-vMs+tAHT6TixAJQjfY1ODo/qgXM\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 1464,
    "path": "../public/_nuxt/CPCYZ9AK.js"
  },
  "/_nuxt/CYEOlE_a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"135b-Z1FCSfLG35ksrRA4buHZnXDHF9c\"",
    "mtime": "2025-09-06T09:15:36.642Z",
    "size": 4955,
    "path": "../public/_nuxt/CYEOlE_a.js"
  },
  "/_nuxt/CcUZ3upa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fb-6fVEZ9wPaKQcrVhkFs+heniEndI\"",
    "mtime": "2025-09-06T09:15:36.643Z",
    "size": 507,
    "path": "../public/_nuxt/CcUZ3upa.js"
  },
  "/_nuxt/Cgkraxui.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"97dbf-uep4E/G7Lx/znaqA8WSIL7cVd1o\"",
    "mtime": "2025-09-06T09:15:36.651Z",
    "size": 622015,
    "path": "../public/_nuxt/Cgkraxui.js"
  },
  "/_nuxt/CivtgwFP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18a-nTe30rbnbljUqPPxYlIdN9sWMJY\"",
    "mtime": "2025-09-06T09:15:36.644Z",
    "size": 394,
    "path": "../public/_nuxt/CivtgwFP.js"
  },
  "/_nuxt/CqDpZM45.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"320-9MZfEU20cKFWW2xsMH3k/TOuG24\"",
    "mtime": "2025-09-06T09:15:36.644Z",
    "size": 800,
    "path": "../public/_nuxt/CqDpZM45.js"
  },
  "/_nuxt/D24z8WIq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"174-U4FguS8uwWEpYID6nMNUWD68w2Q\"",
    "mtime": "2025-09-06T09:15:36.646Z",
    "size": 372,
    "path": "../public/_nuxt/D24z8WIq.js"
  },
  "/_nuxt/D26O38v4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbe-TN8Ks0fvtmRV6nz9KibmVlVx2ic\"",
    "mtime": "2025-09-06T09:15:36.645Z",
    "size": 3262,
    "path": "../public/_nuxt/D26O38v4.js"
  },
  "/_nuxt/D7H8lyQx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"158-0i4pMCHVFCL+qS2dC/xqPLAmAkk\"",
    "mtime": "2025-09-06T09:15:36.645Z",
    "size": 344,
    "path": "../public/_nuxt/D7H8lyQx.js"
  },
  "/_nuxt/D8OINYQm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"78e-ZAjWpVwJK7CP4BD2/eWmVWiHfGw\"",
    "mtime": "2025-09-06T09:15:36.648Z",
    "size": 1934,
    "path": "../public/_nuxt/D8OINYQm.js"
  },
  "/_nuxt/DBK8bY6B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16f-a/MRNzvspKVLpjc5d/aEPZUlUNo\"",
    "mtime": "2025-09-06T09:15:36.646Z",
    "size": 367,
    "path": "../public/_nuxt/DBK8bY6B.js"
  },
  "/_nuxt/DE94BRSp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d89-QtBmTPsa9XaL/dX729nb7++KA7U\"",
    "mtime": "2025-09-06T09:15:36.650Z",
    "size": 3465,
    "path": "../public/_nuxt/DE94BRSp.js"
  },
  "/_nuxt/DEdaP0ZL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1189-s73SrXzxQitUYAr4TbnJ45egiqo\"",
    "mtime": "2025-09-06T09:15:36.650Z",
    "size": 4489,
    "path": "../public/_nuxt/DEdaP0ZL.js"
  },
  "/_nuxt/DHDxfvwx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18c-ok86oQ58Qjn9r8440n1L0XZ2RQ0\"",
    "mtime": "2025-09-06T09:15:36.648Z",
    "size": 396,
    "path": "../public/_nuxt/DHDxfvwx.js"
  },
  "/_nuxt/DIUOg-2s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"190-883nrypsT/hteO2wZv5GKnCNHRo\"",
    "mtime": "2025-09-06T09:15:36.650Z",
    "size": 400,
    "path": "../public/_nuxt/DIUOg-2s.js"
  },
  "/_nuxt/DLsaCe93.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"677-JWN0dFkc/eAxsJZkAGbXno3dNS0\"",
    "mtime": "2025-09-06T09:15:36.651Z",
    "size": 1655,
    "path": "../public/_nuxt/DLsaCe93.js"
  },
  "/_nuxt/DN9-a0xT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ff1e-osUl3Yr5YgBEE/iFHo2Zo7ecib8\"",
    "mtime": "2025-09-06T09:15:36.652Z",
    "size": 130846,
    "path": "../public/_nuxt/DN9-a0xT.js"
  },
  "/_nuxt/DNuhBGWu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"766-CMglDKV4ijonR2Np0yaJ04B37K4\"",
    "mtime": "2025-09-06T09:15:36.651Z",
    "size": 1894,
    "path": "../public/_nuxt/DNuhBGWu.js"
  },
  "/_nuxt/DSHKVP65.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cf-PaTO8kNJ0ocYc0wvn+tYG89Jk6o\"",
    "mtime": "2025-09-06T09:15:36.652Z",
    "size": 719,
    "path": "../public/_nuxt/DSHKVP65.js"
  },
  "/_nuxt/DdN4STDl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5c-FxAbpgYmrbatHluIWkT2dvmZeL4\"",
    "mtime": "2025-09-06T09:15:36.653Z",
    "size": 2908,
    "path": "../public/_nuxt/DdN4STDl.js"
  },
  "/_nuxt/DopwGuqa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df2-cbvP8q8sBV9xmAWAmfNwMYH+jMg\"",
    "mtime": "2025-09-06T09:15:36.654Z",
    "size": 3570,
    "path": "../public/_nuxt/DopwGuqa.js"
  },
  "/_nuxt/DrliNvdW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163-zHKhQJ0yu0kqb94caJEuk87BsT0\"",
    "mtime": "2025-09-06T09:15:36.653Z",
    "size": 355,
    "path": "../public/_nuxt/DrliNvdW.js"
  },
  "/_nuxt/Dzmg0ApI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"337-h9dLxOJuddSDC7cB82sX81Ueb2I\"",
    "mtime": "2025-09-06T09:15:36.653Z",
    "size": 823,
    "path": "../public/_nuxt/Dzmg0ApI.js"
  },
  "/_nuxt/Hxu96EFX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e95-eBGIoYndPN3mKGflC4Tx359iQyc\"",
    "mtime": "2025-09-06T09:15:36.654Z",
    "size": 11925,
    "path": "../public/_nuxt/Hxu96EFX.js"
  },
  "/_nuxt/Pre.CZqP8-6E.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"154-qJ6jkVReTJfGC2ql7x8/9qtV/cU\"",
    "mtime": "2025-09-06T09:15:36.654Z",
    "size": 340,
    "path": "../public/_nuxt/Pre.CZqP8-6E.css"
  },
  "/_nuxt/Qy_efZ7O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eac-02dXEtjtQZKDotM0pj6JTV/liVI\"",
    "mtime": "2025-09-06T09:15:36.655Z",
    "size": 3756,
    "path": "../public/_nuxt/Qy_efZ7O.js"
  },
  "/_nuxt/S3ULXllN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b8-KqPNPUr5MKsqhANzKAAppC66/Nw\"",
    "mtime": "2025-09-06T09:15:36.654Z",
    "size": 1464,
    "path": "../public/_nuxt/S3ULXllN.js"
  },
  "/_nuxt/entry.Dwbaunzq.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2cc98-/Hqs6rW0Vn6V/kyvNXf9alvx9eE\"",
    "mtime": "2025-09-06T09:15:36.657Z",
    "size": 183448,
    "path": "../public/_nuxt/entry.Dwbaunzq.css"
  },
  "/_nuxt/error-404.Bb_V_yz0.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"980-O3rOMAAz6eEgCdXn8B8nJJ8fnNk\"",
    "mtime": "2025-09-06T09:15:36.655Z",
    "size": 2432,
    "path": "../public/_nuxt/error-404.Bb_V_yz0.css"
  },
  "/_nuxt/error-500.DkjcnwdS.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"775-EqyM307anrGOidjNW9xyxhXKx5U\"",
    "mtime": "2025-09-06T09:15:36.656Z",
    "size": 1909,
    "path": "../public/_nuxt/error-500.DkjcnwdS.css"
  },
  "/_nuxt/fb2IRLCJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"163-8x+C8a6oxurhp0RWUD9BDVvcLoQ\"",
    "mtime": "2025-09-06T09:15:36.655Z",
    "size": 355,
    "path": "../public/_nuxt/fb2IRLCJ.js"
  },
  "/_nuxt/iQDAArL-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35b-c7y/amcaP5GMK2yuj6Tmh6dU9As\"",
    "mtime": "2025-09-06T09:15:36.655Z",
    "size": 859,
    "path": "../public/_nuxt/iQDAArL-.js"
  },
  "/_nuxt/igkif5rQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ed-5Gx7TXZIdAeJxMhZsxo72dV2wp8\"",
    "mtime": "2025-09-06T09:15:36.656Z",
    "size": 493,
    "path": "../public/_nuxt/igkif5rQ.js"
  },
  "/_nuxt/index.Dm3XHkf6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d9a-177QG7ZjT5HfR5+40aj3zQ20VIo\"",
    "mtime": "2025-09-06T09:15:36.656Z",
    "size": 3482,
    "path": "../public/_nuxt/index.Dm3XHkf6.css"
  },
  "/_nuxt/j843apyr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a4ec-8K/CNz/3LNTu96mWxfVIeMmeJQ8\"",
    "mtime": "2025-09-06T09:15:36.657Z",
    "size": 42220,
    "path": "../public/_nuxt/j843apyr.js"
  },
  "/_nuxt/kNtJjcZQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1988-1Rc/uE1f7tt90yyGg6wXic/Oyo0\"",
    "mtime": "2025-09-06T09:15:36.657Z",
    "size": 6536,
    "path": "../public/_nuxt/kNtJjcZQ.js"
  },
  "/_nuxt/pcZLHouG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"136a-1rm0+AY9b9FoHUbYyD7959hFU84\"",
    "mtime": "2025-09-06T09:15:36.657Z",
    "size": 4970,
    "path": "../public/_nuxt/pcZLHouG.js"
  },
  "/_nuxt/ryhxGYxS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9d5e-0PLT0eZOCPaZ7HYd7VKDxnhA90Y\"",
    "mtime": "2025-09-06T09:15:36.658Z",
    "size": 40286,
    "path": "../public/_nuxt/ryhxGYxS.js"
  },
  "/_nuxt/sqlite3-Ubkxdgq9.wasm": {
    "type": "application/wasm",
    "etag": "\"d0fdc-5aKaKmmJfcV2FnoKyrujK7QY7n8\"",
    "mtime": "2025-09-06T09:15:36.664Z",
    "size": 856028,
    "path": "../public/_nuxt/sqlite3-Ubkxdgq9.wasm"
  },
  "/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24eb-/FBLK7guMdffqRNvJNbJgk4Zwss\"",
    "mtime": "2025-09-06T09:15:36.658Z",
    "size": 9451,
    "path": "../public/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js"
  },
  "/_nuxt/sqlite3-worker1-bundler-friendly-CtVng1jz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30103-BpAdfbsXS8iy9nzg8F+bM4HznD4\"",
    "mtime": "2025-09-06T09:15:36.659Z",
    "size": 196867,
    "path": "../public/_nuxt/sqlite3-worker1-bundler-friendly-CtVng1jz.js"
  },
  "/_nuxt/sqlite3.Ubkxdgq9.wasm": {
    "type": "application/wasm",
    "etag": "\"d0fdc-5aKaKmmJfcV2FnoKyrujK7QY7n8\"",
    "mtime": "2025-09-06T09:15:36.666Z",
    "size": 856028,
    "path": "../public/_nuxt/sqlite3.Ubkxdgq9.wasm"
  },
  "/_nuxt/tUncucgd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"182-3RjrDdLw5ec32nai1a4L9atNvGk\"",
    "mtime": "2025-09-06T09:15:36.659Z",
    "size": 386,
    "path": "../public/_nuxt/tUncucgd.js"
  },
  "/_nuxt/un7OhwNQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d4-pvA/povJ3udQxpOsghjnUUbixgU\"",
    "mtime": "2025-09-06T09:15:36.659Z",
    "size": 468,
    "path": "../public/_nuxt/un7OhwNQ.js"
  },
  "/_nuxt/wykIshKu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14e-DwPTHKgpkzcB0rp3160vxK/R7Wg\"",
    "mtime": "2025-09-06T09:15:36.662Z",
    "size": 334,
    "path": "../public/_nuxt/wykIshKu.js"
  },
  "/_nuxt/xl_p-bc5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b3-DJKxSrWcbQxTYhSSYcqfjAZ5YTk\"",
    "mtime": "2025-09-06T09:15:36.659Z",
    "size": 179,
    "path": "../public/_nuxt/xl_p-bc5.js"
  },
  "/__nuxt_content/docs/sql_dump.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"49cc-8qQVHFp5udlyQLSdKbnP/Ylku0Q\"",
    "mtime": "2025-09-06T09:15:36.442Z",
    "size": 18892,
    "path": "../public/__nuxt_content/docs/sql_dump.txt"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-w2FAvR05a3mbOsp3Nua9Ez1e4SA\"",
    "mtime": "2025-09-06T09:15:36.545Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/5ff467cd-85f6-48c5-b99f-4b3d59546279.json": {
    "type": "application/json",
    "etag": "\"c1-OsqnOm4/RtldoPLW1FvA1Wy0z/g\"",
    "mtime": "2025-09-06T09:15:36.539Z",
    "size": 193,
    "path": "../public/_nuxt/builds/meta/5ff467cd-85f6-48c5-b99f-4b3d59546279.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_fonts/":{"maxAge":31536000},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _tpJizR = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
  return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const checksums = {
  "docs": "v3.5.0--lwfmphKAWU6WxLdNO4S3Wavq2Fvb1_GD8oTNNC5BX_I"
};
const checksumsStructure = {
  "docs": "uo_cDLiYF2TEt8LuANGqAtub1Vw3XDsPfboL-_jZNtc"
};

const tables = {
  "docs": "_content_docs",
  "info": "_content_info"
};

const contentManifest = {
  "docs": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "icon": "string",
      "isToc": "boolean",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
};

async function fetchDatabase(event, collection) {
  return await $fetch(`/__nuxt_content/${collection}/sql_dump.txt`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    responseType: "text",
    headers: {
      "content-type": "text/plain",
      ...event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 }
  });
}

const collections$1 = {
  'lucide': () => import('../_/icons.mjs').then(m => m.default),
  'simple-icons': () => import('../_/icons2.mjs').then(m => m.default),
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _krKDJc = defineCachedEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url)
    return createError$1({ status: 400, message: "Invalid icon request" });
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName ? await collections$1[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = url.searchParams.get("icons")?.split(",");
  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons
      );
      consola.debug(`[Icon] serving ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
      return data;
    }
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL("./" + basename(url.pathname) + url.search, apiEndPoint);
    consola.debug(`[Icon] fetching ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(getQuery(event).icons || "");
    return `${collection}_${icons.split(",")[0]}_${icons.length}_${hash$1(icons)}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const components = {
  "Admin": {
    "mode": "all",
    "prefetch": false,
    "preload": false,
    "filePath": "app/components/content/admin.vue",
    "pascalName": "Admin",
    "kebabName": "admin",
    "chunkName": "components/admin",
    "priority": 1,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": [],
      "hash": "Oe3ttTcVbm_JsrZdsOQdymTA4IAdhJxrqk6myzbDDXM"
    }
  },
  "Guild": {
    "mode": "all",
    "prefetch": false,
    "preload": false,
    "filePath": "app/components/content/guild.vue",
    "pascalName": "Guild",
    "kebabName": "guild",
    "chunkName": "components/guild",
    "priority": 1,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": [],
      "hash": "FsMTZstPxDc-ILC5IMnsfqGaN7uweH0yj9D46yLgXQE"
    }
  },
  "ProseA": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/A.vue",
    "pascalName": "ProseA",
    "kebabName": "prose-a",
    "chunkName": "components/prose-a",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "href",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseASlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseASlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "href",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\""
            }
          }
        }
      ],
      "hash": "KPOW7Gy6FhkT56oY5keSrDersdhMF9SxvV73-YDVfNw"
    }
  },
  "ProseAccordion": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.vue",
    "pascalName": "ProseAccordion",
    "kebabName": "prose-accordion",
    "chunkName": "components/prose-accordion",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "type",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"single\" | \"multiple\"",
          "schema": {
            "kind": "enum",
            "type": "\"single\" | \"multiple\"",
            "schema": {
              "0": "\"single\"",
              "1": "\"multiple\""
            }
          },
          "default": "\"multiple\""
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseAccordionSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseAccordionSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "type",
          "type": "\"single\" | \"multiple\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"single\" | \"multiple\"",
            "schema": {
              "0": "\"single\"",
              "1": "\"multiple\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "G8O8x7Hz574KmOeGlMaKEYi8lbv3HrO8j5cMQ8EqJTI"
    }
  },
  "ProseAccordionItem": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/AccordionItem.vue",
    "pascalName": "ProseAccordionItem",
    "kebabName": "prose-accordion-item",
    "chunkName": "components/prose-accordion-item",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "label",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseAccordionItemSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseAccordionItemSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "label",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "JfaoJdQIOHmbP6z8RvBACYm5hQDf05a6xXnCSKpwYIs"
    }
  },
  "ProseBadge": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Badge.vue",
    "pascalName": "ProseBadge",
    "kebabName": "prose-badge",
    "chunkName": "components/prose-badge",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseBadgeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseBadgeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "O3dUCwudxHPcP_HcdAjwF-ILBLjMYOi8Pd08LUDolv0"
    }
  },
  "ProseBlockquote": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Blockquote.vue",
    "pascalName": "ProseBlockquote",
    "kebabName": "prose-blockquote",
    "chunkName": "components/prose-blockquote",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseBlockquoteSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseBlockquoteSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "nhVrAsBjVouK3Pors5xD6zm7lz5h_HIx5s5qycCZ3GM"
    }
  },
  "ProseCallout": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Callout.vue",
    "pascalName": "ProseCallout",
    "kebabName": "prose-callout",
    "chunkName": "components/prose-callout",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "to",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'neutral'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCalloutSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCalloutSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "to",
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "color",
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "hash": "dLOH9I0wLFGmKC0DudQaMwjnGTe9pN5kcbtD6ZOBy-w"
    }
  },
  "ProseCard": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Card.vue",
    "pascalName": "ProseCard",
    "kebabName": "prose-card",
    "chunkName": "components/prose-card",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "to",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "title",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'primary'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "title",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCardSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCardSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              },
              "title": {
                "name": "title",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "to",
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\r\nNote this will also add a new entry to the history unless `replace: true`\r\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\r\nvalues and some primitives like Symbols are forbidden. More info at\r\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "color",
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }"
        },
        {
          "name": "title",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "ZS5T5r_Hy4ZE0UrAQPgcAyS2x_JX6Ef1TIavlLdYQ14"
    }
  },
  "ProseCardGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CardGroup.vue",
    "pascalName": "ProseCardGroup",
    "kebabName": "prose-card-group",
    "chunkName": "components/prose-card-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCardGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCardGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "Vu37t9XRJp-MQlYRO9CvQ9-rjUYgNl49GVAv-POVKNc"
    }
  },
  "ProseCode": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Code.vue",
    "pascalName": "ProseCode",
    "kebabName": "prose-code",
    "chunkName": "components/prose-code",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "lang",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'neutral'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "color",
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "lang",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "AO-kaJAhPzPua70o4gFUqZ8licdJxebfee8gnUgRS4o"
    }
  },
  "ProseCodeCollapse": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.vue",
    "pascalName": "ProseCodeCollapse",
    "kebabName": "prose-code-collapse",
    "chunkName": "components/prose-code-collapse",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "The icon displayed to toggle the code.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.chevronDown"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "global": false,
          "description": "The name displayed in the trigger label.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.name')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "openText",
          "global": false,
          "description": "The text displayed when the code is collapsed.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.openText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "closeText",
          "global": false,
          "description": "The text displayed when the code is expanded.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.closeText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }"
        },
        {
          "name": "open",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:open",
          "description": "",
          "tags": [],
          "type": "[value: boolean]",
          "signature": "(event: \"update:open\", value: boolean): void",
          "schema": [
            {
              "kind": "enum",
              "type": "boolean",
              "schema": [
                "false",
                "true"
              ]
            }
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeCollapseSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeCollapseSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name displayed in the trigger label.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "The icon displayed to toggle the code.",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }"
        },
        {
          "name": "openText",
          "type": "string",
          "description": "The text displayed when the code is collapsed.",
          "schema": "string"
        },
        {
          "name": "closeText",
          "type": "string",
          "description": "The text displayed when the code is expanded.",
          "schema": "string"
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "onUpdate:open",
          "type": "(value: boolean) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: boolean): any",
            "schema": {}
          }
        }
      ],
      "hash": "vaZ53KXVEVKmL_TVE5vT1UDpnJ5T7Q-fU0bR25hJwpY"
    }
  },
  "ProseCodeGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeGroup.vue",
    "pascalName": "ProseCodeGroup",
    "kebabName": "prose-code-group",
    "chunkName": "components/prose-code-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default tab to select.",
          "tags": [
            {
              "name": "example",
              "text": "'1'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string",
          "default": "\"0\""
        },
        {
          "name": "sync",
          "global": false,
          "description": "Sync the selected tab with a local storage key.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }"
        },
        {
          "name": "modelValue",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:modelValue",
          "description": "",
          "tags": [],
          "type": "[value: string]",
          "signature": "(event: \"update:modelValue\", value: string): void",
          "schema": [
            "string"
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }"
        },
        {
          "name": "sync",
          "type": "string",
          "description": "Sync the selected tab with a local storage key.",
          "schema": "string"
        },
        {
          "name": "modelValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "onUpdate:modelValue",
          "type": "(value: string) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: string): any",
            "schema": {}
          }
        }
      ],
      "hash": "T7OlWQogloqY0u9ZLyg4IcbTqBVdrJ804j8xUlXN82I"
    }
  },
  "ProseCodeIcon": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.vue",
    "pascalName": "ProseCodeIcon",
    "kebabName": "prose-code-icon",
    "chunkName": "components/prose-code-icon",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "filename",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "filename",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "oo5Obeqg_EvvxA-zCSr7BMZ23ymfJxQI64fOQkeSDnw"
    }
  },
  "ProseCodePreview": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodePreview.vue",
    "pascalName": "ProseCodePreview",
    "kebabName": "prose-code-preview",
    "chunkName": "components/prose-code-preview",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "code",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodePreviewSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodePreviewSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              },
              "code": {
                "name": "code",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }"
        }
      ],
      "hash": "b-6nlgIJcRD0ltN6oZC871jbzdrgrti3VWZmZpjLV-s"
    }
  },
  "ProseCodeTree": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.vue",
    "pascalName": "ProseCodeTree",
    "kebabName": "prose-code-tree",
    "chunkName": "components/prose-code-tree",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default path to select.",
          "tags": [
            {
              "name": "example",
              "text": "'package.json'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "expandAll",
          "global": false,
          "description": "Expand all directories by default.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "false"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeTreeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeTreeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "The default path to select.",
          "schema": "string"
        },
        {
          "name": "expandAll",
          "type": "boolean",
          "description": "Expand all directories by default.",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "hash": "XkWwDrbf0inb2EHbQ3uCrM13ctZ4A115W9YAuTdkfn4"
    }
  },
  "ProseCollapsible": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Collapsible.vue",
    "pascalName": "ProseCollapsible",
    "kebabName": "prose-collapsible",
    "chunkName": "components/prose-collapsible",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "The icon displayed to toggle the collapsible.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.chevronDown"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "global": false,
          "description": "The name displayed in the trigger label.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.name')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "openText",
          "global": false,
          "description": "The text displayed when the collapsible is open.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.openText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "closeText",
          "global": false,
          "description": "The text displayed when the collapsible is closed.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.closeText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCollapsibleSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCollapsibleSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name displayed in the trigger label.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "The icon displayed to toggle the collapsible.",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "openText",
          "type": "string",
          "description": "The text displayed when the collapsible is open.",
          "schema": "string"
        },
        {
          "name": "closeText",
          "type": "string",
          "description": "The text displayed when the collapsible is closed.",
          "schema": "string"
        }
      ],
      "hash": "uVnsFhhhUgjlKvj6gsoVL9z4qw63Q6EvxIhSq7fmuo4"
    }
  },
  "ProseEm": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Em.vue",
    "pascalName": "ProseEm",
    "kebabName": "prose-em",
    "chunkName": "components/prose-em",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseEmSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseEmSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "jyi4MG0qm26KWCr5HSdtzQ4fPRzOXsNJPXvfmjYRFXM"
    }
  },
  "ProseField": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Field.vue",
    "pascalName": "ProseField",
    "kebabName": "prose-field",
    "chunkName": "components/prose-field",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "as",
          "global": false,
          "description": "The element or component this component should render as.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'div'"
            }
          ],
          "required": false,
          "type": "any",
          "schema": "any"
        },
        {
          "name": "name",
          "global": false,
          "description": "The name of the field.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "type",
          "global": false,
          "description": "Expected type of the field’s value",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "Description of the field",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }"
        },
        {
          "name": "required",
          "global": false,
          "description": "Indicate whether the field is required",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseFieldSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseFieldSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name of the field.",
          "schema": "string"
        },
        {
          "name": "type",
          "type": "string",
          "description": "Expected type of the field’s value",
          "schema": "string"
        },
        {
          "name": "required",
          "type": "boolean",
          "description": "Indicate whether the field is required",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "description",
          "type": "string",
          "description": "Description of the field",
          "schema": "string"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }"
        },
        {
          "name": "as",
          "type": "any",
          "description": "The element or component this component should render as.",
          "schema": "any"
        }
      ],
      "hash": "TrLtz7g-f5ASlXhRAxNT9s2jFKNy3RllqZjJnGGXYt0"
    }
  },
  "ProseFieldGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/FieldGroup.vue",
    "pascalName": "ProseFieldGroup",
    "kebabName": "prose-field-group",
    "chunkName": "components/prose-field-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "as",
          "global": false,
          "description": "The element or component this component should render as.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'div'"
            }
          ],
          "required": false,
          "type": "any",
          "schema": "any"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseFieldGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseFieldGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "as",
          "type": "any",
          "description": "The element or component this component should render as.",
          "schema": "any"
        }
      ],
      "hash": "vtYWD3NfEsPuI91l68PNBGhizOVWQqEoVP-yqnedzl4"
    }
  },
  "ProseH1": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/H1.vue",
    "pascalName": "ProseH1",
    "kebabName": "prose-h1",
    "chunkName": "components/prose-h1",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH1Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH1Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "Fcj3O0Q8iPljISHokcoiceB7Jy9LFbTvYQ3CrYo7XQ8"
    }
  },
  "ProseH2": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/H2.vue",
    "pascalName": "ProseH2",
    "kebabName": "prose-h2",
    "chunkName": "components/prose-h2",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH2Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH2Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "-Aq5cTW89MHa7Pe1I9vO0yaM1dKMLR-NoWcg39LQIVo"
    }
  },
  "ProseH3": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/H3.vue",
    "pascalName": "ProseH3",
    "kebabName": "prose-h3",
    "chunkName": "components/prose-h3",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH3Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH3Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "Ey1FCzVikbgaq0uUkDDr3WI5lIfi0YUpR4vArT4x7Tk"
    }
  },
  "ProseH4": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.vue",
    "pascalName": "ProseH4",
    "kebabName": "prose-h4",
    "chunkName": "components/prose-h4",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH4Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH4Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "kVazWnc_p__Zc1qVAjcBNiv0bS9vkxYeJgr1p0_kNlc"
    }
  },
  "ProseHr": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Hr.vue",
    "pascalName": "ProseHr",
    "kebabName": "prose-hr",
    "chunkName": "components/prose-hr",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "8JVY33pFHOM5ImlEj0gViADXZZJead3KmcmGqEvjebc"
    }
  },
  "ProseIcon": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.vue",
    "pascalName": "ProseIcon",
    "kebabName": "prose-icon",
    "chunkName": "components/prose-icon",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "name",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "name",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "DnfYzqaxFXi7NoFtxJOR08cN_PsaKxZkBH-e6GxxMkE"
    }
  },
  "ProseImg": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.vue",
    "pascalName": "ProseImg",
    "kebabName": "prose-img",
    "chunkName": "components/prose-img",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "src",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "alt",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "width",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "height",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "zoom",
          "global": false,
          "description": "Zoom image on click",
          "tags": [
            {
              "name": "defaultValue",
              "text": "true"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          },
          "default": "true"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "zoom",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "src",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "alt",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "width",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "height",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        }
      ],
      "hash": "4T5P5mmg7tZjKYZhdHKxm7KBrB7FSCQa4ArFOgExi9I"
    }
  },
  "ProseKbd": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Kbd.vue",
    "pascalName": "ProseKbd",
    "kebabName": "prose-kbd",
    "chunkName": "components/prose-kbd",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "value",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "value",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "A6UcyijuAYH5xMSOrwb6-cV3GaB7xXtgQ3uuemA2yO0"
    }
  },
  "ProseLi": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Li.vue",
    "pascalName": "ProseLi",
    "kebabName": "prose-li",
    "chunkName": "components/prose-li",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseLiSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseLiSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "4dc83Gf28zSaGCs6KZCEHBvZt4vKlJNJzlcwulJO6UQ"
    }
  },
  "ProseOl": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Ol.vue",
    "pascalName": "ProseOl",
    "kebabName": "prose-ol",
    "chunkName": "components/prose-ol",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseOlSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseOlSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "6OGY99075nyhWt5-gafgWB5bqHc4WYcuPQAjZiPPKEg"
    }
  },
  "ProseP": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/P.vue",
    "pascalName": "ProseP",
    "kebabName": "prose-p",
    "chunkName": "components/prose-p",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProsePSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProsePSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "B4Cbn0nHpN2p45IkpyBd1EOI6qJeJ_bJJejAYBCCWs8"
    }
  },
  "ProsePre": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.vue",
    "pascalName": "ProsePre",
    "kebabName": "prose-pre",
    "chunkName": "components/prose-pre",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "code",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "language",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "filename",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "highlights",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "number[]",
          "schema": {
            "kind": "array",
            "type": "number[]",
            "schema": {
              "0": "number"
            }
          }
        },
        {
          "name": "meta",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }"
        },
        {
          "name": "hideHeader",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProsePreSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProsePreSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }"
        },
        {
          "name": "code",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "filename",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "language",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "highlights",
          "type": "number[]",
          "description": "",
          "schema": {
            "kind": "array",
            "type": "number[]",
            "schema": {
              "0": "number"
            }
          }
        },
        {
          "name": "hideHeader",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "meta",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "0f3g7vCaGG70VRGWLsM6_K5ZE4dtK5-qnA0QjurJzoA"
    }
  },
  "ProseScript": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.vue",
    "pascalName": "ProseScript",
    "kebabName": "prose-script",
    "chunkName": "components/prose-script",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "src",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "src",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "hRcragcNrZKtSPsM8gQOALyxGljpzRgCxPlOwqIrDT8"
    }
  },
  "ProseSteps": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Steps.vue",
    "pascalName": "ProseSteps",
    "kebabName": "prose-steps",
    "chunkName": "components/prose-steps",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "level",
          "global": false,
          "description": "The heading level to apply to the steps.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'3'"
            }
          ],
          "required": false,
          "type": "\"3\" | \"2\" | \"4\"",
          "schema": {
            "kind": "enum",
            "type": "\"3\" | \"2\" | \"4\"",
            "schema": {
              "0": "\"3\"",
              "1": "\"2\"",
              "2": "\"4\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseStepsSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseStepsSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "level",
          "type": "\"3\" | \"2\" | \"4\"",
          "description": "The heading level to apply to the steps.",
          "schema": {
            "kind": "enum",
            "type": "\"3\" | \"2\" | \"4\"",
            "schema": {
              "0": "\"3\"",
              "1": "\"2\"",
              "2": "\"4\""
            }
          }
        }
      ],
      "hash": "2h-7DYRDhNe16lIz1qpMQZljP29innFeKuriXcqq46w"
    }
  },
  "ProseStrong": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Strong.vue",
    "pascalName": "ProseStrong",
    "kebabName": "prose-strong",
    "chunkName": "components/prose-strong",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseStrongSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseStrongSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "U-ZHIGavNDyIt4kXoKtdmuyWxnr25zWkEjRa2s_RrEc"
    }
  },
  "ProseTable": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Table.vue",
    "pascalName": "ProseTable",
    "kebabName": "prose-table",
    "chunkName": "components/prose-table",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; base?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; base?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTableSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTableSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; base?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; base?: ClassNameValue; }"
        }
      ],
      "hash": "6fmiFX3a1c6drIg0-o02m8J3aTGwxBPCHRsCh6sDxQE"
    }
  },
  "ProseTabs": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Tabs.vue",
    "pascalName": "ProseTabs",
    "kebabName": "prose-tabs",
    "chunkName": "components/prose-tabs",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default tab to select.",
          "tags": [
            {
              "name": "example",
              "text": "'1'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string",
          "default": "\"0\""
        },
        {
          "name": "sync",
          "global": false,
          "description": "Sync the selected tab with a local storage key.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "hash",
          "global": false,
          "description": "The hash to scroll to when the tab is selected.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "modelValue",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:modelValue",
          "description": "",
          "tags": [],
          "type": "[value: string]",
          "signature": "(event: \"update:modelValue\", value: string): void",
          "schema": [
            "string"
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTabsSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTabsSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "sync",
          "type": "string",
          "description": "Sync the selected tab with a local storage key.",
          "schema": "string"
        },
        {
          "name": "modelValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "onUpdate:modelValue",
          "type": "(value: string) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: string): any",
            "schema": {}
          }
        },
        {
          "name": "hash",
          "type": "string",
          "description": "The hash to scroll to when the tab is selected.",
          "schema": "string"
        }
      ],
      "hash": "X2COP4_gKZV9ql13Ndmw8M12CWcJb-GJ2pLpvlYk1Tc"
    }
  },
  "ProseTabsItem": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/TabsItem.vue",
    "pascalName": "ProseTabsItem",
    "kebabName": "prose-tabs-item",
    "chunkName": "components/prose-tabs-item",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "label",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTabsItemSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTabsItemSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "label",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "Jga9KfMKfm7mjd4rF-_lYur0f8_DvxttW8xBqaDsOJs"
    }
  },
  "ProseTbody": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Tbody.vue",
    "pascalName": "ProseTbody",
    "kebabName": "prose-tbody",
    "chunkName": "components/prose-tbody",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTbodySlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTbodySlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "_avU7FtWvcsHvkslJ3DA2Dg5ERiyG9mcAJoXuXmxNuw"
    }
  },
  "ProseTd": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Td.vue",
    "pascalName": "ProseTd",
    "kebabName": "prose-td",
    "chunkName": "components/prose-td",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTdSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTdSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "CDySp_Z0UO1qDE5oLTicOIslFN1gupJswYDwlFgCiqA"
    }
  },
  "ProseTh": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Th.vue",
    "pascalName": "ProseTh",
    "kebabName": "prose-th",
    "chunkName": "components/prose-th",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseThSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseThSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "C5IikjUp0VoLVAbjzNLr-0Y_N5bTO3YeqWbAebe81hY"
    }
  },
  "ProseThead": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Thead.vue",
    "pascalName": "ProseThead",
    "kebabName": "prose-thead",
    "chunkName": "components/prose-thead",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTheadSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTheadSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "Rc4zUp-J0si6-AZaXDtKKiGT7Yr7mqR47SSbUUTXbu0"
    }
  },
  "ProseTr": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Tr.vue",
    "pascalName": "ProseTr",
    "kebabName": "prose-tr",
    "chunkName": "components/prose-tr",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTrSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTrSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "aB65DiPclaNPEloNgaKSB_E6b34z63QHcHmk8uP9m-U"
    }
  },
  "ProseUl": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/Ul.vue",
    "pascalName": "ProseUl",
    "kebabName": "prose-ul",
    "chunkName": "components/prose-ul",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseUlSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseUlSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "S5DeNc-p3ZODLGq7i826aMSOLqiPvIvfP78LWdmTZOc"
    }
  },
  "ProseCaution": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Caution.vue",
    "pascalName": "ProseCaution",
    "kebabName": "prose-caution",
    "chunkName": "components/prose-caution",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "SqjIvIxkSgZC2c4Ml8JUm59EdTo4Q0DAl-vBK7xT2Xg"
    }
  },
  "ProseNote": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Note.vue",
    "pascalName": "ProseNote",
    "kebabName": "prose-note",
    "chunkName": "components/prose-note",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "XRiHAzydKtCeblsppx0K5uNAnVeAt_EcSjmUqsRTen0"
    }
  },
  "ProseTip": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Tip.vue",
    "pascalName": "ProseTip",
    "kebabName": "prose-tip",
    "chunkName": "components/prose-tip",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "tYpAmUY2YdDuyYkERwJ2CZT2dEVfmAxcP-7UuSYWl7g"
    }
  },
  "ProseWarning": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.vue",
    "pascalName": "ProseWarning",
    "kebabName": "prose-warning",
    "chunkName": "components/prose-warning",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "HXXlkoJY6NgFdsZtpmoNRvapW02uVjwd_d7l4D40IPk"
    }
  },
  "UFileUpload": {
    "mode": "all",
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.0.0-alpha.1_@babel+parser@7.28.3_change-case@5.4.4_db0@0.3.2_better-sqlite3@_2f07df7ffe6b8d13a95399386992709b/node_modules/@nuxt/ui/dist/runtime/components/FileUpload.vue",
    "pascalName": "UFileUpload",
    "kebabName": "u-file-upload",
    "chunkName": "components/u-file-upload",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 2,
      "props": [
        {
          "name": "as",
          "global": false,
          "description": "The element or component this component should render as.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'div'"
            }
          ],
          "required": false,
          "type": "any",
          "schema": "any"
        },
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "name",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "icon",
          "global": false,
          "description": "The icon to display.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.upload"
            },
            {
              "name": "IconifyIcon"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "label",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'primary'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "variant",
          "global": false,
          "description": "The `button` variant is only available when `multiple` is `false`.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'area'"
            }
          ],
          "required": false,
          "type": "\"button\" | \"area\"",
          "schema": {
            "kind": "enum",
            "type": "\"button\" | \"area\"",
            "schema": {
              "0": "\"button\"",
              "1": "\"area\""
            }
          }
        },
        {
          "name": "size",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'md'"
            }
          ],
          "required": false,
          "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\"",
          "schema": {
            "kind": "enum",
            "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\"",
            "schema": {
              "0": "\"xs\"",
              "1": "\"sm\"",
              "2": "\"md\"",
              "3": "\"lg\"",
              "4": "\"xl\""
            }
          }
        },
        {
          "name": "layout",
          "global": false,
          "description": "The layout of how files are displayed.\nOnly works when `variant` is `area`.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'list'"
            }
          ],
          "required": false,
          "type": "\"list\" | \"grid\"",
          "schema": {
            "kind": "enum",
            "type": "\"list\" | \"grid\"",
            "schema": {
              "0": "\"list\"",
              "1": "\"grid\""
            }
          },
          "default": "\"grid\""
        },
        {
          "name": "position",
          "global": false,
          "description": "The position of the files.\nOnly works when `variant` is `area` and when `layout` is `list`.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'outside'"
            }
          ],
          "required": false,
          "type": "\"inside\" | \"outside\"",
          "schema": {
            "kind": "enum",
            "type": "\"inside\" | \"outside\"",
            "schema": {
              "0": "\"inside\"",
              "1": "\"outside\""
            }
          },
          "default": "\"outside\""
        },
        {
          "name": "accept",
          "global": false,
          "description": "Specifies the allowed file types for the input. Provide a comma-separated list of MIME types or file extensions (e.g., \"image/png,application/pdf,.jpg\").",
          "tags": [
            {
              "name": "see",
              "text": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept"
            },
            {
              "name": "defaultValue",
              "text": "'*'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string",
          "default": "\"*\""
        },
        {
          "name": "fileIcon",
          "global": false,
          "description": "The icon to display for the file.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.file"
            },
            {
              "name": "IconifyIcon"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "fileDelete",
          "global": false,
          "description": "Configure the delete button for the file.\nWhen `layout` is `grid`, the default is `{ color: 'neutral', variant: 'solid', size: 'xs' }`{lang=\"ts-type\"}\nWhen `layout` is `list`, the default is `{ color: 'neutral', variant: 'link' }`{lang=\"ts-type\"}",
          "tags": [],
          "required": false,
          "type": "boolean | Partial<ButtonProps>",
          "schema": {
            "kind": "enum",
            "type": "boolean | Partial<ButtonProps>",
            "schema": {
              "0": "false",
              "1": "true",
              "2": "Partial<ButtonProps>"
            }
          }
        },
        {
          "name": "fileDeleteIcon",
          "global": false,
          "description": "The icon displayed to delete a file.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.close"
            },
            {
              "name": "IconifyIcon"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; base?: ClassNameValue; wrapper?: ClassNameValue; icon?: ClassNameValue; avatar?: ClassNameValue; label?: ClassNameValue; description?: ClassNameValue; actions?: ClassNameValue; files?: ClassNameValue; file?: ClassNameValue; fileLeadingAvatar?: ClassNameValue; fileWrapper?: ClassNameValue; fileName?: ClassNameValue; fileSize?: ClassNameValue; fileTrailingButton?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; base?: ClassNameValue; wrapper?: ClassNameValue; icon?: ClassNameValue; avatar?: ClassNameValue; label?: ClassNameValue; description?: ClassNameValue; actions?: ClassNameValue; files?: ClassNameValue; file?: ClassNameValue; fileLeadingAvatar?: ClassNameValue; fileWrapper?: ClassNameValue; fileName?: ClassNameValue; fileSize?: ClassNameValue; fileTrailingButton?: ClassNameValue; }"
        },
        {
          "name": "modelValue",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "File | File[]",
          "schema": {
            "kind": "enum",
            "type": "File | File[]",
            "schema": {
              "0": {
                "kind": "object",
                "type": "File",
                "schema": {}
              },
              "1": {
                "kind": "array",
                "type": "File[]",
                "schema": [
                  "File"
                ]
              }
            }
          }
        },
        {
          "name": "highlight",
          "global": false,
          "description": "Highlight the ring color like a focus state.",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "multiple",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          },
          "default": "false"
        },
        {
          "name": "reset",
          "global": false,
          "description": "Reset the file input when the dialog is opened.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "false"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          },
          "default": "false"
        },
        {
          "name": "dropzone",
          "global": false,
          "description": "Create a zone that allows the user to drop files onto it.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "true"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          },
          "default": "true"
        },
        {
          "name": "interactive",
          "global": false,
          "description": "Make the dropzone interactive when the user is clicking on it.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "true"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          },
          "default": "true"
        },
        {
          "name": "required",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "disabled",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{ open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
            "schema": {
              "open": {
                "name": "open",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(localOptions?: Partial<UseFileDialogOptions>) => void",
                "schema": {
                  "kind": "event",
                  "type": "(localOptions?: Partial<UseFileDialogOptions>): void",
                  "schema": {}
                }
              },
              "removeFile": {
                "name": "removeFile",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(index?: number) => void",
                "schema": {
                  "kind": "event",
                  "type": "(index?: number): void",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "leading",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "label",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "description",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "actions",
          "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
            "schema": {
              "files": {
                "name": "files",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "File | File[]",
                "schema": {
                  "kind": "enum",
                  "type": "File | File[]",
                  "schema": {
                    "0": {
                      "kind": "object",
                      "type": "File",
                      "schema": {}
                    },
                    "1": {
                      "kind": "array",
                      "type": "File[]",
                      "schema": [
                        "File"
                      ]
                    }
                  }
                }
              },
              "open": {
                "name": "open",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(localOptions?: Partial<UseFileDialogOptions>) => void",
                "schema": {
                  "kind": "event",
                  "type": "(localOptions?: Partial<UseFileDialogOptions>): void",
                  "schema": {}
                }
              },
              "removeFile": {
                "name": "removeFile",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(index?: number) => void",
                "schema": {
                  "kind": "event",
                  "type": "(index?: number): void",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "files",
          "type": "{ files?: File | File[]; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ files?: File | File[]; }",
            "schema": {
              "files": {
                "name": "files",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "File | File[]",
                "schema": {
                  "kind": "enum",
                  "type": "File | File[]",
                  "schema": {
                    "0": {
                      "kind": "object",
                      "type": "File",
                      "schema": {}
                    },
                    "1": {
                      "kind": "array",
                      "type": "File[]",
                      "schema": [
                        "File"
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        {
          "name": "files-top",
          "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
            "schema": {
              "files": {
                "name": "files",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "File | File[]",
                "schema": {
                  "kind": "enum",
                  "type": "File | File[]",
                  "schema": {
                    "0": {
                      "kind": "object",
                      "type": "File",
                      "schema": {}
                    },
                    "1": {
                      "kind": "array",
                      "type": "File[]",
                      "schema": [
                        "File"
                      ]
                    }
                  }
                }
              },
              "open": {
                "name": "open",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(localOptions?: Partial<UseFileDialogOptions>) => void",
                "schema": {
                  "kind": "event",
                  "type": "(localOptions?: Partial<UseFileDialogOptions>): void",
                  "schema": {}
                }
              },
              "removeFile": {
                "name": "removeFile",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(index?: number) => void",
                "schema": {
                  "kind": "event",
                  "type": "(index?: number): void",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "files-bottom",
          "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ files?: File | File[]; open: (localOptions?: Partial<UseFileDialogOptions>) => void; removeFile: (index?: number) => void; }",
            "schema": {
              "files": {
                "name": "files",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "File | File[]",
                "schema": {
                  "kind": "enum",
                  "type": "File | File[]",
                  "schema": {
                    "0": {
                      "kind": "object",
                      "type": "File",
                      "schema": {}
                    },
                    "1": {
                      "kind": "array",
                      "type": "File[]",
                      "schema": [
                        "File"
                      ]
                    }
                  }
                }
              },
              "open": {
                "name": "open",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(localOptions?: Partial<UseFileDialogOptions>) => void",
                "schema": {
                  "kind": "event",
                  "type": "(localOptions?: Partial<UseFileDialogOptions>): void",
                  "schema": {}
                }
              },
              "removeFile": {
                "name": "removeFile",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(index?: number) => void",
                "schema": {
                  "kind": "event",
                  "type": "(index?: number): void",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "file",
          "type": "{ file: File; index: number; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ file: File; index: number; }",
            "schema": {
              "file": {
                "name": "file",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "File",
                "schema": {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                }
              },
              "index": {
                "name": "index",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "number",
                "schema": "number"
              }
            }
          }
        },
        {
          "name": "file-leading",
          "type": "{ file: File; index: number; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ file: File; index: number; }",
            "schema": {
              "file": {
                "name": "file",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "File",
                "schema": {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                }
              },
              "index": {
                "name": "index",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "number",
                "schema": "number"
              }
            }
          }
        },
        {
          "name": "file-name",
          "type": "{ file: File; index: number; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ file: File; index: number; }",
            "schema": {
              "file": {
                "name": "file",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "File",
                "schema": {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                }
              },
              "index": {
                "name": "index",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "number",
                "schema": "number"
              }
            }
          }
        },
        {
          "name": "file-size",
          "type": "{ file: File; index: number; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ file: File; index: number; }",
            "schema": {
              "file": {
                "name": "file",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "File",
                "schema": {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                }
              },
              "index": {
                "name": "index",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "number",
                "schema": "number"
              }
            }
          }
        },
        {
          "name": "file-trailing",
          "type": "{ file: File; index: number; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ file: File; index: number; }",
            "schema": {
              "file": {
                "name": "file",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "File",
                "schema": {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                }
              },
              "index": {
                "name": "index",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "number",
                "schema": "number"
              }
            }
          }
        }
      ],
      "events": [
        {
          "name": "change",
          "description": "",
          "tags": [],
          "type": "[Event]",
          "signature": "(evt: \"change\", event: Event): void",
          "schema": [
            {
              "kind": "object",
              "type": "Event",
              "schema": {}
            }
          ]
        },
        {
          "name": "update:modelValue",
          "description": "",
          "tags": [],
          "type": "[File | File[]]",
          "signature": "(evt: \"update:modelValue\", value: File | File[]): void",
          "schema": [
            {
              "kind": "enum",
              "type": "File | File[]",
              "schema": [
                {
                  "kind": "object",
                  "type": "File",
                  "schema": {}
                },
                {
                  "kind": "array",
                  "type": "File[]",
                  "schema": [
                    "File"
                  ]
                }
              ]
            }
          ]
        }
      ],
      "exposed": [
        {
          "name": "inputRef",
          "type": "HTMLInputElement",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "HTMLInputElement",
            "schema": {}
          }
        },
        {
          "name": "dropzoneRef",
          "type": "HTMLDivElement",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "HTMLDivElement",
            "schema": {}
          }
        }
      ],
      "hash": "2fwxj3XnIMeHDLE_aF49etvY9OUD1bCB3XQWEJo2iw4"
    }
  },
  "ProseH5": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH5.vue",
    "pascalName": "ProseH5",
    "kebabName": "prose-h5",
    "chunkName": "components/prose-h5",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "((props: {}) => any) & ((props: {}) => any)",
                "schema": {
                  "kind": "event",
                  "type": "(props: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "iRxs4pEciGvJzd4WkA20UhuuDVHZJVftjuzBoRTMfbM"
    }
  },
  "ProseH6": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxtjs+mdc@0.17.0_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue",
    "pascalName": "ProseH6",
    "kebabName": "prose-h6",
    "chunkName": "components/prose-h6",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "((props: {}) => any) & ((props: {}) => any)",
                "schema": {
                  "kind": "event",
                  "type": "(props: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "UYPoc9YVQVrJixA-svRNNoliHYWg7_x9VXE_HKoMlG8"
    }
  },
  "Icon": {
    "chunkName": "components/icon",
    "global": true,
    "kebabName": "icon",
    "pascalName": "Icon",
    "prefetch": false,
    "preload": false,
    "mode": "all",
    "priority": 0,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "name",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "customize",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean | IconifyIconCustomizeCallback",
          "schema": {
            "kind": "enum",
            "type": "boolean | IconifyIconCustomizeCallback",
            "schema": {
              "0": "false",
              "1": "true",
              "2": {
                "kind": "event",
                "type": "(content: string, name?: string, prefix?: string, provider?: string): string",
                "schema": []
              }
            }
          },
          "default": "null"
        },
        {
          "name": "size",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          },
          "default": "null"
        },
        {
          "name": "mode",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"svg\" | \"css\"",
          "schema": {
            "kind": "enum",
            "type": "\"svg\" | \"css\"",
            "schema": {
              "0": "\"svg\"",
              "1": "\"css\""
            }
          },
          "default": "null"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "customize",
          "type": "boolean | IconifyIconCustomizeCallback",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean | IconifyIconCustomizeCallback",
            "schema": {
              "0": "false",
              "1": "true",
              "2": {
                "kind": "event",
                "type": "(content: string, name?: string, prefix?: string, provider?: string): string",
                "schema": []
              }
            }
          }
        },
        {
          "name": "size",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "mode",
          "type": "\"svg\" | \"css\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"svg\" | \"css\"",
            "schema": {
              "0": "\"svg\"",
              "1": "\"css\""
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "aFktfg79RoxhUJUbTqae26vK6eRtWxXTPNQOUXaL02A"
    },
    "name": "Icon",
    "filePath": "node_modules/.pnpm/@nuxt+icon@2.0.0_magicast@0.3.5_vite@7.1.4_jiti@2.5.1_lightningcss@1.30.1_terser@5.44.0_22248301879581b657075678e61754a5/node_modules/@nuxt/icon/dist/runtime/components/index.js"
  }
};

const collections = {
  "docs": {
    "name": "docs",
    "pascalName": "Docs",
    "tableName": "_content_docs",
    "source": [
      {
        "_resolved": true,
        "prefix": "/docs",
        "include": "docs/**/*.md",
        "cwd": "/Users/aliceclodia/Desktop/orange/content"
      }
    ],
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "body": "json",
      "description": "string",
      "extension": "string",
      "icon": "string",
      "isToc": "boolean",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "seo": "json",
      "stem": "string"
    },
    "schema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$ref": "#/definitions/__SCHEMA__",
      "definitions": {
        "docs": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "stem": {
              "type": "string"
            },
            "extension": {
              "type": "string",
              "enum": [
                "md",
                "yaml",
                "yml",
                "json",
                "csv",
                "xml"
              ]
            },
            "meta": {
              "type": "object",
              "additionalProperties": {}
            },
            "path": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "seo": {
              "allOf": [
                {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    }
                  }
                },
                {
                  "type": "object",
                  "additionalProperties": {}
                }
              ],
              "default": {}
            },
            "body": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string"
                },
                "children": {},
                "toc": {}
              },
              "required": [
                "type"
              ],
              "additionalProperties": false
            },
            "navigation": {
              "anyOf": [
                {
                  "type": "boolean"
                },
                {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "icon": {
                      "type": "string",
                      "$content": {
                        "editor": {
                          "input": "icon"
                        }
                      }
                    }
                  },
                  "required": [
                    "title",
                    "description",
                    "icon"
                  ],
                  "additionalProperties": false
                }
              ],
              "default": true
            },
            "isToc": {
              "type": "boolean"
            },
            "icon": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "stem",
            "extension",
            "meta",
            "path",
            "title",
            "description",
            "body",
            "isToc",
            "icon"
          ],
          "additionalProperties": false
        }
      }
    },
    "tableDefinition": "CREATE TABLE IF NOT EXISTS _content_docs (id TEXT PRIMARY KEY, \"title\" VARCHAR, \"body\" TEXT, \"description\" VARCHAR, \"extension\" VARCHAR, \"icon\" VARCHAR, \"isToc\" BOOLEAN, \"meta\" TEXT, \"navigation\" TEXT DEFAULT true, \"path\" VARCHAR, \"seo\" TEXT DEFAULT '{}', \"stem\" VARCHAR, \"__hash__\" TEXT UNIQUE);"
  },
  "info": {
    "name": "info",
    "pascalName": "Info",
    "tableName": "_content_info",
    "source": [],
    "type": "data",
    "fields": {},
    "schema": {
      "$ref": "#/definitions/info",
      "definitions": {},
      "$schema": "http://json-schema.org/draft-07/schema#"
    },
    "tableDefinition": "CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, \"ready\" BOOLEAN, \"structureVersion\" VARCHAR, \"version\" VARCHAR, \"__hash__\" TEXT UNIQUE);"
  }
};
const gitInfo = {
  "name": "orange",
  "owner": "sooooooooooooooooootheby",
  "url": "https://github.com/sooooooooooooooooootheby/orange"
};
const appConfigSchema = {
  "properties": {
    "id": "#appConfig",
    "properties": {
      "icon": {
        "title": "Nuxt Icon",
        "description": "Configure Nuxt Icon module preferences.",
        "tags": [
          "@studioIcon material-symbols:star"
        ],
        "id": "#appConfig/icon",
        "properties": {
          "size": {
            "title": "Icon Size",
            "description": "Set the default icon size.",
            "tags": [
              "@studioIcon material-symbols:format-size-rounded"
            ],
            "tsType": "string | undefined",
            "id": "#appConfig/icon/size",
            "default": {},
            "type": "any"
          },
          "class": {
            "title": "CSS Class",
            "description": "Set the default CSS class.",
            "tags": [
              "@studioIcon material-symbols:css"
            ],
            "id": "#appConfig/icon/class",
            "default": "",
            "type": "string"
          },
          "attrs": {
            "title": "Default Attributes",
            "description": "Attributes applied to every icon component.\n\n@default { \"aria-hidden\": true }",
            "tags": [
              "@studioIcon material-symbols:settings"
            ],
            "tsType": "Record<string, string | number | boolean>",
            "id": "#appConfig/icon/attrs",
            "default": {
              "aria-hidden": true
            },
            "type": "object"
          },
          "mode": {
            "title": "Default Rendering Mode",
            "description": "Set the default rendering mode for the icon component",
            "enum": [
              "css",
              "svg"
            ],
            "tags": [
              "@studioIcon material-symbols:move-down-rounded"
            ],
            "id": "#appConfig/icon/mode",
            "default": "css",
            "type": "string"
          },
          "aliases": {
            "title": "Icon aliases",
            "description": "Define Icon aliases to update them easily without code changes.",
            "tags": [
              "@studioIcon material-symbols:star-rounded"
            ],
            "tsType": "{ [alias: string]: string }",
            "id": "#appConfig/icon/aliases",
            "default": {},
            "type": "object"
          },
          "cssSelectorPrefix": {
            "title": "CSS Selector Prefix",
            "description": "Set the default CSS selector prefix.",
            "tags": [
              "@studioIcon material-symbols:format-textdirection-l-to-r"
            ],
            "id": "#appConfig/icon/cssSelectorPrefix",
            "default": "i-",
            "type": "string"
          },
          "cssLayer": {
            "title": "CSS Layer Name",
            "description": "Set the default CSS `@layer` name.",
            "tags": [
              "@studioIcon material-symbols:layers"
            ],
            "tsType": "string | undefined",
            "id": "#appConfig/icon/cssLayer",
            "default": {},
            "type": "any"
          },
          "cssWherePseudo": {
            "title": "Use CSS `:where()` Pseudo Selector",
            "description": "Use CSS `:where()` pseudo selector to reduce specificity.",
            "tags": [
              "@studioIcon material-symbols:low-priority"
            ],
            "id": "#appConfig/icon/cssWherePseudo",
            "default": true,
            "type": "boolean"
          },
          "collections": {
            "title": "Icon Collections",
            "description": "List of known icon collections name. Used to resolve collection name ambiguity.\ne.g. `simple-icons-github` -> `simple-icons:github` instead of `simple:icons-github`\n\nWhen not provided, will use the full Iconify collection list.",
            "tags": [
              "@studioIcon material-symbols:format-list-bulleted"
            ],
            "tsType": "string[] | null",
            "id": "#appConfig/icon/collections",
            "default": null,
            "type": "any"
          },
          "customCollections": {
            "title": "Custom Icon Collections",
            "tags": [
              "@studioIcon material-symbols:format-list-bulleted"
            ],
            "tsType": "string[] | null",
            "id": "#appConfig/icon/customCollections",
            "default": null,
            "type": "any"
          },
          "provider": {
            "title": "Icon Provider",
            "description": "Provider to use for fetching icons\n\n- `server` - Fetch icons with a server handler\n- `iconify` - Fetch icons with Iconify API, purely client-side\n- `none` - Do not fetch icons (use client bundle only)\n\n`server` by default; `iconify` when `ssr: false`",
            "enum": [
              "server",
              "iconify",
              "none"
            ],
            "tags": [
              "@studioIcon material-symbols:cloud"
            ],
            "type": "\"server\" | \"iconify\" | undefined",
            "id": "#appConfig/icon/provider"
          },
          "iconifyApiEndpoint": {
            "title": "Iconify API Endpoint URL",
            "description": "Define a custom Iconify API endpoint URL. Useful if you want to use a self-hosted Iconify API. Learn more: https://iconify.design/docs/api.",
            "tags": [
              "@studioIcon material-symbols:api"
            ],
            "id": "#appConfig/icon/iconifyApiEndpoint",
            "default": "https://api.iconify.design",
            "type": "string"
          },
          "fallbackToApi": {
            "title": "Fallback to Iconify API",
            "description": "Fallback to Iconify API if server provider fails to found the collection.",
            "tags": [
              "@studioIcon material-symbols:public"
            ],
            "enum": [
              true,
              false,
              "server-only",
              "client-only"
            ],
            "type": "boolean | \"server-only\" | \"client-only\"",
            "id": "#appConfig/icon/fallbackToApi",
            "default": true
          },
          "localApiEndpoint": {
            "title": "Local API Endpoint Path",
            "description": "Define a custom path for the local API endpoint.",
            "tags": [
              "@studioIcon material-symbols:api"
            ],
            "id": "#appConfig/icon/localApiEndpoint",
            "default": "/api/_nuxt_icon",
            "type": "string"
          },
          "fetchTimeout": {
            "title": "Fetch Timeout",
            "description": "Set the timeout for fetching icons.",
            "tags": [
              "@studioIcon material-symbols:timer"
            ],
            "id": "#appConfig/icon/fetchTimeout",
            "default": 1500,
            "type": "number"
          },
          "customize": {
            "title": "Customize callback",
            "description": "Customize icon content (replace stroke-width, colors, etc...).",
            "tags": [
              "@studioIcon material-symbols:edit"
            ],
            "type": "IconifyIconCustomizeCallback",
            "id": "#appConfig/icon/customize"
          }
        },
        "type": "object",
        "default": {
          "size": {},
          "class": "",
          "attrs": {
            "aria-hidden": true
          },
          "mode": "css",
          "aliases": {},
          "cssSelectorPrefix": "i-",
          "cssLayer": {},
          "cssWherePseudo": true,
          "collections": null,
          "customCollections": null,
          "iconifyApiEndpoint": "https://api.iconify.design",
          "fallbackToApi": true,
          "localApiEndpoint": "/api/_nuxt_icon",
          "fetchTimeout": 1500
        }
      }
    },
    "type": "object",
    "default": {
      "icon": {
        "size": {},
        "class": "",
        "attrs": {
          "aria-hidden": true
        },
        "mode": "css",
        "aliases": {},
        "cssSelectorPrefix": "i-",
        "cssLayer": {},
        "cssWherePseudo": true,
        "collections": null,
        "customCollections": null,
        "iconifyApiEndpoint": "https://api.iconify.design",
        "fallbackToApi": true,
        "localApiEndpoint": "/api/_nuxt_icon",
        "fetchTimeout": 1500
      }
    }
  },
  "default": {
    "icon": {
      "size": {},
      "class": "",
      "attrs": {
        "aria-hidden": true
      },
      "mode": "css",
      "aliases": {},
      "cssSelectorPrefix": "i-",
      "cssLayer": {},
      "cssWherePseudo": true,
      "collections": null,
      "customCollections": null,
      "iconifyApiEndpoint": "https://api.iconify.design",
      "fallbackToApi": true,
      "localApiEndpoint": "/api/_nuxt_icon",
      "fetchTimeout": 1500
    }
  }
};

const _w0cPj9 = eventHandler(async () => {
  const mappedComponents = Object.values(components).map(({ pascalName, filePath, meta }) => {
    return {
      name: pascalName,
      path: filePath,
      meta: {
        props: meta.props,
        slots: meta.slots,
        events: meta.events
      }
    };
  });
  const appConfig = useAppConfig();
  const runtimeConfig = useRuntimeConfig();
  const { content } = runtimeConfig;
  const { preview } = runtimeConfig.public;
  const { version } = content;
  return {
    version,
    preview,
    gitInfo,
    collections,
    appConfigSchema,
    appConfig,
    components: mappedComponents
  };
});

const _T6z5Iv = defineEventHandler((event) => {
  appendHeader(event, "Access-Control-Allow-Origin", "*");
  const componentName = (event.context.params?.["component?"] || "").replace(/\.json$/, "");
  if (componentName) {
    const meta = components[pascalCase(componentName)];
    if (!meta) {
      throw createError$1({
        statusMessage: "Components not found!",
        statusCode: 404,
        data: {
          description: "Please make sure you are looking for correct component"
        }
      });
    }
    return meta;
  }
  return components;
});

const _SxA8c9 = defineEventHandler(() => {});

const _6IQM0e = eventHandler(async (event) => {
  const collection = getRouterParam(event, "collection");
  setHeader(event, "Content-Type", "text/plain");
  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || "";
  if (data) {
    const lineStart = `export const ${collection} = "`;
    const content = String(data).split("\n").find((line) => line.startsWith(lineStart));
    if (content) {
      return content.substring(lineStart.length, content.length - 1);
    }
  }
  return await import('../build/database.compressed.mjs').then((m) => m[collection]);
});

async function decompressSQLDump(base64Str, compressionType = "gzip") {
  const binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  const response = new Response(new Blob([binaryData]));
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text);
}

function refineContentFields(sql, doc) {
  const fields = findCollectionFields(sql);
  const item = { ...doc };
  for (const key in item) {
    if (fields[key] === "json" && item[key] && item[key] !== "undefined") {
      item[key] = JSON.parse(item[key]);
    }
    if (fields[key] === "boolean" && item[key] !== "undefined") {
      item[key] = Boolean(item[key]);
    }
  }
  for (const key in item) {
    if (item[key] === "NULL") {
      item[key] = void 0;
    }
  }
  return item;
}
function findCollectionFields(sql) {
  const table = sql.match(/FROM\s+(\w+)/);
  if (!table) {
    return {};
  }
  const info = contentManifest[getCollectionName(table[1])];
  return info?.fields || {};
}
function getCollectionName(table) {
  return table.replace(/^_content_/, "");
}

class BoundableStatement {
  _statement;
  constructor(rawStmt) {
    this._statement = rawStmt;
  }
  bind(...params) {
    return new BoundStatement(this, params);
  }
}
class BoundStatement {
  #statement;
  #params;
  constructor(statement, params) {
    this.#statement = statement;
    this.#params = params;
  }
  bind(...params) {
    return new BoundStatement(this.#statement, params);
  }
  all() {
    return this.#statement.all(...this.#params);
  }
  run() {
    return this.#statement.run(...this.#params);
  }
  get() {
    return this.#statement.get(...this.#params);
  }
}

function sqliteConnector(opts) {
  let _db;
  const getDB = () => {
    if (_db) {
      return _db;
    }
    if (opts.name === ":memory:") {
      _db = new Database(":memory:");
      return _db;
    }
    const filePath = resolve$1(
      opts.cwd || ".",
      opts.path || `.data/${opts.name || "db"}.sqlite3`
    );
    mkdirSync(dirname$1(filePath), { recursive: true });
    _db = new Database(filePath);
    return _db;
  };
  return {
    name: "sqlite",
    dialect: "sqlite",
    getInstance: () => getDB(),
    exec: (sql) => getDB().exec(sql),
    prepare: (sql) => new StatementWrapper(() => getDB().prepare(sql))
  };
}
class StatementWrapper extends BoundableStatement {
  async all(...params) {
    return this._statement().all(...params);
  }
  async run(...params) {
    const res = this._statement().run(...params);
    return { success: res.changes > 0, ...res };
  }
  async get(...params) {
    return this._statement().get(...params);
  }
}

let db;
function loadDatabaseAdapter(config) {
  const { database, localDatabase } = config;
  if (!db) {
    if (["nitro-prerender", "nitro-dev"].includes("node-server")) {
      db = sqliteConnector(refineDatabaseConfig(localDatabase));
    } else {
      db = sqliteConnector(refineDatabaseConfig(database));
    }
  }
  return {
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params).then((result) => (result || []).map((item) => refineContentFields(sql, item)));
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params).then((item) => item ? refineContentFields(sql, item) : item);
    },
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params);
    }
  };
}
const checkDatabaseIntegrity = {};
const integrityCheckPromise = {};
async function checkAndImportDatabaseIntegrity(event, collection, config) {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false;
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], checksumsStructure[String(collection)], config).then((isValid) => {
      checkDatabaseIntegrity[String(collection)] = !isValid;
    }).catch((error) => {
      console.error("Database integrity check failed", error);
      checkDatabaseIntegrity[String(collection)] = true;
      integrityCheckPromise[String(collection)] = null;
    });
  }
  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)];
  }
}
async function _checkAndImportDatabaseIntegrity(event, collection, integrityVersion, structureIntegrityVersion, config) {
  const db2 = loadDatabaseAdapter(config);
  const before = await db2.first(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => null);
  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    await db2.exec(`DROP TABLE IF EXISTS ${tables.info}`);
    before.version = "";
  }
  const unchangedStructure = before?.structureVersion === structureIntegrityVersion;
  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        return true;
      }
      await waitUntilDatabaseIsReady(db2, collection);
      return true;
    }
    await db2.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]);
    if (!unchangedStructure) {
      await db2.exec(`DROP TABLE IF EXISTS ${tables[collection]}`);
    }
  }
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump);
  const dumpLinesHash = dump.map((row) => row.split(" -- ").pop());
  let hashesInDb = /* @__PURE__ */ new Set();
  if (unchangedStructure) {
    const hashListFromTheDump = new Set(dumpLinesHash);
    const hashesInDbRecords = await db2.all(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => []);
    hashesInDb = new Set(hashesInDbRecords.map((r) => r.__hash__));
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump);
    if (hashesToDelete.size) {
      await db2.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill("?").join(",")})`, Array.from(hashesToDelete));
    }
  }
  await dump.reduce(async (prev, sql, index) => {
    await prev;
    const hash = dumpLinesHash[index];
    const statement = sql.substring(0, sql.length - hash.length - 4);
    if (unchangedStructure) {
      if (hash === "structure") {
        return Promise.resolve();
      }
      if (hashesInDb.has(hash)) {
        return Promise.resolve();
      }
    }
    await db2.exec(statement).catch((err) => {
      const message = err.message || "Unknown error";
      console.error(`Failed to execute SQL ${sql}: ${message}`);
    });
  }, Promise.resolve());
  const after = await db2.first(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: "" }));
  return after?.version === integrityVersion;
}
const REQUEST_TIMEOUT = 90;
async function waitUntilDatabaseIsReady(db2, collection) {
  let iterationCount = 0;
  let interval;
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db2.first(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }));
      if (row?.ready) {
        clearInterval(interval);
        resolve(0);
      }
      if (iterationCount++ > REQUEST_TIMEOUT) {
        clearInterval(interval);
        reject(new Error("Waiting for another database initialization timed out"));
      }
    }, 1e3);
  }).catch((e) => {
    throw e;
  }).finally(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
async function loadDatabaseDump(event, collection) {
  return await fetchDatabase(event, String(collection)).catch((e) => {
    console.error("Failed to fetch compressed dump", e);
    return "";
  });
}
function refineDatabaseConfig(config) {
  if (config.type === "d1") {
    return { ...config, bindingName: config.bindingName || config.binding };
  }
  if (config.type === "sqlite") {
    const _config = { ...config };
    if (config.filename === ":memory:") {
      return { name: "memory" };
    }
    if ("filename" in config) {
      const filename = isAbsolute(config?.filename || "") || config?.filename === ":memory:" ? config?.filename : new URL(config.filename, globalThis._importMeta_.url).pathname;
      _config.path = process.platform === "win32" && filename.startsWith("/") ? filename.slice(1) : filename;
    }
    return _config;
  }
  return config;
}

const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i;
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?([a-z_]\w+|\*)\)/i;
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/;
function assertSafeQuery(sql, collection) {
  if (!sql) {
    throw new Error("Invalid query");
  }
  const cleanedupQuery = cleanupQuery(sql);
  if (cleanedupQuery !== sql) {
    throw new Error("Invalid query");
  }
  const match = sql.match(SQL_SELECT_REGEX);
  if (!match) {
    throw new Error("Invalid query");
  }
  const [_, select, from, where, orderBy, order, limit, offset] = match;
  const columns = select.trim().split(", ");
  if (columns.length === 1) {
    if (columns[0] !== "*" && !columns[0].match(SQL_COUNT_REGEX) && !columns[0].match(/^"[a-z_]\w+"$/i)) {
      throw new Error("Invalid query");
    }
  } else if (!columns.every((column) => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error("Invalid query");
  }
  if (from !== `_content_${collection}`) {
    throw new Error("Invalid query");
  }
  if (where) {
    if (!where.startsWith(" WHERE (") || !where.endsWith(")")) {
      throw new Error("Invalid query");
    }
    const noString = cleanupQuery(where, { removeString: true });
    if (noString.match(SQL_COMMANDS)) {
      throw new Error("Invalid query");
    }
  }
  const _order = (orderBy + " " + order).split(", ");
  if (!_order.every((column) => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error("Invalid query");
  }
  if (limit !== void 0 && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error("Invalid query");
  }
  if (offset !== void 0 && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error("Invalid query");
  }
  return true;
}
function cleanupQuery(query, options = { removeString: false }) {
  let inString = false;
  let stringFence = "";
  let result = "";
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = query[i - 1];
    const nextChar = query[i + 1];
    if (char === "'" || char === '"') {
      if (!options?.removeString) {
        result += char;
        continue;
      }
      if (inString) {
        if (char !== stringFence || nextChar === stringFence || prevChar === stringFence) {
          continue;
        }
        inString = false;
        stringFence = "";
        continue;
      } else {
        inString = true;
        stringFence = char;
        continue;
      }
    }
    if (!inString) {
      if (char === "-" && nextChar === "-") {
        return result;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < query.length && !(query[i] === "*" && query[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }
      result += char;
    }
  }
  return result;
}

const _8DhA91 = eventHandler(async (event) => {
  const { sql } = await readBody(event);
  const collection = getRouterParam(event, "collection");
  assertSafeQuery(sql, collection);
  const conf = useRuntimeConfig().content;
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf);
  }
  return loadDatabaseAdapter(conf).all(sql);
});

const _lazy_RNgL0t = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _tpJizR, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_RNgL0t, lazy: true, middleware: false, method: undefined },
  { route: '/api/_nuxt_icon/:collection', handler: _krKDJc, lazy: false, middleware: false, method: undefined },
  { route: '/__preview.json', handler: _w0cPj9, lazy: false, middleware: false, method: "get" },
  { route: '/api/component-meta', handler: _T6z5Iv, lazy: false, middleware: false, method: "get" },
  { route: '/api/component-meta.json', handler: _T6z5Iv, lazy: false, middleware: false, method: "get" },
  { route: '/api/component-meta/:component?', handler: _T6z5Iv, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/sql_dump.txt', handler: _6IQM0e, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/query', handler: _8DhA91, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_RNgL0t, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch$1 as $, createHooks as A, executeAsync as B, toRouteMatcher as C, createRouter$1 as D, pascalCase as E, kebabCase as F, withLeadingSlash as G, nodeServer as H, getResponseStatus as a, buildAssetsURL as b, getQuery as c, defineRenderHandler as d, createError$1 as e, destr as f, getResponseStatusText as g, getRouteRules as h, useNitroApp as i, parseQuery as j, klona as k, defuFn as l, defu as m, hasProtocol as n, joinURL as o, publicAssetsURL as p, getContext as q, isEqual as r, serialize$1 as s, withTrailingSlash as t, useRuntimeConfig as u, withoutTrailingSlash as v, withQuery as w, isScriptProtocol as x, sanitizeStatusCode as y, baseURL as z };
//# sourceMappingURL=nitro.mjs.map
