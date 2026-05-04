const C = {
  // Canvas
  W: 1280,
  H: 720,

  // Physics
  GRAVITY:            600,
  PLAYER_SPEED:       180,
  PLAYER_JUMP:        -520,
  BULLET_SPEED:       700,
  ENEMY_BULLET_SPEED: 450,

  // Player stats
  PLAYER_MAX_HEALTH:  5,
  PLAYER_MAX_AMMO:    15,
  SHOOT_COOLDOWN:     220,    // ms

  // Enemy stats
  ENEMY_MAX_HEALTH:   2,
  ENEMY_SPEED:        70,
  ENEMY_VISION:       280,
  ENEMY_SHOOT_CD:     1400,   // ms
  ENEMY_MAX_AMMO:     20,

  // Tilesize (pixel-art grid)
  TILE: 16,
  PX:   3,     // pixels per "art pixel" (16px art → 48px rendered)

  // Colors (Phaser hex)
  COL: {
    SKY_TOP:      0x0A0F1A,
    SKY_BOT:      0x1A2A1A,
    GROUND:       0x2A1E0F,
    PLATFORM:     0x3D4A2E,
    PLATFORM_MOV: 0x1A5A3A,
    PLAYER_SKIN:  0xC8935A,
    PLAYER_SUIT:  0x3D5229,
    PLAYER_DARK:  0x2A3A1E,
    ENEMY_SUIT:   0x6B3A2A,
    ENEMY_SKIN:   0xB87A5A,
    BULLET:       0xFFD700,
    ENEMY_BULLET: 0xFF4444,
    HUD_BG:       0x111111,
    HUD_HEALTH:   0x3DBA6F,
    HUD_AMMO:     0xFFD700,
    LIGHT_WARM:   0xFFEEAA,
    MUZZLE:       0xFFAA00,
    BLOOD:        0xAA1111,
    OBJECTIVE:    0xFFDD44,
  }
};
