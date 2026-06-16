class Player {
    constructor(x, y) {
        this.spawnX = x; this.spawnY = y; this.x = x; this.y = y;
        this.width = CONFIG.PLAYER_WIDTH; this.height = CONFIG.PLAYER_HEIGHT;
        this.vx = 0; this.vy = 0; this.onGround = false; this.facing = 1;
        this.lives = CONFIG.PLAYER_START_LIVES; this.coins = 0;
        this.state = 'idle'; this.invulnTimer = 0; this.canDoubleJump = true;
        this.coyoteTimer = 0; this.jumpBufferTimer = 0;
        this.animFrame = 0; this.animTimer = 0; this.hurtTimer = 0; this.victoryTimer = 0;
        this.onMovingPlatform = null; this.lastCheckpoint = null;
    }
    respawn() {
        if (this.lastCheckpoint) { this.x = this.lastCheckpoint.x; this.y = this.lastCheckpoint.y - this.height; }
        else { this.x = this.spawnX; this.y = this.spawnY; }
        this.vx = 0; this.vy = 0; this.invulnTimer = CONFIG.INVULN_TIME;
        this.onGround = false; this.canDoubleJump = true; this.coyoteTimer = 0; this.jumpBufferTimer = 0; this.state = 'idle';
    }
    takeDamage() {
        if (this.invulnTimer > 0) return;
        this.lives--; this.hurtTimer = 30; this.invulnTimer = CONFIG.INVULN_TIME;
        this.vy = -8; this.vx = -this.facing * 4;
        Audio.sfxHurt(); Particles.hurtBurst(this.x + this.width / 2, this.y + this.height / 2);
        Storage.addDeath();
        return this.lives <= 0;
    }
    update(level) {
        if (this.state === 'victory') { this.victoryTimer++; return; }
        if (this.hurtTimer > 0) { this.hurtTimer--; this.state = 'hurt'; }
        if (this.invulnTimer > 0) this.invulnTimer--;

        let inputX = 0;
        if (Input.left()) inputX -= 1;
        if (Input.right()) inputX += 1;

        if (inputX !== 0) {
            this.vx += inputX * CONFIG.PLAYER_ACCEL; this.facing = inputX;
            if (this.vx > CONFIG.PLAYER_MAX_SPEED) this.vx = CONFIG.PLAYER_MAX_SPEED;
            if (this.vx < -CONFIG.PLAYER_MAX_SPEED) this.vx = -CONFIG.PLAYER_MAX_SPEED;
        } else {
            const friction = this.onGround ? CONFIG.PLAYER_FRICTION : CONFIG.PLAYER_AIR_FRICTION;
            this.vx *= friction; if (Math.abs(this.vx) < 0.05) this.vx = 0;
        }

        if (Input.jump()) this.jumpBufferTimer = CONFIG.JUMP_BUFFER;
        if (this.jumpBufferTimer > 0) this.jumpBufferTimer--;

        if (this.jumpBufferTimer > 0) {
            if (this.onGround || this.coyoteTimer > 0) {
                this.vy = -CONFIG.JUMP_POWER; this.onGround = false; this.coyoteTimer = 0;
                this.jumpBufferTimer = 0; this.canDoubleJump = true;
                Audio.sfxJump(); Particles.jumpDust(this.x + this.width / 2, this.y + this.height);
            } else if (this.canDoubleJump) {
                this.vy = -CONFIG.DOUBLE_JUMP_POWER; this.canDoubleJump = false; this.jumpBufferTimer = 0;
                Audio.sfxDoubleJump();
                Particles.burst(this.x + this.width / 2, this.y + this.height, 10, ['#ffffff', '#aaddff', '#88bbff'], { speedMin: 1, speedMax: 3, lifeMin: 15, lifeMax: 25, gravity: 0.05 });
            }
        }

        if (!Input.jumpHeld() && this.vy < -4) this.vy = -4;

        this.vy += CONFIG.GRAVITY; if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

        if (this.onGround) this.coyoteTimer = CONFIG.COYOTE_TIME;
        else if (this.coyoteTimer > 0) this.coyoteTimer--;

        if (this.onMovingPlatform) { this.x += this.onMovingPlatform.deltaX; this.y += this.onMovingPlatform.deltaY; }

        this.x += this.vx; level.resolvePlayerHorizontal(this);
        const wasOnGround = this.onGround; this.onGround = false; this.onMovingPlatform = null;
        this.y += this.vy; level.resolvePlayerVertical(this);

        if (this.onGround && !wasOnGround && this.vy >= 0) Particles.landDust(this.x + this.width / 2, this.y + this.height);

        if (this.y > level.height + 200) {
            this.lives--; Storage.addDeath(); Audio.sfxDeath();
            if (this.lives <= 0) return 'dead';
            this.respawn(); return 'respawned';
        }

        if (this.hurtTimer > 0) this.state = 'hurt';
        else if (!this.onGround) {
            if (this.vy < 0 && !this.canDoubleJump) this.state = 'doubleJump';
            else if (this.vy < 0) this.state = 'jump';
            else this.state = 'fall';
        } else if (Math.abs(this.vx) > 0.3) this.state = 'run';
        else this.state = 'idle';

        this.animTimer++;
        if (this.animTimer > 6) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        return 'ok';
    }
    draw(ctx, camX, camY) {
        if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 4) % 2 === 0) return;
        const x = Math.floor(this.x - camX), y = Math.floor(this.y - camY);
        const w = this.width, h = this.height;
        ctx.save();
        if (this.facing < 0) { ctx.translate(x + w, y); ctx.scale(-1, 1); } else { ctx.translate(x, y); }

        let bodyOffsetY = 0, legOffset = 0;
        if (this.state === 'run') { bodyOffsetY = Math.abs(Math.sin(this.animFrame * Math.PI / 2)) * 2; legOffset = Math.sin(this.animFrame * Math.PI / 2) * 4; }
        else if (this.state === 'jump' || this.state === 'doubleJump') bodyOffsetY = -2;
        else if (this.state === 'fall') bodyOffsetY = 2;

        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(w / 2, h + 2, w / 2, 3, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = CONFIG.COLORS.PLAYER_PANTS;
        if (this.state === 'run') {
            ctx.fillRect(4, h - 10 + bodyOffsetY, 6, 10 - bodyOffsetY); ctx.fillRect(w - 10, h - 10 + bodyOffsetY, 6, 10 - bodyOffsetY);
            ctx.fillStyle = CONFIG.COLORS.PLAYER_BOOTS; ctx.fillRect(4 + legOffset * 0.3, h - 4, 6, 4); ctx.fillRect(w - 10 - legOffset * 0.3, h - 4, 6, 4);
        } else if (this.state === 'jump' || this.state === 'doubleJump') {
            ctx.fillRect(3, h - 8, 7, 8); ctx.fillRect(w - 10, h - 8, 7, 8);
            ctx.fillStyle = CONFIG.COLORS.PLAYER_BOOTS; ctx.fillRect(3, h - 3, 7, 3); ctx.fillRect(w - 10, h - 3, 7, 3);
        } else {
            ctx.fillRect(5, h - 10 + bodyOffsetY, 6, 10 - bodyOffsetY); ctx.fillRect(w - 11, h - 10 + bodyOffsetY, 6, 10 - bodyOffsetY);
            ctx.fillStyle = CONFIG.COLORS.PLAYER_BOOTS; ctx.fillRect(5, h - 4, 6, 4); ctx.fillRect(w - 11, h - 4, 6, 4);
        }

        ctx.fillStyle = CONFIG.COLORS.PLAYER_SHIRT; ctx.fillRect(3, 10 + bodyOffsetY, w - 6, h - 20);
        ctx.fillStyle = '#b83227'; ctx.fillRect(3, 10 + bodyOffsetY, 2, h - 20);
        ctx.fillStyle = '#3a2f1a'; ctx.fillRect(3, h - 12 + bodyOffsetY, w - 6, 2);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(w / 2 - 2, h - 12 + bodyOffsetY, 4, 2);

        ctx.fillStyle = CONFIG.COLORS.PLAYER_SKIN;
        if (this.state === 'run') { ctx.fillRect(0, 14 + bodyOffsetY - legOffset * 0.3, 4, 10); ctx.fillRect(w - 4, 14 + bodyOffsetY + legOffset * 0.3, 4, 10); }
        else if (this.state === 'jump' || this.state === 'doubleJump') { ctx.fillRect(0, 6 + bodyOffsetY, 4, 10); ctx.fillRect(w - 4, 6 + bodyOffsetY, 4, 10); }
        else if (this.state === 'hurt') { ctx.fillRect(0, 18 + bodyOffsetY, 4, 10); ctx.fillRect(w - 4, 18 + bodyOffsetY, 4, 10); }
        else { ctx.fillRect(0, 14 + bodyOffsetY, 4, 12); ctx.fillRect(w - 4, 14 + bodyOffsetY, 4, 12); }

        ctx.fillStyle = CONFIG.COLORS.PLAYER_SKIN; ctx.fillRect(4, 2 + bodyOffsetY, w - 8, 10);
        ctx.fillStyle = CONFIG.COLORS.PLAYER_HAIR; ctx.fillRect(4, 0 + bodyOffsetY, w - 8, 4); ctx.fillRect(3, 2 + bodyOffsetY, 2, 3);
        ctx.fillStyle = '#fff'; ctx.fillRect(w - 10, 5 + bodyOffsetY, 4, 3);
        ctx.fillStyle = '#000'; ctx.fillRect(w - 8, 5 + bodyOffsetY, 2, 3);
        if (this.state === 'hurt') { ctx.fillStyle = '#000'; ctx.fillRect(w - 10, 10 + bodyOffsetY, 4, 1); }
        else if (this.state === 'victory') { ctx.fillStyle = '#000'; ctx.fillRect(w - 10, 9 + bodyOffsetY, 4, 2); }

        ctx.fillStyle = '#8b5a2b'; ctx.fillRect(2, -2 + bodyOffsetY, w - 4, 3); ctx.fillRect(6, -5 + bodyOffsetY, w - 12, 3);
        ctx.fillStyle = '#5a3818'; ctx.fillRect(2, 0 + bodyOffsetY, w - 4, 1);
        ctx.restore();
    }
}