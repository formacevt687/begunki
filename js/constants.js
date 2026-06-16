// ============================================================
// CONSTANTS.JS — Глобальные константы игры
// ============================================================

const CONFIG = {
    // Размер канваса
    CANVAS_WIDTH: 960,
    CANVAS_HEIGHT: 540,

    // Размер тайла в пикселях
    TILE_SIZE: 32,

    // Физика игрока
    GRAVITY: 0.65,
    MAX_FALL_SPEED: 14,
    PLAYER_ACCEL: 0.8,
    PLAYER_MAX_SPEED: 5.5,
    PLAYER_FRICTION: 0.82,
    PLAYER_AIR_FRICTION: 0.95,
    JUMP_POWER: 13,
    DOUBLE_JUMP_POWER: 11,
    COYOTE_TIME: 6,          // кадров "прощения" после схода с края
    JUMP_BUFFER: 6,          // кадров буфера нажатия прыжка

    // Игрок
    PLAYER_WIDTH: 24,
    PLAYER_HEIGHT: 30,
    PLAYER_START_LIVES: 3,
    INVULN_TIME: 90,         // кадров неуязвимости после урона

    // Монеты
    COIN_RADIUS: 8,
    COIN_SCORE: 10,

    // Камера
    CAMERA_LERP: 0.12,       // плавность следования
    CAMERA_LOOKAHEAD: 60,    // упреждение по направлению движения

    // Тайлы
    TILE_EMPTY: 0,
    TILE_GROUND: 1,
    TILE_SPIKE: 2,
    TILE_COIN: 3,
    TILE_CHECKPOINT: 4,
    TILE_PORTAL: 5,
    TILE_SECRET: 6,          // секретная монета

    // Цветовая палитра (pixel art)
    COLORS: {
        SKY_TOP: '#4a90e2',
        SKY_BOTTOM: '#b0d4f1',
        GROUND: '#8b5a2b',
        GROUND_TOP: '#6b4423',
        GROUND_DARK: '#5a3818',
        GRASS: '#4caf50',
        GRASS_DARK: '#2e7d32',
        STONE: '#7a7a7a',
        STONE_DARK: '#4a4a4a',
        SPIKE: '#c0c0c0',
        SPIKE_DARK: '#707070',
        COIN: '#ffd700',
        COIN_DARK: '#b8860b',
        COIN_SHINE: '#fffacd',
        CHECKPOINT: '#ff4444',
        CHECKPOINT_ACTIVE: '#44ff44',
        PORTAL: '#9b59b6',
        PORTAL_GLOW: '#e056fd',
        WATER: '#3498db',
        WATER_DARK: '#2980b9',
        PLAYER_SKIN: '#f5c89a',
        PLAYER_HAIR: '#5a3825',
        PLAYER_SHIRT: '#e74c3c',
        PLAYER_PANTS: '#2c3e50',
        PLAYER_BOOTS: '#1a1a1a',
        ENEMY_BODY: '#8e44ad',
        ENEMY_EYE: '#ffffff',
        ENEMY_PUPIL: '#000000',
        ENEMY_JUMPER: '#e67e22',
        ENEMY_FAST: '#c0392b',
        CLOUD: '#ffffff',
        MOUNTAIN_FAR: '#6b7a8f',
        MOUNTAIN_NEAR: '#4a5568',
        TREE_TRUNK: '#5d4037',
        TREE_LEAVES: '#388e3c'
    }
};