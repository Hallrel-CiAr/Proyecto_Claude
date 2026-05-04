class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.createLoadingBar();
  }

  create() {
    this.createTextures();
    this.scene.start('MenuScene');
  }

  createLoadingBar() {
    const cx = C.W / 2, cy = C.H / 2;
    this.add.rectangle(cx, cy, 400, 30, 0x222222);
    const bar = this.add.rectangle(cx - 198, cy, 4, 26, 0x3DBA6F).setOrigin(0, 0.5);
    this.add.text(cx, cy - 40, 'CARGANDO...', { font: '18px monospace', fill: '#aaaaaa' }).setOrigin(0.5);
    this.load.on('progress', v => { bar.width = 396 * v; });
  }

  // ── Create all game textures programmatically (pixel-art style) ──────────
  createTextures() {
    this.makePlayerTexture();
    this.makeEnemyTexture();
    this.makeSuperSoldierTexture();
    this.makePlatformTexture();
    this.makeGroundTexture();
    this.makeBulletTexture();
    this.makeEnemyBulletTexture();
    this.makePickupTextures();
    this.makeObjectiveTexture();
    this.makeParticleTexture();
    this.makeBackgrounds();
  }

  px(g, col, px, x, y, w, h) {
    g.fillStyle(col);
    g.fillRect(x * px, y * px, w * px, h * px);
  }

  makePlayerTexture() {
    const p = C.PX;
    const g = this.make.graphics({ add: false });
    const draw = (col, x, y, w, h) => this.px(g, col, p, x, y, w, h);

    // Helmet
    draw(C.COL.PLAYER_DARK, 3, 0, 6, 1);
    draw(C.COL.PLAYER_SUIT, 2, 1, 8, 3);
    // Head
    draw(C.COL.PLAYER_SKIN, 3, 4, 6, 4);
    draw(C.COL.PLAYER_DARK, 3, 4, 1, 1); // eye
    draw(C.COL.PLAYER_DARK, 7, 4, 1, 1); // eye
    // Body
    draw(C.COL.PLAYER_SUIT, 2, 8, 8, 6);
    // Belt
    draw(C.COL.PLAYER_DARK, 2, 13, 8, 1);
    // Arms
    draw(C.COL.PLAYER_SUIT, 0, 9, 2, 4);
    draw(C.COL.PLAYER_SUIT, 10, 9, 2, 4);
    // Gun (right, facing right)
    draw(0x333333, 12, 10, 6, 2);
    draw(0x222222, 17, 9,  2, 1);
    // Legs
    draw(C.COL.PLAYER_DARK, 2, 14, 3, 5);
    draw(C.COL.PLAYER_DARK, 7, 14, 3, 5);
    // Boots
    draw(0x1A0A00, 2, 19, 4, 2);
    draw(0x1A0A00, 7, 19, 4, 2);

    g.generateTexture('player', 12 * p, 21 * p);
    g.destroy();

    // Flipped version (facing left)
    const gL = this.make.graphics({ add: false });
    const drawL = (col, x, y, w, h) => this.px(gL, col, p, x, y, w, h);
    drawL(C.COL.PLAYER_DARK, 3, 0, 6, 1);
    drawL(C.COL.PLAYER_SUIT, 2, 1, 8, 3);
    drawL(C.COL.PLAYER_SKIN, 3, 4, 6, 4);
    drawL(C.COL.PLAYER_DARK, 2, 4, 1, 1);
    drawL(C.COL.PLAYER_DARK, 6, 4, 1, 1);
    drawL(C.COL.PLAYER_SUIT, 2, 8, 8, 6);
    drawL(C.COL.PLAYER_DARK, 2, 13, 8, 1);
    drawL(C.COL.PLAYER_SUIT, 0, 9, 2, 4);
    drawL(C.COL.PLAYER_SUIT, 10, 9, 2, 4);
    drawL(0x333333, -6, 10, 6, 2);
    drawL(0x222222, -7, 9,  2, 1);
    drawL(C.COL.PLAYER_DARK, 2, 14, 3, 5);
    drawL(C.COL.PLAYER_DARK, 7, 14, 3, 5);
    drawL(0x1A0A00, 2, 19, 4, 2);
    drawL(0x1A0A00, 7, 19, 4, 2);
    gL.generateTexture('player_left', 12 * p, 21 * p);
    gL.destroy();
  }

  makeEnemyTexture() {
    const p = C.PX;
    const g = this.make.graphics({ add: false });
    const draw = (col, x, y, w, h) => this.px(g, col, p, x, y, w, h);

    draw(0x5A2A1A, 3, 0, 6, 3);   // helmet
    draw(C.COL.ENEMY_SKIN, 3, 3, 6, 4);  // head
    draw(0x300000, 4, 4, 1, 1);   // eye
    draw(0x300000, 7, 4, 1, 1);   // eye
    draw(C.COL.ENEMY_SUIT, 2, 7, 8, 6);  // body
    draw(0x440000, 2, 12, 8, 1);  // belt
    draw(C.COL.ENEMY_SUIT, 0, 8, 2, 4);  // arm L
    draw(C.COL.ENEMY_SUIT, 10, 8, 2, 4); // arm R
    draw(0x333333, 12, 9, 6, 2);  // gun R
    draw(C.COL.ENEMY_SUIT, 2, 13, 3, 5); // leg L
    draw(C.COL.ENEMY_SUIT, 7, 13, 3, 5); // leg R
    draw(0x1A0A00, 2, 18, 4, 2);  // boot L
    draw(0x1A0A00, 7, 18, 4, 2);  // boot R

    g.generateTexture('enemy', 12 * p, 20 * p);
    g.destroy();
  }

  makeSuperSoldierTexture() {
    const p = C.PX;
    const g = this.make.graphics({ add: false });
    const draw = (col, x, y, w, h) => this.px(g, col, p, x, y, w, h);

    // Bigger, armored super soldier
    draw(0x1A1A3A, 2, 0, 10, 3);  // helmet
    draw(0x2A2A5A, 1, 3, 12, 5);  // armored head
    draw(0x0000AA, 3, 4, 2, 1);   // visor glow
    draw(0x0000AA, 9, 4, 2, 1);
    draw(0x1A1A3A, 0, 8, 14, 8);  // heavy armor body
    draw(0x0000AA, 2, 9, 2, 2);   // chest light
    draw(0x0000AA, 10, 9, 2, 2);
    draw(0x1A1A3A, -2, 9, 3, 6);  // arm L
    draw(0x1A1A3A, 13, 9, 3, 6);  // arm R
    draw(0x333333, 15, 10, 8, 3); // heavy gun
    draw(0x1A1A3A, 2, 16, 4, 6);  // leg L
    draw(0x1A1A3A, 8, 16, 4, 6);  // leg R
    draw(0x0A0A1A, 1, 22, 5, 2);  // boot L
    draw(0x0A0A1A, 8, 22, 5, 2);  // boot R

    g.generateTexture('supersoldier', 14 * p, 24 * p);
    g.destroy();
  }

  makePlatformTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(C.COL.PLATFORM);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0x4A5E3A);
    g.fillRect(0, 0, 64, 4);  // top edge highlight
    g.fillStyle(0x2A3A1E);
    g.fillRect(0, 12, 64, 4); // bottom shadow
    g.generateTexture('platform', 64, 16);
    g.destroy();

    const gm = this.make.graphics({ add: false });
    gm.fillStyle(C.COL.PLATFORM_MOV);
    gm.fillRect(0, 0, 64, 16);
    gm.fillStyle(0x2A8A5A);
    gm.fillRect(0, 0, 64, 4);
    gm.fillStyle(0x0A4A2A);
    gm.fillRect(0, 12, 64, 4);
    gm.generateTexture('platform_mov', 64, 16);
    gm.destroy();
  }

  makeGroundTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(C.COL.GROUND);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x3A2E1A);
    g.fillRect(0, 0, 64, 6);
    // Texture detail
    g.fillStyle(0x221808);
    for (let i = 0; i < 8; i++) {
      g.fillRect(i * 8 + 2, 16, 4, 4);
      g.fillRect(i * 8, 36, 3, 3);
    }
    g.generateTexture('ground', 64, 64);
    g.destroy();
  }

  makeBulletTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(C.COL.BULLET);
    g.fillRect(0, 2, 12, 4);
    g.fillStyle(0xFFFFAA);
    g.fillRect(0, 3, 6, 2);
    g.generateTexture('bullet', 12, 8);
    g.destroy();
  }

  makeEnemyBulletTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(C.COL.ENEMY_BULLET);
    g.fillRect(0, 2, 10, 4);
    g.fillStyle(0xFF8888);
    g.fillRect(0, 3, 5, 2);
    g.generateTexture('enemy_bullet', 10, 8);
    g.destroy();
  }

  makePickupTextures() {
    // Ammo
    const ga = this.make.graphics({ add: false });
    ga.fillStyle(C.COL.HUD_AMMO);
    ga.fillRect(2, 4, 20, 12);
    ga.fillStyle(0xAA8800);
    ga.fillRect(2, 4, 20, 4);
    ga.fillStyle(0xFFFFAA);
    ga.fillRect(4, 6, 6, 4);
    ga.generateTexture('pickup_ammo', 24, 20);
    ga.destroy();

    // Health
    const gh = this.make.graphics({ add: false });
    gh.fillStyle(0xCC0000);
    gh.fillRect(8, 2, 8, 20);
    gh.fillRect(2, 8, 20, 8);
    gh.fillStyle(0xFF4444);
    gh.fillRect(10, 4, 4, 4);
    gh.generateTexture('pickup_health', 24, 24);
    gh.destroy();

    // Intel (document/folder)
    const gi = this.make.graphics({ add: false });
    gi.fillStyle(0xAABBCC);
    gi.fillRect(2, 2, 20, 24);
    gi.fillStyle(0x7788AA);
    gi.fillRect(4, 6, 14, 2);
    gi.fillRect(4, 10, 14, 2);
    gi.fillRect(4, 14, 10, 2);
    gi.fillStyle(0xFFDD00);
    gi.fillRect(16, 16, 6, 6);
    gi.generateTexture('pickup_intel', 24, 28);
    gi.destroy();
  }

  makeObjectiveTexture() {
    const g = this.make.graphics({ add: false });
    // Doctor character
    const p = C.PX - 1;
    const draw = (col, x, y, w, h) => { g.fillStyle(col); g.fillRect(x*p, y*p, w*p, h*p); };
    draw(0xFFDD99, 3, 0, 6, 6);  // head
    draw(0xFFFFFF, 2, 6, 8, 8);  // white coat
    draw(0x4444AA, 2, 14, 3, 5); // pants L
    draw(0x4444AA, 7, 14, 3, 5); // pants R
    draw(0x222222, 2, 19, 3, 2); // shoe L
    draw(0x222222, 7, 19, 3, 2); // shoe R
    g.generateTexture('objective', 12 * p, 21 * p);
    g.destroy();
  }

  makeParticleTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xFFFFFF);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);
    g.destroy();
  }

  makeBackgrounds() {
    this.makeBgJungle();
    this.makeBgBase();
    this.makeBgFacility();
  }

  makeBgJungle() {
    // Far layer — sky gradient + silhouette trees
    const g = this.make.graphics({ add: false });
    g.fillGradientStyle(0x0A1A08, 0x0A1A08, 0x1A3A18, 0x1A3A18, 1);
    g.fillRect(0, 0, C.W, C.H);
    // Moon
    g.fillStyle(0xDDEECC, 0.6);
    g.fillCircle(900, 80, 40);
    // Far trees silhouette
    g.fillStyle(0x0A1A08);
    for (let i = 0; i < 20; i++) {
      const x = i * 70 + 20;
      const h = 120 + (i * 37) % 80;
      g.fillTriangle(x, C.H, x + 30, C.H - h, x + 60, C.H);
    }
    g.generateTexture('bg_jungle_far', C.W, C.H);
    g.destroy();

    // Mid layer — closer trees
    const gm = this.make.graphics({ add: false });
    gm.fillStyle(0x000000, 0);
    gm.fillRect(0, 0, C.W, C.H);
    gm.fillStyle(0x0D2208);
    for (let i = 0; i < 14; i++) {
      const x = i * 100 + 10;
      const h = 180 + (i * 53) % 100;
      gm.fillTriangle(x, C.H, x + 40, C.H - h, x + 80, C.H);
      gm.fillRect(x + 30, C.H - h / 2, 20, h / 2);
    }
    gm.generateTexture('bg_jungle_mid', C.W, C.H);
    gm.destroy();
  }

  makeBgBase() {
    const g = this.make.graphics({ add: false });
    g.fillGradientStyle(0x050505, 0x050505, 0x0A0A0A, 0x0A0A0A, 1);
    g.fillRect(0, 0, C.W, C.H);
    // Industrial building silhouettes
    g.fillStyle(0x0A0A0A);
    g.fillRect(0, C.H - 300, 200, 300);
    g.fillRect(250, C.H - 400, 150, 400);
    g.fillRect(450, C.H - 250, 300, 250);
    g.fillRect(800, C.H - 350, 180, 350);
    g.fillRect(1040, C.H - 280, 240, 280);
    // Windows (faint lights)
    g.fillStyle(0x664400, 0.5);
    for (let bx = 0; bx < C.W; bx += 60) {
      for (let by = 0; by < C.H - 200; by += 50) {
        if (Math.random() > 0.6) g.fillRect(bx + 10, by + 10, 14, 20);
      }
    }
    g.generateTexture('bg_base_far', C.W, C.H);
    g.destroy();

    const gm = this.make.graphics({ add: false });
    gm.fillStyle(0x000000, 0);
    gm.fillRect(0, 0, C.W, C.H);
    gm.fillStyle(0x111111);
    gm.fillRect(0, C.H - 200, C.W, 200);
    gm.fillStyle(0x0A0A0A);
    for (let i = 0; i < 8; i++) {
      gm.fillRect(i * 180, C.H - 200, 10, 200);
    }
    gm.generateTexture('bg_base_mid', C.W, C.H);
    gm.destroy();
  }

  makeBgFacility() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000005);
    g.fillRect(0, 0, C.W, C.H);
    // Grid pattern
    g.lineStyle(1, 0x111122, 0.4);
    for (let x = 0; x < C.W; x += 80) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, C.H); g.strokePath();
    }
    for (let y = 0; y < C.H; y += 80) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(C.W, y); g.strokePath();
    }
    // Tubes/pipes
    g.fillStyle(0x0A0A22);
    g.fillRect(0, 100, C.W, 30);
    g.fillRect(0, 300, C.W, 20);
    g.fillStyle(0x0000AA, 0.15);
    g.fillRect(0, 100, C.W, 30);
    g.generateTexture('bg_facility_far', C.W, C.H);
    g.destroy();

    const gm = this.make.graphics({ add: false });
    gm.fillStyle(0x000000, 0);
    gm.fillRect(0, 0, C.W, C.H);
    gm.fillStyle(0x050510);
    gm.fillRect(0, C.H - 180, C.W, 180);
    gm.generateTexture('bg_facility_mid', C.W, C.H);
    gm.destroy();
  }
}
