class MovingPlatform {
    constructor(x, y, width, dx, dy, speed) {
        this.x = x; this.y = y; this.width = width; this.height = 12;
        this.startX = x; this.startY = y; this.dx = dx; this.dy = dy; this.speed = speed;
        this.t = 0; this.prevX = x; this.prevY = y; this.deltaX = 0; this.deltaY = 0;
    }
    update() {
        this.prevX = this.x; this.prevY = this.y;
        this.t += this.speed;
        const s = Math.sin(this.t);
        this.x = this.startX + this.dx * (s * 0.5 + 0.5);
        this.y = this.startY + this.dy * (s * 0.5 + 0.5);
        this.deltaX = this.x - this.prevX; this.deltaY = this.y - this.prevY;
    }
    draw(ctx, camX, camY) {
        const x = Math.floor(this.x - camX), y = Math.floor(this.y - camY);
        ctx.fillStyle = '#8b6f47'; ctx.fillRect(x, y, this.width, this.height);
        ctx.fillStyle = '#a68a5c'; ctx.fillRect(x, y, this.width, 3);
        ctx.fillStyle = '#5a4528'; ctx.fillRect(x, y + this.height - 2, this.width, 2);
        ctx.fillStyle = '#3a2f1a';
        for (let i = 6; i < this.width - 4; i += 14) ctx.fillRect(x + i, y + 5, 2, 2);
    }
}

class DisappearingPlatform {
    constructor(x, y, width) {
        this.x = x; this.y = y; this.width = width; this.height = 12;
        this.state = 'solid'; this.timer = 0; this.shakeOffset = 0;
    }
    trigger() { if (this.state === 'solid') { this.state = 'shaking'; this.timer = 0; } }
    update() {
        this.timer++;
        if (this.state === 'shaking') {
            this.shakeOffset = (Math.random() - 0.5) * 4;
            if (this.timer >= 30) { this.state = 'gone'; this.timer = 0; this.shakeOffset = 0; }
        } else if (this.state === 'gone') {
            if (this.timer >= 120) { this.state = 'respawning'; this.timer = 0; }
        } else if (this.state === 'respawning') {
            if (this.timer >= 90) { this.state = 'solid'; this.timer = 0; }
        }
    }
    isSolid() { return this.state === 'solid' || this.state === 'shaking'; }
    draw(ctx, camX, camY) {
        if (this.state === 'gone') return;
        let alpha = 1;
        if (this.state === 'respawning') alpha = 0.3 + 0.7 * (this.timer / 90);
        const x = Math.floor(this.x - camX + this.shakeOffset), y = Math.floor(this.y - camY);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#c0392b'; ctx.fillRect(x, y, this.width, this.height);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(x, y, this.width, 3);
        ctx.fillStyle = '#f1c40f';
        for (let i = 4; i < this.width - 4; i += 10) ctx.fillRect(x + i, y + 5, 4, 2);
        ctx.globalAlpha = 1;
    }
}