class Particle {
    constructor(x, y, vx, vy, color, life, size = 3, gravity = 0.2) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.color = color; this.life = life; this.maxLife = life;
        this.size = size; this.gravity = gravity;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.vy += this.gravity; this.vx *= 0.98; this.life--;
    }
    draw(ctx, camX, camY) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        const s = this.size * (0.5 + alpha * 0.5);
        ctx.fillRect(Math.floor(this.x - camX - s / 2), Math.floor(this.y - camY - s / 2), Math.ceil(s), Math.ceil(s));
        ctx.globalAlpha = 1;
    }
    isDead() { return this.life <= 0; }
}

const Particles = {
    list: [],
    add(p) { this.list.push(p); },
    burst(x, y, count, colors, opts = {}) {
        const { speedMin = 1, speedMax = 4, lifeMin = 20, lifeMax = 40, sizeMin = 2, sizeMax = 5, gravity = 0.2, angleMin = 0, angleMax = Math.PI * 2 } = opts;
        for (let i = 0; i < count; i++) {
            const angle = angleMin + Math.random() * (angleMax - angleMin);
            const speed = speedMin + Math.random() * (speedMax - speedMin);
            this.list.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, colors[Math.floor(Math.random() * colors.length)], lifeMin + Math.random() * (lifeMax - lifeMin), sizeMin + Math.random() * (sizeMax - sizeMin), gravity));
        }
    },
    jumpDust(x, y) { this.burst(x, y, 8, ['#d4a574', '#a67c52', '#8b5a2b'], { angleMin: Math.PI * 0.6, angleMax: Math.PI * 1.4, gravity: 0.15 }); },
    landDust(x, y) { this.burst(x, y, 12, ['#d4a574', '#a67c52', '#8b5a2b'], { angleMin: Math.PI, angleMax: Math.PI * 2, gravity: 0.3 }); },
    coinSparkle(x, y) { this.burst(x, y, 14, ['#ffd700', '#ffed4e', '#fffacd', '#ff8c00'], { speedMax: 5, gravity: 0.1 }); },
    victoryBurst(x, y) { this.burst(x, y, 50, ['#ffd700', '#ff44aa', '#44ff88', '#44aaff', '#ffffff'], { speedMin: 3, speedMax: 8, lifeMin: 40, lifeMax: 80, sizeMin: 3, sizeMax: 6, gravity: 0.15 }); },
    hurtBurst(x, y) { this.burst(x, y, 20, ['#ff0000', '#ff4444', '#ff8888', '#ffffff'], { speedMax: 6, gravity: 0.25 }); },
    update() { for (let i = this.list.length - 1; i >= 0; i--) { this.list[i].update(); if (this.list[i].isDead()) this.list.splice(i, 1); } },
    draw(ctx, camX, camY) { for (const p of this.list) p.draw(ctx, camX, camY); },
    clear() { this.list = []; }
};