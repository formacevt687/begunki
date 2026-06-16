class Enemy {
    constructor(x, y, type = 'patrol') {
        this.x = x; this.y = y; this.width = 26; this.height = 26;
        this.type = type; this.vx = 0; this.vy = 0; this.alive = true;
        this.facing = 1; this.patrolRange = 100; this.startX = x;
        this.speed = this._getSpeed(); this.jumpTimer = 0; this.onGround = false;
        this.animPhase = 0; this.squash = 1;
    }
    _getSpeed() { return this.type === 'patrol' ? 1.2 : this.type === 'jumper' ? 0.8 : 2.8; }
    update(level) {
        if (!this.alive) return;
        this.animPhase += 0.15;
        if (this.type === 'patrol' || this.type === 'fast') {
            this.vx = this.speed * this.facing; this.x += this.vx;
            if (this.x > this.startX + this.patrolRange) this.facing = -1;
            else if (this.x < this.startX - this.patrolRange) this.facing = 1;
            const aheadX = this.x + (this.facing > 0 ? this.width : 0);
            const feetY = this.y + this.height + 2;
            const tileX = Math.floor(aheadX / CONFIG.TILE_SIZE), tileY = Math.floor(feetY / CONFIG.TILE_SIZE);
            if (level.getTile(tileX, tileY) !== CONFIG.TILE_GROUND && !level.getPlatformAt(aheadX, feetY)) {
                this.facing *= -1; this.x += this.vx * 2;
            }
            this.vy += CONFIG.GRAVITY; if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
            this.y += this.vy; level.resolveEnemyCollisions(this);
        } else if (this.type === 'jumper') {
            this.jumpTimer++;
            if (this.onGround && this.jumpTimer > 60) { this.vy = -10; this.onGround = false; this.jumpTimer = 0; this.squash = 1.3; }
            this.vy += CONFIG.GRAVITY; if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
            this.y += this.vy; level.resolveEnemyCollisions(this);
            this.squash += (1 - this.squash) * 0.15;
        }
    }
    draw(ctx, camX, camY) {
        if (!this.alive) return;
        const x = Math.floor(this.x - camX), y = Math.floor(this.y - camY);
        const w = this.width, h = this.height * this.squash, yOff = this.height - h;
        let bodyColor = CONFIG.COLORS.ENEMY_BODY, darkColor = '#5e2d79';
        if (this.type === 'jumper') { bodyColor = CONFIG.COLORS.ENEMY_JUMPER; darkColor = '#a04e00'; }
        else if (this.type === 'fast') { bodyColor = CONFIG.COLORS.ENEMY_FAST; darkColor = '#7a1f1f'; }
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + this.height + 2, w / 2, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bodyColor; ctx.fillRect(x, y + yOff, w, h);
        ctx.fillStyle = darkColor; ctx.fillRect(x, y + yOff + h - 4, w, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x, y + yOff, w, 3);
        const eyeY = y + yOff + h * 0.35, eyeOffset = this.facing > 0 ? 3 : -3;
        ctx.fillStyle = CONFIG.COLORS.ENEMY_EYE;
        ctx.fillRect(x + 5, eyeY, 6, 6); ctx.fillRect(x + w - 11, eyeY, 6, 6);
        ctx.fillStyle = CONFIG.COLORS.ENEMY_PUPIL;
        ctx.fillRect(x + 5 + 2 + eyeOffset, eyeY + 2, 3, 3); ctx.fillRect(x + w - 11 + 2 + eyeOffset, eyeY + 2, 3, 3);
        ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + yOff + h * 0.7, w - 12, 2);
        ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 8 + i * 4, y + yOff + h * 0.7, 2, 3);
        if (this.type === 'fast') {
            ctx.fillStyle = darkColor;
            for (let i = 0; i < 3; i++) { const sx = x + 4 + i * 8; ctx.beginPath(); ctx.moveTo(sx, y + yOff); ctx.lineTo(sx + 4, y + yOff - 4); ctx.lineTo(sx + 8, y + yOff); ctx.closePath(); ctx.fill(); }
        }
    }
}