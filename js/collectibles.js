class Coin {
    constructor(x, y, isSecret = false) {
        this.x = x; this.y = y; this.baseY = y; this.radius = CONFIG.COIN_RADIUS;
        this.collected = false; this.isSecret = isSecret;
        this.phase = Math.random() * Math.PI * 2; this.rotation = Math.random() * Math.PI * 2;
    }
    update(frame) {
        this.y = this.baseY + Math.sin(frame * 0.08 + this.phase) * 3;
        this.rotation += 0.12;
    }
    draw(ctx, camX, camY) {
        if (this.collected) return;
        const x = Math.floor(this.x - camX), y = Math.floor(this.y - camY);
        const scaleX = Math.abs(Math.cos(this.rotation));
        const w = this.radius * 2 * Math.max(0.2, scaleX), h = this.radius * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(x, y + this.radius + 3, w / 2, 2, 0, 0, Math.PI * 2); ctx.fill();
        const color = this.isSecret ? '#e056fd' : CONFIG.COLORS.COIN;
        const dark = this.isSecret ? '#8e44ad' : CONFIG.COLORS.COIN_DARK;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
        if (scaleX > 0.5) {
            ctx.fillStyle = this.isSecret ? '#ffffff' : CONFIG.COLORS.COIN_SHINE;
            ctx.beginPath(); ctx.ellipse(x - w * 0.2, y - h * 0.2, w * 0.15, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (scaleX > 0.3) {
            ctx.fillStyle = dark; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.isSecret ? '★' : '$', x, y + 1);
        }
    }
}

class Checkpoint {
    constructor(x, y) { this.x = x; this.y = y; this.width = 16; this.height = 40; this.activated = false; this.wavePhase = 0; }
    activate() {
        if (!this.activated) {
            this.activated = true; Audio.sfxCheckpoint();
            Particles.burst(this.x, this.y - 20, 15, ['#44ff44', '#88ff88', '#ffffff'], { speedMin: 1, speedMax: 4, lifeMin: 20, lifeMax: 40 });
        }
    }
    update() { this.wavePhase += 0.1; }
    draw(ctx, camX, camY) {
        const x = Math.floor(this.x - camX), y = Math.floor(this.y - camY);
        ctx.fillStyle = '#3a2f1a'; ctx.fillRect(x, y - this.height, 3, this.height);
        const flagColor = this.activated ? CONFIG.COLORS.CHECKPOINT_ACTIVE : CONFIG.COLORS.CHECKPOINT;
        ctx.fillStyle = flagColor;
        const wave = Math.sin(this.wavePhase) * 2;
        ctx.beginPath(); ctx.moveTo(x + 3, y - this.height); ctx.lineTo(x + 20 + wave, y - this.height + 6); ctx.lineTo(x + 3, y - this.height + 12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
        if (this.activated) { ctx.fillStyle = 'rgba(68, 255, 68, 0.2)'; ctx.beginPath(); ctx.arc(x + 10, y - this.height + 6, 18, 0, Math.PI * 2); ctx.fill(); }
    }
}

class Portal {
    constructor(x, y) { this.x = x; this.y = y; this.width = 40; this.height = 56; this.phase = 0; }
    update() { this.phase += 0.08; }
    draw(ctx, camX, camY) {
        const cx = Math.floor(this.x - camX + this.width / 2), cy = Math.floor(this.y - camY + this.height / 2);
        const pulse = 0.7 + Math.sin(this.phase) * 0.3;
        const gradient = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
        gradient.addColorStop(0, `rgba(224, 86, 253, ${0.6 * pulse})`); gradient.addColorStop(1, 'rgba(155, 89, 182, 0)');
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 3; i++) {
            const r = 15 + i * 5 + Math.sin(this.phase + i) * 2;
            ctx.strokeStyle = i % 2 === 0 ? CONFIG.COLORS.PORTAL_GLOW : CONFIG.COLORS.PORTAL; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 6 + Math.sin(this.phase * 2) * 2, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 6; i++) {
            const a = this.phase * 2 + i * (Math.PI / 3);
            ctx.fillStyle = CONFIG.COLORS.PORTAL_GLOW;
            ctx.fillRect(Math.floor(cx + Math.cos(a) * 25 - 1), Math.floor(cy + Math.sin(a) * 25 - 1), 3, 3);
        }
    }
}