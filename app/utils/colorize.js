export function toColoredHtml(input) {
	if (typeof input !== "string" || !input) return "";

	const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

	const graphemes = [];
	const indexToGrapheme = new Map();
	if (segmenter) {
		const segs = segmenter.segment(input);
		for (const s of segs) {
			graphemes.push({ index: s.index, text: s.segment });
			indexToGrapheme.set(s.index, s.segment);
		}
	} else {
		let i = 0;
		for (const cp of Array.from(input)) {
			indexToGrapheme.set(i, cp);
			graphemes.push({ index: i, text: cp });
			i += cp.length;
		}
	}

	let color = null;
	let bold = false;
	let italic = false;
	let underline = false;
	let strike = false;

	let nextOnceColor = null;
	const out = [];

	const esc = (s) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

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
	const isCtrl = (c) => c === "&" || c === "§";

	// ★ 新增：原版16色表
	const mcColors = {
		0: "#000000",
		1: "#0000aa",
		2: "#00aa00",
		3: "#00aaaa",
		4: "#aa0000",
		5: "#aa00aa",
		6: "#ffaa00",
		7: "#aaaaaa",
		8: "#555555",
		9: "#5555ff",
		a: "#55ff55",
		b: "#55ffff",
		c: "#ff5555",
		d: "#ff55ff",
		e: "#ffff55",
		f: "#ffffff",
	};

	let i = 0;
	const len = input.length;

	while (i < len) {
		const ch = input[i];

		// # 一次性 RGB: &#rrggbb
		if (isCtrl(ch) && i + 8 <= len && input[i + 1] === "#") {
			const hex = input.slice(i + 2, i + 8);
			if (/^[0-9a-fA-F]{6}$/.test(hex)) {
				nextOnceColor = `#${hex.toLowerCase()}`;
				i += 8;
				continue;
			}
		}

		// # 持续 RGB: &x&h&h&h&h&h&h
		if (isCtrl(ch) && i + 14 <= len && input[i + 1] === "x") {
			let ok = true;
			let hex = "";
			for (let k = 0; k < 6; k++) {
				const ctrl = input[i + 2 + k * 2];
				const hd = input[i + 3 + k * 2];
				if (!isCtrl(ctrl) || !isHex(hd)) {
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

		// # 样式 + ★ 原版颜色码
		if (isCtrl(ch) && i + 1 < len) {
			const code = input[i + 1].toLowerCase();

			if (mcColors[code]) {
				color = mcColors[code];
				i += 2;
				continue;
			}
			if (code === "r") {
				color = null;
				bold = italic = underline = strike = false;
				i += 2;
				continue;
			}
			if (code === "l") bold = true;
			else if (code === "o") italic = true;
			else if (code === "n") underline = true;
			else if (code === "m") strike = true;

			i += 2;
			continue;
		}

		const g = indexToGrapheme.get(i);
		const appliedColor = nextOnceColor || color;
		nextOnceColor = null;

		out.push(`<span${styleOf(appliedColor)}>${esc(g || input[i])}</span>`);
		i += g ? g.length : 1;
	}

	return `<span class="mc-colored">${out.join("")}</span>`;
}
