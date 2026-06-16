const Camera = {
    x: 0, y: 0, targetX: 0, targetY: 0, levelWidth: 0, levelHeight: 0,
    setBounds(w, h) { this.levelWidth = w; this.levelHeight = h; },
    snapTo(x, y) { this.x = x; this.y = y; this.targetX = x; this.targetY = y; this.clamp(); },
    follow(tx, ty, tvx = 0) {
        const lookAhead = tvx * CONFIG.CAMERA_LOOKAHEAD / CONFIG.PLAYER_MAX_SPEED;
        this.targetX = tx - CONFIG.CANVAS_WIDTH / 2 + lookAhead;
        this.targetY = ty - CONFIG.CANVAS_HEIGHT / 2 + 40;
        this.x += (this.targetX - this.x) * CONFIG.CAMERA_LERP;
        this.y += (this.targetY - this.y) * CONFIG.CAMERA_LERP;
        this.clamp();
    },
    clamp() {
        if (this.levelWidth <= CONFIG.CANVAS_WIDTH) this.x = (this.levelWidth - CONFIG.CANVAS_WIDTH) / 2;
        else { if (this.x < 0) this.x = 0; if (this.x > this.levelWidth - CONFIG.CANVAS_WIDTH) this.x = this.levelWidth - CONFIG.CANVAS_WIDTH; }
        if (this.levelHeight <= CONFIG.CANVAS_HEIGHT) this.y = (this.levelHeight - CONFIG.CANVAS_HEIGHT) / 2;
        else { if (this.y < 0) this.y = 0; if (this.y > this.levelHeight - CONFIG.CANVAS_HEIGHT) this.y = this.levelHeight - CONFIG.CANVAS_HEIGHT; }
    }
};