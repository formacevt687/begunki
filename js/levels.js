const Levels = {
    list: [],
    init() {
        const l1 = [
            "................................................................................",
            "................................................................................",
            "................................................................................",
            "..............................o.o...............................................",
            ".............................#####..............................................",
            "................................................................................",
            "...................o.o..........................................................",
            "..................#####..................o.o.o..................................",
            "........................................#######.................................",
            "........o.o.o....................................C..............................",
            ".......#######...................................##.............................",
            "............................................................o.o.................",
            "S....................................................o.....#####................",
            "####.......###........###.........###.........###...###............###.......P..",
            "####.......###........###.........###.........###...###............###......####",
            "################################################################################"
        ];
        this.list.push(new Level({ name: 'Green Hills', map: l1, bgTheme: 'plains', enemies: [{ x: 500, y: 400, type: 'patrol', range: 80 }, { x: 1400, y: 400, type: 'patrol', range: 100 }], movingPlatforms: [], disappearingPlatforms: [] }));

        const l2 = [
            "................................................................................",
            "................................................................................",
            "...............o.o.o............................................................",
            "..............#######...........................................................",
            "..................................*............................................",
            ".................................###............................................",
            "....................o.o...........................o.o...........................",
            "...................#####.........................#####..........................",
            "...........................................................o.o.o................",
            "..........C.................................................#######.............",
            "..........##.........o.o.o......................................................",
            "..........##........#######..................C..................................",
            "S............................................##.......o.o.......................",
            "####......^^^.....####.......^^^......####...##......#####.....###.........P....",
            "####......^^^.....####.......^^^......####...##......#####.....###........####..",
            "################################################################################"
        ];
        this.list.push(new Level({ name: 'Crystal Caves', map: l2, bgTheme: 'cave', enemies: [{ x: 600, y: 380, type: 'patrol', range: 70 }, { x: 1100, y: 380, type: 'jumper' }, { x: 1700, y: 380, type: 'patrol', range: 90 }], movingPlatforms: [{ x: 850, y: 360, width: 80, dx: 100, dy: 0, speed: 0.02 }], disappearingPlatforms: [{ x: 1450, y: 380, width: 80 }, { x: 1580, y: 340, width: 64 }] }));

        const l3 = [
            "................................................................................",
            "................................*...............................................",
            "...............................###..............................................",
            "....................o.o.o.......................................................",
            "...................#######...............................o.o.o..................",
            "..........................................................#####.................",
            ".........o.o...................................C.................................",
            "........####.................................####...............................",
            ".................................................................o.o............",
            "................C.................................................###...........",
            "...............####.........o.o.o................................................",
            "................####.......#######........C.....................................",
            "S........................................####.......o.o.o.......................",
            "####..^^^..###...^^^..###..^^^..###..^^..####..###..#####..###..^^^..###...P....",
            "####..^^^..###...^^^..###..^^^..###..^^..####..###..#####..###..^^^..###..####..",
            "################################################################################"
        ];
        this.list.push(new Level({ name: 'Sunset Peak', map: l3, bgTheme: 'sunset', enemies: [{ x: 450, y: 380, type: 'fast', range: 120 }, { x: 900, y: 380, type: 'jumper' }, { x: 1300, y: 380, type: 'patrol', range: 80 }, { x: 1700, y: 380, type: 'fast', range: 100 }, { x: 2050, y: 380, type: 'jumper' }], movingPlatforms: [{ x: 700, y: 340, width: 70, dx: 0, dy: 80, speed: 0.025 }, { x: 1550, y: 340, width: 70, dx: 90, dy: 0, speed: 0.03 }], disappearingPlatforms: [{ x: 1050, y: 380, width: 64 }, { x: 1150, y: 340, width: 64 }, { x: 1850, y: 380, width: 64 }, { x: 1950, y: 340, width: 64 }] }));
    },
    get(idx) { return this.list[idx]; }
};

class Level {
    constructor(config) {
        this.name = config.name; this.map = config.map;
        this.width = config.map[0].length * CONFIG.TILE_SIZE;
        this.height = config.map.length * CONFIG.TILE_SIZE;
        this.bgTheme = config.bgTheme || 'plains';
        this.enemiesConfig = config.enemies || [];
        this.movingPlatforms = config.movingPlatforms || [];
        this.disappearingPlatforms = config.disappearingPlatforms || [];
        this.playerSpawn = { x: 64, y: 64 };
        this.coins = []; this.checkpoints = []; this.portal = null;
        this.enemies = []; this.movPlats = []; this.disPlats = [];
        this._parseMap(); this._spawnEntities();
    }
    _parseMap() {
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const ch = this.map[row][col];
                const x = col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const y = row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                if (ch === 'S') this.playerSpawn = { x, y };
                else if (ch === 'o') this.coins.push(new Coin(x, y, false));
                else if (ch === '*') this.coins.push(new Coin(x, y, true));
                else if (ch === 'C') this.checkpoints.push(new Checkpoint(x, y + CONFIG.TILE_SIZE / 2));
                else if (ch === 'P') this.portal = new Portal(col * CONFIG.TILE_SIZE, row * CONFIG.TILE_SIZE - 24);
            }
        }
    }
    _spawnEntities() {
        for (const e of this.enemiesConfig) { const en = new Enemy(e.x, e.y, e.type); if (e.range) en.patrolRange = e.range; this.enemies.push(en); }
        for (const p of this.movingPlatforms) this.movPlats.push(new MovingPlatform(p.x, p.y, p.width, p.dx || 0, p.dy || 0, p.speed || 0.02));
        for (const p of this.disappearingPlatforms) this.disPlats.push(new DisappearingPlatform(p.x, p.y, p.width));
    }
    getTile(tx, ty) { if (ty < 0 || ty >= this.map.length || tx < 0 || tx >= this.map[0].length) return CONFIG.TILE_EMPTY; const ch = this.map[ty][tx]; if (ch === '#') return CONFIG.TILE_GROUND; if (ch === '^') return CONFIG.TILE_SPIKE; return CONFIG.TILE_EMPTY; }
    isSolidAt(px, py) { return this.getTile(Math.floor(px / CONFIG.TILE_SIZE), Math.floor(py / CONFIG.TILE_SIZE)) === CONFIG.TILE_GROUND; }
    isSpikeAt(px, py) { return this.getTile(Math.floor(px / CONFIG.TILE_SIZE), Math.floor(py / CONFIG.TILE_SIZE)) === CONFIG.TILE_SPIKE; }
    getPlatformAt(px, py) {
        for (const p of this.movPlats) if (px >= p.x && px <= p.x + p.width && py >= p.y && py <= p.y + p.height) return p;
        for (const p of this.disPlats) if (p.isSolid() && px >= p.x && px <= p.x + p.width && py >= p.y && py <= p.y + p.height) return p;
        return null;
    }
    resolvePlayerHorizontal(p) {
        const pts = [[p.x, p.y + 2], [p.x + p.width, p.y + 2], [p.x, p.y + p.height / 2], [p.x + p.width, p.y + p.height / 2], [p.x, p.y + p.height - 2], [p.x + p.width, p.y + p.height - 2]];
        for (const [px, py] of pts) {
            if (this.isSolidAt(px, py)) {
                const tx = Math.floor(px / CONFIG.TILE_SIZE);
                if (p.vx > 0) p.x = tx * CONFIG.TILE_SIZE - p.width - 0.01;
                else if (p.vx < 0) p.x = (tx + 1) * CONFIG.TILE_SIZE + 0.01;
                p.vx = 0; break;
            }
        }
    }
    resolvePlayerVertical(p) {
        const pts = [[p.x + 2, p.y + p.height], [p.x + p.width - 2, p.y + p.height], [p.x + p.width / 2, p.y + p.height]];
        if (p.vy >= 0) {
            for (const [px, py] of pts) {
                if (this.isSolidAt(px, py)) { p.y = Math.floor(py / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE - p.height; p.vy = 0; p.onGround = true; p.canDoubleJump = true; break; }
            }
            if (!p.onGround) {
                for (const pl of this.movPlats) if (this._isOnPlatform(p, pl)) { p.y = pl.y - p.height; p.vy = 0; p.onGround = true; p.canDoubleJump = true; p.onMovingPlatform = pl; break; }
                if (!p.onGround) for (const pl of this.disPlats) if (pl.isSolid() && this._isOnPlatform(p, pl)) { p.y = pl.y - p.height; p.vy = 0; p.onGround = true; p.canDoubleJump = true; pl.trigger(); break; }
            }
        }
        if (p.vy < 0) {
            const ptsTop = [[p.x + 2, p.y], [p.x + p.width - 2, p.y], [p.x + p.width / 2, p.y]];
            for (const [px, py] of ptsTop) {
                if (this.isSolidAt(px, py)) { p.y = (Math.floor(py / CONFIG.TILE_SIZE) + 1) * CONFIG.TILE_SIZE + 0.01; p.vy = 0; break; }
            }
        }
    }
    _isOnPlatform(p, pl) {
        const pb = p.y + p.height, ppb = pb - p.vy;
        return p.x + p.width > pl.x + 2 && p.x < pl.x + pl.width - 2 && pb >= pl.y && pb <= pl.y + pl.height + 4 && ppb <= pl.y + 2 && p.vy >= 0;
    }
    resolveEnemyCollisions(e) {
        const pts = [[e.x + 2, e.y + e.height], [e.x + e.width - 2, e.y + e.height], [e.x + e.width / 2, e.y + e.height]];
        e.onGround = false;
        for (const [px, py] of pts) {
            if (this.isSolidAt(px, py)) { e.y = Math.floor(py / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE - e.height; e.vy = 0; e.onGround = true; break; }
        }
    }
    update(frame) {
        for (const c of this.coins) c.update(frame);
        for (const c of this.checkpoints) c.update();
        if (this.portal) this.portal.update();
        for (const e of this.enemies) e.update(this);
        for (const p of this.movPlats) p.update();
        for (const p of this.disPlats) p.update();
    }
    _aabb(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }
    checkInteractions(p) {
        const px = p.x, py = p.y, pw = p.width, ph = p.height;
        for (const [x, y] of [[px + 3, py + ph - 3], [px + pw - 3, py + ph - 3], [px + 3, py + ph / 2], [px + pw - 3, py + ph / 2]]) {
            if (this.isSpikeAt(x, y)) return p.takeDamage() ? 'dead' : 'hurt';
        }
        for (const c of this.coins) {
            if (c.collected) continue;
            if (Math.hypot((px + pw / 2) - c.x, (py + ph / 2) - c.y) < c.radius + pw / 2 - 4) {
                c.collected = true; p.coins++; Audio.sfxCoin(); Particles.coinSparkle(c.x, c.y);
            }
        }
        for (const cp of this.checkpoints) {
            if (!cp.activated && this._aabb(px, py, pw, ph, cp.x - 8, cp.y - cp.height, cp.width + 16, cp.height)) { cp.activate(); p.lastCheckpoint = cp; }
        }
        for (const e of this.enemies) {
            if (e.alive && this._aabb(px, py, pw, ph, e.x, e.y, e.width, e.height)) return p.takeDamage() ? 'dead' : 'hurt';
        }
        if (this.portal) {
            const total = this.coins.filter(c => !c.isSecret).length;
            const collected = this.coins.filter(c => !c.isSecret && c.collected).length;
            if (collected >= total && this._aabb(px, py, pw, ph, this.portal.x, this.portal.y, this.portal.width, this.portal.height)) return 'victory';
        }
        return 'ok';
    }
}