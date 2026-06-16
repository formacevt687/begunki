const Input = {
    keys: {},
    justPressed: {},
    justReleased: {},

    init() {
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.justReleased[e.code] = true;
        });

        window.addEventListener('blur', () => {
            this.keys = {};
            this.justPressed = {};
            this.justReleased = {};
        });
    },

    isDown(code) {
        return !!this.keys[code];
    },

    isJustPressed(code) {
        return !!this.justPressed[code];
    },

    isJustReleased(code) {
        return !!this.justReleased[code];
    },

    left() {
        return this.isDown('KeyA') || this.isDown('ArrowLeft');
    },

    right() {
        return this.isDown('KeyD') || this.isDown('ArrowRight');
    },

    jump() {
        return this.isJustPressed('Space');
    },

    jumpHeld() {
        return this.isDown('Space');
    },

    pause() {
        return this.isJustPressed('Escape');
    },

    endFrame() {
        this.justPressed = {};
        this.justReleased = {};
    }
};