// utils/mcFormat.js  —— ESM 导出
// 用法：import { toColoredHtml } from '~/utils/mcFormat'
//       const html = toColoredHtml(input)  // 然后 v-html 渲染

export function toColoredHtml(input) {
	if (typeof input !== "string" || !input) return "";

	// 预备：字素切分（优先使用 Intl.Segmenter，回退到简单切分）
	const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

	// 为了在主循环中按原始索引读取“下一个字素”，
	// 我们先把整串分段，建立 index -> grapheme 的映射。
	const graphemes = [];
	const indexToGrapheme = new Map();
	if (segmenter) {
		const segs = segmenter.segment(input);
		for (const s of segs) {
			graphemes.push({ index: s.index, text: s.segment });
			indexToGrapheme.set(s.index, s.segment);
		}
	} else {
		// 回退：并不完美，但尽量保证 emoji 基本不被破坏
		let i = 0;
		for (const cp of Array.from(input)) {
			indexToGrapheme.set(i, cp);
			graphemes.push({ index: i, text: cp });
			i += cp.length;
		}
	}

	// 状态（持续生效）
	let color = null; // '#rrggbb' or null
	let bold = false;
	let italic = false;
	let underline = false;
	let strike = false;

	// 单次颜色（仅应用到下一个字素）
	let nextOnceColor = null;

	// HTML 片段累积
	const out = [];

	// 转义
	const esc = (s) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

	// 生成当前样式的 style 字符串
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

	// 读取 hex
	const isHex = (ch) => /^[0-9a-fA-F]$/.test(ch);

	// 主循环用原始字符串索引推进
	let i = 0;
	const len = input.length;

	while (i < len) {
		const ch = input[i];

		// 1) &#rrggbb（一次性颜色：仅下一个字素）
		if (ch === "&" && i + 8 <= len && input[i + 1] === "#") {
			const hex = input.slice(i + 2, i + 8);
			if (/^[0-9a-fA-F]{6}$/.test(hex)) {
				nextOnceColor = `#${hex.toLowerCase()}`;
				i += 8;
				continue; // 不输出任何字符
			}
		}

		// 2) &x&h&h&h&h&h&h（持续颜色）
		if (ch === "&" && i + 14 <= len && input[i + 1] === "x") {
			// 期望 &x 后有 6 组 (& + hex)
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

		// 3) 样式/重置控制码（&l &o &n &m &r）
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

		// 4) 普通字素：从 indexToGrapheme 取“下一个完整字素”
		const g = indexToGrapheme.get(i);
		if (g == null) {
			// 保险：若当前位置不是字素起点，当普通字符处理（极少见）
			const safeChar = esc(input[i]);
			out.push(`<span${styleOf(color)}>${safeChar}</span>`);
			i += 1;
			// 清理一次性颜色（如果它本应应用到这个误差字符，则也清掉）
			nextOnceColor = null;
			continue;
		}

		// 应用颜色（一次性优先于持续）
		const appliedColor = nextOnceColor || color;
		nextOnceColor = null;

		const safeG = esc(g);
		out.push(`<span${styleOf(appliedColor)}>${safeG}</span>`);
		i += g.length;
	}

	// 你也可以包一层 class，方便定制字体/行高
	return `<span class="mc-colored">${out.join("")}</span>`;
}
