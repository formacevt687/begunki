const Storage = {
    KEY: 'treasure_dash_save_v1',
    defaultData: {
        unlockedLevels: 1,
        bestCoins: [0, 0, 0],
        bestTimes: [Infinity, Infinity, Infinity],
        totalDeaths: 0,
        musicVolume: 0.5,
        sfxVolume: 0.7
    },
    data: null,

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            this.data = raw ? { ...this.defaultData, ...JSON.parse(raw) } : { ...this.defaultData };
        } catch (e) {
            this.data = { ...this.defaultData };
        }
        Audio.setMusicVolume(this.data.musicVolume);
        Audio.setSfxVolume(this.data.sfxVolume);
    },

    save() {
        try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
    },

    unlockLevel(idx) {
        if (idx + 1 > this.data.unlockedLevels) {
            this.data.unlockedLevels = idx + 1;
            this.save();
        }
    },

    updateBestCoins(idx, coins) {
        if (coins > this.data.bestCoins[idx]) { this.data.bestCoins[idx] = coins; this.save(); }
    },

    updateBestTime(idx, time) {
        if (time < this.data.bestTimes[idx]) { this.data.bestTimes[idx] = time; this.save(); }
    },

    addDeath() { this.data.totalDeaths++; this.save(); },
    
    getTotalCoins() { return this.data.bestCoins.reduce((a, b) => a + b, 0); },
    getBestTotalTime() { const t = this.data.bestTimes.filter(x => x !== Infinity); return t.length ? t.reduce((a, b) => a + b, 0) : 0; },
    getCompletionPercent() { return Math.min(100, Math.round((this.data.unlockedLevels / Levels.list.length) * 100)); }
};