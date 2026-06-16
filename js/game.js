const Game = {
    canvas: null, ctx: null, state: 'menu', currentLevelIdx: 0, currentLevel: null, player: null,
    startTime: 0, elapsedTime: 0, pausedTime: 0, pauseStart: 0, frame: 0, lastTime: 0, accumulator: 0, fixedStep: 1000 / 60,

    init() {
        this.canvas = document.getElementById('game-canvas'); this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        Input.init(); Audio.init(); Storage.load(); Levels.init(); UI.init();
        UI.showMainMenu();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },
    loop(currentTime) {
        const delta = currentTime - this.lastTime; this.lastTime = currentTime; this.accumulator += delta;
        if (this.accumulator > 200) this.accumulator = 200;
        while (this.accumulator >= this.fixedStep) { this.update(); this.accumulator -= this.fixedStep; }
        this.render(); Input.endFrame();
        requestAnimationFrame((t) => this.loop(t));
    },
    update() {
        this.frame++;
        if (this.state === 'menu') return;
        if (this.state === 'paused') { if (Input.pause()) this.resume(); return; }
        if (this.state !== 'playing') return;
        if (Input.pause()) { this.pause(); return; }

        this.currentLevel.update(this.frame);
        const result = this.player.update(this.currentLevel);
        if (result === 'dead') { this.onPlayerDead(); return; }

        const interaction = this.currentLevel.checkInteractions(this.player);
        if (interaction === 'dead') { this.onPlayerDead(); return; }
        else if (interaction === 'hurt') { if (this.player.lives <= 0) { this.onPlayerDead(); return; } this.player.respawn(); }
        else if (interaction === 'victory') { this.onLevelComplete(); return; }

        const px = this.player.x + this.player.width / 2, py = this.player.y + this.player.height / 2;
        Camera.follow(px, py, this.player.vx);
        Particles.update();
        this.elapsedTime = (performance.now() - this.startTime - this.pausedTime) / 1000;
        UI.updateHUD(this.player, this.currentLevelIdx, this.elapsedTime);
    },
    render() {
        const ctx = this.ctx; Renderer.clear(ctx);
        if (this.state === 'menu' || this.state === 'gameover' || this.state === 'levelcomplete' || this.state === 'final') {
            Renderer.frame = this.frame; Renderer.drawBackground(ctx, this.frame * 0.5, 0, 'plains'); return;
        }
        if (!this.currentLevel) return;
        const camX = Camera.x, camY = Camera.y;
        Renderer.drawBackground(ctx, camX, camY, this.currentLevel.bgTheme);
        Renderer.drawTiles(ctx, this.currentLevel, camX, camY);
        Renderer.drawEntities(ctx, this.currentLevel, camX, camY);
        if (this.player) this.player.draw(ctx, camX, camY);
        Particles.draw(ctx, camX, camY);
        
        const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
        const gradient = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.8);
        gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);

        if (this.currentLevel.portal) {
            const total = this.currentLevel.coins.filter(c => !c.isSecret).length;
            const collected = this.currentLevel.coins.filter(c => !c.isSecret && c.collected).length;
            if (collected < total) {
                const p = this.currentLevel.portal, px = p.x + p.width / 2 - camX, py = p.y - 10 - camY;
                ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(px - 24, py - 12, 48, 18);
                ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(`🪙 ${collected}/${total}`, px, py - 3);
            }
        }
    },
    startGame() { Audio.init(); Audio.resume(); this.currentLevelIdx = 0; this.loadLevel(this.currentLevelIdx); UI.showHUD(); Audio.startMusic(); },
    loadLevel(idx) {
        this.currentLevelIdx = idx; this.currentLevel = Levels.get(idx);
        if (!this.currentLevel) { this.showFinal(); return; }
        this.player = new Player(this.currentLevel.playerSpawn.x - CONFIG.PLAYER_WIDTH / 2, this.currentLevel.playerSpawn.y - CONFIG.PLAYER_HEIGHT);
        Camera.setBounds(this.currentLevel.width, this.currentLevel.height);
        Camera.snapTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        Particles.clear(); this.startTime = performance.now(); this.pausedTime = 0; this.state = 'playing'; UI.showHUD();
    },
    pause() { if (this.state !== 'playing') return; this.state = 'paused'; this.pauseStart = performance.now(); UI.showPause(); },
    resume() { if (this.state !== 'paused') return; this.state = 'playing'; this.pausedTime += performance.now() - this.pauseStart; UI.hidePause(); },
    restartLevel() { this.loadLevel(this.currentLevelIdx); },
    onPlayerDead() { this.state = 'gameover'; Audio.sfxDeath(); Audio.stopMusic(); UI.showGameOver(); },
    onLevelComplete() {
        this.state = 'levelcomplete'; this.player.state = 'victory'; Audio.sfxVictory();
        Particles.victoryBurst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        Storage.unlockLevel(this.currentLevelIdx); Storage.updateBestCoins(this.currentLevelIdx, this.player.coins); Storage.updateBestTime(this.currentLevelIdx, this.elapsedTime);
        setTimeout(() => UI.showLevelComplete(this.player.coins, this.elapsedTime), 800);
    },
    nextLevel() {
        const nextIdx = this.currentLevelIdx + 1;
        if (nextIdx >= Levels.list.length) this.showFinal();
        else { const lives = this.player.lives, coins = this.player.coins; this.loadLevel(nextIdx); this.player.lives = lives; this.player.coins = coins; }
    },
    showFinal() { this.state = 'final'; Audio.stopMusic(); Audio.sfxVictory(); UI.showFinalScreen(Storage.getTotalCoins(), Storage.getBestTotalTime(), Storage.data.totalDeaths, Storage.getCompletionPercent()); },
    stopGame() { this.state = 'menu'; this.currentLevel = null; this.player = null; Particles.clear(); Audio.stopMusic(); UI.showMainMenu(); }
};

window.addEventListener('load', () => Game.init());