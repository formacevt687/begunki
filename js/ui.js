const UI = {
    screens: {},
    init() {
        this.screens = {
            mainMenu: document.getElementById('main-menu'), settings: document.getElementById('settings-screen'),
            credits: document.getElementById('credits-screen'), hud: document.getElementById('hud'),
            pause: document.getElementById('pause-screen'), gameover: document.getElementById('gameover-screen'),
            levelComplete: document.getElementById('levelcomplete-screen'), final: document.getElementById('final-screen')
        };
        this.hudLives = document.getElementById('hud-lives'); this.hudCoins = document.getElementById('hud-coins');
        this.hudLevel = document.getElementById('hud-level'); this.hudTime = document.getElementById('hud-time');
        this.musicSlider = document.getElementById('music-volume'); this.sfxSlider = document.getElementById('sfx-volume');
        this.musicVal = document.getElementById('music-val'); this.sfxVal = document.getElementById('sfx-val');
        this._bindButtons(); this._bindSettings();
    },
    _bindButtons() {
        document.getElementById('btn-start').onclick = () => { Audio.sfxClick(); Game.startGame(); };
        document.getElementById('btn-settings').onclick = () => { Audio.sfxClick(); this.showSettings(); };
        document.getElementById('btn-credits').onclick = () => { Audio.sfxClick(); this.showCredits(); };
        document.getElementById('btn-back-settings').onclick = () => { Audio.sfxClick(); this.showMainMenu(); };
        document.getElementById('btn-back-credits').onclick = () => { Audio.sfxClick(); this.showMainMenu(); };
        document.getElementById('btn-continue').onclick = () => { Audio.sfxClick(); Game.resume(); };
        document.getElementById('btn-restart').onclick = () => { Audio.sfxClick(); Game.restartLevel(); };
        document.getElementById('btn-main-menu').onclick = () => { Audio.sfxClick(); this.showMainMenu(); Game.stopGame(); };
        document.getElementById('btn-retry').onclick = () => { Audio.sfxClick(); Game.restartLevel(); };
        document.getElementById('btn-go-menu').onclick = () => { Audio.sfxClick(); this.showMainMenu(); Game.stopGame(); };
        document.getElementById('btn-next-level').onclick = () => { Audio.sfxClick(); Game.nextLevel(); };
        document.getElementById('btn-final-menu').onclick = () => { Audio.sfxClick(); this.showMainMenu(); Game.stopGame(); };
    },
    _bindSettings() {
        this.musicSlider.oninput = () => { const v = parseInt(this.musicSlider.value) / 100; Audio.setMusicVolume(v); Storage.setMusicVolume(v); this.musicVal.textContent = this.musicSlider.value; };
        this.sfxSlider.oninput = () => { const v = parseInt(this.sfxSlider.value) / 100; Audio.setSfxVolume(v); Storage.setSfxVolume(v); this.sfxVal.textContent = this.sfxSlider.value; };
    },
    _showOnly(key) {
        for (const k in this.screens) { if (k === 'hud') continue; const el = this.screens[k]; if (!el) continue; if (k === key) el.classList.remove('hidden'); else el.classList.add('hidden'); }
    },
    showMainMenu() { this._showOnly('mainMenu'); this.screens.hud.classList.add('hidden'); Audio.stopMusic(); },
    showSettings() { this.musicSlider.value = Math.round(Storage.data.musicVolume * 100); this.sfxSlider.value = Math.round(Storage.data.sfxVolume * 100); this.musicVal.textContent = this.musicSlider.value; this.sfxVal.textContent = this.sfxSlider.value; this._showOnly('settings'); },
    showCredits() { this._showOnly('credits'); },
    showHUD() { this._showOnly(null); this.screens.hud.classList.remove('hidden'); },
    showPause() { this.screens.pause.classList.remove('hidden'); },
    hidePause() { this.screens.pause.classList.add('hidden'); },
    showGameOver() { this.screens.gameover.classList.remove('hidden'); },
    showLevelComplete(coins, time) { document.getElementById('lc-coins').textContent = coins; document.getElementById('lc-time').textContent = time.toFixed(1); this.screens.levelComplete.classList.remove('hidden'); },
    showFinalScreen(tc, bt, d, c) { document.getElementById('fs-coins').textContent = tc; document.getElementById('fs-time').textContent = bt.toFixed(1); document.getElementById('fs-deaths').textContent = d; document.getElementById('fs-completion').textContent = c; this._showOnly('final'); },
    updateHUD(p, idx, t) { this.hudLives.textContent = p.lives; this.hudCoins.textContent = p.coins; this.hudLevel.textContent = (idx + 1); this.hudTime.textContent = t.toFixed(1); }
};