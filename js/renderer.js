const Renderer = {
    frame: 0,
    clear(ctx) { ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT); },
    drawBackground(ctx, camX, camY, theme) {
        const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
        let topColor = '#4a90e2', bottomColor = '#b0d4f1';
        if (theme === 'cave') { topColor = '#1a1a2e'; bottomColor = '#3d3d5c'; }
        else if (theme === 'sunset') { topColor = '#ff6b6b'; bottomColor = '#ffd93d'; }
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, topColor); grad.addColorStop(1, bottomColor);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

        if (theme === 'sunset') {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.8)'; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.4, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 230, 150, 0.4)'; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.4, 80, 0, Math.PI * 2); ctx.fill();
        } else if (theme === 'cave') {
            for (let i = 0; i < 8; i++) {
                const cx = (i * 130 - camX * 0.1) % (W + 100);
                ctx.fillStyle = `rgba(150, 100, 255, ${0.3 + Math.sin(this.frame * 0.05 + i) * 0.2})`;
                ctx.beginPath(); ctx.arc(cx, 20 + Math.sin(i * 1.3) * 10, 4, 0, Math.PI * 2); ctx.fill();
            }
        } else {
            ctx.fillStyle = 'rgba(255, 240, 150, 0.9)'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 35, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 240, 150, 0.3)'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 55, 0, Math.PI * 2); ctx.fill();
        }

        if (theme !== 'cave') {
            ctx.fillStyle = theme === 'sunset' ? 'rgba(255, 200, 180, 0.7)' : CONFIG.COLORS.CLOUD;
            for (const c of [{ x: 100, y: 80, s: 1.0 }, { x: 400, y: 50, s: 0.7 }, { x: 700, y: 100, s: 1.2 }, { x: 1100, y: 60, s: 0.9 }, { x: 1500, y: 90, s: 1.1 }]) {
                const x = (c.x - camX * 0.2) % (W + 300) - 100;
                ctx.save(); ctx.translate(x, c.y); ctx.scale(c.s, c.s);
                ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.arc(20, -5, 22, 0, Math.PI * 2); ctx.arc(45, 0, 18, 0, Math.PI * 2); ctx.arc(25, 10, 16, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        for (const parallax of [0.3, 0.5]) {
            const color = theme === 'plains' ? (parallax > 0.4 ? CONFIG.COLORS.MOUNTAIN_NEAR : CONFIG.COLORS.MOUNTAIN_FAR) : theme === 'cave' ? (parallax > 0.4 ? '#2a2a3e' : '#1f1f2e') : (parallax > 0.4 ? '#8b4789' : '#5d3a6e');
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
            const offset = -camX * parallax, peaks = 8, pw = (W + 400) / peaks;
            for (let i = 0; i <= peaks; i++) { const px = i * pw + offset % pw; ctx.lineTo(px, H - 120 - Math.sin(i * 1.7 + parallax * 3) * 60 - (parallax > 0.4 ? 30 : 0)); }
            ctx.lineTo(W + 100, H); ctx.closePath(); ctx.fill();
        }

        if (theme === 'plains' || theme === 'sunset') {
            const offset = -camX * 0.7;
            for (const baseX of [50, 200, 380, 560, 780, 950, 1150, 1380, 1600]) {
                const x = (baseX + offset) % (W + 200) - 50;
                ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK; ctx.fillRect(x, H - 80, 8, 40);
                ctx.fillStyle = CONFIG.COLORS.TREE_LEAVES; ctx.beginPath(); ctx.arc(x + 4, H - 85, 18, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(x - 4, H - 75, 14, 0, Math.PI * 2); ctx.arc(x + 12, H - 75, 14, 0, Math.PI * 2); ctx.fill();
            }
        }
    },
    drawTiles(ctx, level, camX, camY) {
        const startCol = Math.max(0, Math.floor(camX / CONFIG.TILE_SIZE)), endCol = Math.min(level.map[0].length, Math.ceil((camX + CONFIG.CANVAS_WIDTH) / CONFIG.TILE_SIZE) + 1);
        const startRow = Math.max(0, Math.floor(camY / CONFIG.TILE_SIZE)), endRow = Math.min(level.map.length, Math.ceil((camY + CONFIG.CANVAS_HEIGHT) / CONFIG.TILE_SIZE) + 1);
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const ch = level.map[row][col], x = col * CONFIG.TILE_SIZE - camX, y = row * CONFIG.TILE_SIZE - camY;
                if (ch === '#') this._drawGroundTile(ctx, x, y, level.map, row, col);
                else if (ch === '^') this._drawSpike(ctx, x, y);
            }
        }
    },
    _drawGroundTile(ctx, x, y, map, row, col) {
        const S = CONFIG.TILE_SIZE, fx = Math.floor(x), fy = Math.floor(y);
        ctx.fillStyle = CONFIG.COLORS.GROUND; ctx.fillRect(fx, fy, S, S);
        ctx.fillStyle = CONFIG.COLORS.GROUND_DARK;
        const seed = (col * 7 + row * 13) % 5;
        for (let i = 0; i < 3; i++) ctx.fillRect(fx + ((seed + i * 3) * 7) % (S - 4), fy + ((seed + i * 5) * 11) % (S - 4), 2, 2);
        ctx.fillRect(fx, fy + S - 2, S, 2);
        if (row > 0 && map[row - 1][col] !== '#') {
            ctx.fillStyle = CONFIG.COLORS.GRASS; ctx.fillRect(fx, fy, S, 6);
            ctx.fillStyle = CONFIG.COLORS.GRASS_DARK; ctx.fillRect(fx, fy + 5, S, 2);
            ctx.fillStyle = CONFIG.COLORS.GRASS; for (let i = 2; i < S; i += 5) ctx.fillRect(fx + i, fy - 2, 2, 3);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(fx + 0.5, fy + 0.5, S - 1, S - 1);
    },
    _drawSpike(ctx, x, y) {
        const S = CONFIG.TILE_SIZE, fx = Math.floor(x), fy = Math.floor(y);
        ctx.fillStyle = CONFIG.COLORS.SPIKE;
        for (let i = 0; i < 4; i++) { const sx = fx + i * (S / 4); ctx.beginPath(); ctx.moveTo(sx, fy + S); ctx.lineTo(sx + S / 8, fy + 6); ctx.lineTo(sx + S / 4, fy + S); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = CONFIG.COLORS.SPIKE_DARK;
        for (let i = 0; i < 4; i++) { const sx = fx + i * (S / 4); ctx.beginPath(); ctx.moveTo(sx + S / 8, fy + 6); ctx.lineTo(sx + S / 4, fy + S); ctx.lineTo(sx + S / 8 + 2, fy + S); ctx.closePath(); ctx.fill(); }
    },
    drawEntities(ctx, level, camX, camY) {
        for (const p of level.movPlats) p.draw(ctx, camX, camY);
        for (const p of level.disPlats) p.draw(ctx, camX, camY);
        for (const c of level.checkpoints) c.draw(ctx, camX, camY);
        for (const c of level.coins) c.draw(ctx, camX, camY);
        if (level.portal) level.portal.draw(ctx, camX, camY);
        for (const e of level.enemies) e.draw(ctx, camX, camY);
    }
};