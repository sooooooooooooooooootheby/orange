<template>
	<canvas id="confetti-canvas"></canvas>
</template>

<script setup>
onMounted(() => {
	const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const COLORS = ["#ef4444", "#f59e0b", "#fbbf24", "#10b981", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#14b8a6"];
	const TWO_PI = Math.PI * 2;

	// ===== 初始化 Canvas =====
	const canvas = document.getElementById("confetti-canvas");
	const ctx = canvas.getContext("2d");
	let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
	let cw = 0,
		ch = 0;

	const resize = () => {
		const { innerWidth: w, innerHeight: h } = window;
		dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		cw = canvas.width;
		ch = canvas.height;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();
	window.addEventListener("resize", resize, { passive: true });

	// ===== 粒子系统 =====
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
		startVelocity: 10,
		gravity: 0.1,
		drag: 0.002,
		ticks: prefersReduced ? 80 : 160,
		scalar: 1,
		origin: { x: 0.5, y: 0.95 }, // 底部
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
		const a = p.alpha;
		if (a <= 0) return;
		ctx.globalAlpha = a;
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

	window.confetti = { fire };

	// 绑定按钮
	const shootBtn = document.getElementById("shoot");
	if (shootBtn) {
		shootBtn.addEventListener("click", () => {
			fire({ count: 200, spread: 75, startVelocity: 20, origin: { x: 0.5, y: 0.95 }, angle: 90 });
		});
	}
});
</script>

<style>
#confetti-canvas {
	position: fixed;
	inset: 0;
	width: 100vw;
	height: 100vh;
	z-index: 9999;
	pointer-events: none; /* 不挡交互 */
	display: block;
	filter: saturate(1.05);
}
</style>
