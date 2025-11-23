export default defineNuxtPlugin(() => {
	const TARGET_SEQUENCE = "organe";
	const TARGET_LENGTH = TARGET_SEQUENCE.length;
	let inputBuffer = "";
	let isScrambling = false;

	// 可跳过的标签列表
	const SKIP_TAGS = new Set(["script", "style", "input", "textarea", "select", "code", "pre"]);
	// 文本长度限制
	const MIN_TEXT_LENGTH = 2;
	const MAX_TEXT_LENGTH = 60;

	// 工具函数：打乱字符串
	function scrambleString(str) {
		const arr = str.split("");
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr.join("");
	}

	// 检查是否应该跳过父元素
	function shouldSkipParent(element) {
		let el = element;
		while (el) {
			const tagName = el.tagName?.toLowerCase();
			if (!tagName) return false;
			if (SKIP_TAGS.has(tagName)) return true;
			el = el.parentElement;
		}
		return false;
	}

	// 打乱节点文本
	function scrambleNodeText(node) {
		if (node.nodeType !== Node.TEXT_NODE || !node.parentElement || shouldSkipParent(node.parentElement)) {
			return;
		}

		const text = node.textContent || "";
		const trimmedLength = text.trim().length;

		if (trimmedLength >= MIN_TEXT_LENGTH && trimmedLength <= MAX_TEXT_LENGTH) {
			node.textContent = scrambleString(text);
		}
	}

	// 遍历并打乱容器内的文本
	function traverseAndScramble(container) {
		const walker = document.createTreeWalker(
			container,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: (node) => {
					if (!node.parentElement || shouldSkipParent(node.parentElement)) {
						return NodeFilter.FILTER_REJECT;
					}
					const text = node.textContent || "";
					const trimmedLength = text.trim().length;
					if (trimmedLength >= MIN_TEXT_LENGTH && trimmedLength <= MAX_TEXT_LENGTH) {
						return NodeFilter.FILTER_ACCEPT;
					}
					return NodeFilter.FILTER_REJECT;
				},
			},
			false
		);

		const nodes = [];
		let currentNode;
		while ((currentNode = walker.nextNode())) {
			nodes.push(currentNode);
		}

		nodes.forEach((node) => {
			node.textContent = scrambleString(node.textContent || "");
		});
	}

	// 工具函数：生成随机数
	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// 随机旋转图片
	function rotateImagesRandom(options = {}) {
		const { selector = "#__nuxt img:not(.no-rotate)", minDeg = -30, maxDeg = 30, duration = 600, allowMultiple = false } = options;

		const images = document.querySelectorAll(selector);

		images.forEach((img) => {
			if (!allowMultiple && img.dataset.rotated === "true") return;

			const rotation = randomInt(minDeg, maxDeg);
			if (img.dataset.originalTransform === undefined) {
				img.dataset.originalTransform = img.style.transform || "";
			}

			img.style.transition = `transform ${duration}ms ease`;
			img.style.transform = `rotate(${rotation}deg)`;
			img.dataset.rotated = "true";
		});
	}

	// 重置图片旋转
	function resetImageRotations(selector = "#__nuxt img") {
		const images = document.querySelectorAll(selector);

		images.forEach((img) => {
			img.style.transition = `transform 300ms ease`;

			if (img.dataset.originalTransform !== undefined) {
				img.style.transform = img.dataset.originalTransform;
				delete img.dataset.originalTransform;
			} else {
				img.style.transform = "";
			}

			delete img.dataset.rotated;
		});
	}

	// 触发文本打乱和图片旋转
	function triggerScramble() {
		if (isScrambling) return;
		isScrambling = true;

		const root = document.getElementById("__nuxt") || document.body;

		// 使用requestAnimationFrame确保UI响应
		requestAnimationFrame(() => {
			traverseAndScramble(root);
			rotateImagesRandom({ minDeg: -180, maxDeg: 180, duration: 700 });
			confetti.fire();
			window.dispatchEvent(new CustomEvent("text-disorder"));

			// 重置状态，允许再次触发
			setTimeout(() => {
				isScrambling = false;
			}, 1000);
		});
	}

	// 键盘事件监听
	function handleKeyDown(event) {
		const key = event.key;

		if (key.length === 1) {
			inputBuffer = (inputBuffer + key.toLowerCase()).slice(-TARGET_LENGTH);

			if (inputBuffer === TARGET_SEQUENCE) {
				triggerScramble();
				inputBuffer = ""; // 重置缓冲区
			}
		}
	}

	// 添加事件监听
	window.addEventListener("keydown", handleKeyDown);

	// 暴露API
	const api = {
		rotateImagesRandom,
		resetImageRotations,
		triggerScramble,
	};

	Object.assign(window, {
		__rotateImagesRandom: rotateImagesRandom,
		__resetImageRotations: resetImageRotations,
		__triggerTextScramble: triggerScramble,
		__scrambleApi: api,
	});

	// 事件监听
	window.addEventListener("text-disorder-reset", resetImageRotations);

	// === Canvas Confetti 效果 ===
	let canvas = document.getElementById("confetti-canvas");
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.id = "confetti-canvas";
		canvas.style.position = "fixed";
		canvas.style.inset = "0";
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
		canvas.style.pointerEvents = "none";
		canvas.style.zIndex = "9999";
		document.body.appendChild(canvas);
	}

	const ctx = canvas.getContext("2d");
	const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const COLORS = ["#ef4444", "#f59e0b", "#fbbf24", "#10b981", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#14b8a6"];
	const TWO_PI = Math.PI * 2;

	// === 尺寸管理 ===
	let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
	let cw = 0,
		ch = 0;
	const resize = () => {
		const { innerWidth: w, innerHeight: h } = window;
		dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		cw = canvas.width;
		ch = canvas.height;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();
	window.addEventListener("resize", resize, { passive: true });

	// === 粒子系统 ===
	const pool = [];
	const live = [];

	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	function pick(arr) {
		return arr[(Math.random() * arr.length) | 0];
	}

	const DEFAULTS = {
		count: prefersReduced ? 60 : 140,
		spread: 55,
		startVelocity: 16,
		gravity: 0.1,
		drag: 0.002,
		ticks: prefersReduced ? 80 : 160,
		scalar: 1,
		origin: { x: 0.5, y: 0.95 }, // 底部中央
		angle: 90,
	};

	function createParticle(x, y, opts) {
		const p = pool.pop() || {};
		const angleRad = ((opts.angle + rand(-opts.spread / 2, opts.spread / 2)) * Math.PI) / 180;
		const velocity = opts.startVelocity * (0.9 + Math.random() * 0.3);
		p.x = x;
		p.y = y;
		p.vx = Math.cos(angleRad) * velocity;
		p.vy = -Math.sin(angleRad) * velocity;
		p.ticks = 0;
		p.total = Math.max(60, opts.ticks * (0.9 + Math.random() * 0.2));
		p.w = rand(6, 9) * opts.scalar;
		p.h = rand(10, 14) * opts.scalar;
		p.shape = Math.random() < 0.75 ? "rect" : "circle";
		p.color = pick(COLORS);
		p.tilt = rand(0, TWO_PI);
		p.spin = rand(-0.2, 0.2);
		p.gravity = opts.gravity;
		p.drag = opts.drag;
		p.alpha = 1;
		p.fade = rand(0.85, 1);
		live.push(p);
	}

	function drawParticle(p) {
		if (p.alpha <= 0) return;
		ctx.globalAlpha = p.alpha;
		ctx.fillStyle = p.color;
		ctx.beginPath();
		if (p.shape === "rect") {
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.tilt);
			ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
			ctx.restore();
		} else {
			ctx.arc(p.x, p.y, p.w * 0.5, 0, TWO_PI);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}

	function step() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = live.length - 1; i >= 0; i--) {
			const p = live[i];
			p.vx *= 1 - p.drag;
			p.vy *= 1 - p.drag;
			p.vy += p.gravity;
			p.x += p.vx;
			p.y += p.vy;
			p.tilt += p.spin;
			p.ticks++;
			const lifeRatio = p.ticks / p.total;
			p.alpha = Math.max(0, 1 - lifeRatio * p.fade);
			drawParticle(p);
			if (p.ticks >= p.total || p.y > ch / dpr + 40 || p.x < -40 || p.x > cw / dpr + 40) {
				pool.push(live.splice(i, 1)[0]);
			}
		}
		raf = requestAnimationFrame(step);
	}

	let raf = requestAnimationFrame(step);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) cancelAnimationFrame(raf);
		else raf = requestAnimationFrame(step);
	});

	function toViewport(x, y) {
		return [x * (cw / dpr), y * (ch / dpr)];
	}

	function fire(options = {}) {
		const opts = { ...DEFAULTS, ...options };
		const [ox, oy] = toViewport(opts.origin.x, opts.origin.y);
		const count = Math.max(10, opts.count | 0);
		for (let i = 0; i < count; i++) createParticle(ox, oy, opts);
	}

	function burstAt(x, y, options = {}) {
		const opts = { ...DEFAULTS, ...options };
		const count = Math.max(10, opts.count | 0);
		for (let i = 0; i < count; i++) createParticle(x, y, opts);
	}

	function clearAll() {
		while (live.length) pool.push(live.pop());
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	window.confetti = { fire, burstAt, clear: clearAll, defaults: DEFAULTS };

	return {
		provide: {
			triggerTextScramble: triggerScramble,
			rotateImagesRandom,
			resetImageRotations,
		},
	};
});
