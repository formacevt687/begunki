const Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    initialized: false,
    musicInterval: null,

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setMusicVolume(v) {
        this.musicVolume = v;
        if (this.musicGain) {
            this.musicGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
        }
    },

    setSfxVolume(v) {
        this.sfxVolume = v;
        if (this.sfxGain) {
            this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
        }
    },

    playTone(freq, duration, type = 'sine', volume = 0.3, slide = 0, target = null) {
        if (!this.ctx) return;
        this.resume();
        const dest = target || this.sfxGain;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slide !== 0) {
            osc.frequency.exponentialRampToValueAtTime(
                Math.max(20, freq + slide), now + duration
            );
        }

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + duration + 0.02);
    },

    playNoise(duration, volume = 0.2) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        src.connect(gain);
        gain.connect(this.sfxGain);
        src.start(now);
    },

    sfxJump() {
        this.playTone(440, 0.12, 'square', 0.18, 300);
    },

    sfxDoubleJump() {
        this.playTone(600, 0.08, 'square', 0.18, 200);
        setTimeout(() => this.playTone(800, 0.1, 'square', 0.18, 300), 60);
    },

    sfxCoin() {
        this.playTone(988, 0.06, 'square', 0.22);
        setTimeout(() => this.playTone(1319, 0.12, 'square', 0.22), 50);
    },

    sfxHurt() {
        this.playTone(300, 0.3, 'sawtooth', 0.25, -200);
        this.playNoise(0.2, 0.15);
    },

    sfxCheckpoint() {
        this.playTone(523, 0.15, 'triangle', 0.22);
        setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.22), 80);
        setTimeout(() => this.playTone(784, 0.25, 'triangle', 0.22), 160);
    },

    sfxVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.2, 'triangle', 0.25), i * 100);
        });
    },

    sfxClick() {
        this.playTone(800, 0.05, 'square', 0.15);
    },

    sfxDeath() {
        this.playTone(400, 0.15, 'sawtooth', 0.25, -100);
        setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.25, -100), 120);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.25, -150), 240);
    },

    startMusic() {
        if (!this.ctx || this.musicInterval) return;
        this.resume();
        const melody = [
            { f: 262, d: 0.25 }, { f: 330, d: 0.25 },
            { f: 392, d: 0.25 }, { f: 330, d: 0.25 },
            { f: 349, d: 0.25 }, { f: 440, d: 0.25 },
            { f: 523, d: 0.5 },  { f: 0,   d: 0.25 }
        ];
        let idx = 0;
        const playNext = () => {
            const note = melody[idx % melody.length];
            if (note.f > 0) {
                this.playTone(note.f, note.d * 0.9, 'triangle', 0.08, 0, this.musicGain);
                this.playTone(note.f / 2, note.d * 0.9, 'sine', 0.05, 0, this.musicGain);
            }
            idx++;
        };
        playNext();
        this.musicInterval = setInterval(playNext, 250);
    },

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
};