class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  init(data) { this.gameScene = data.game; }

  create() {
    this.createHUD();

    // Listen for updates from GameScene
    this.gameScene.events.on('hudUpdate', this.updateHUD, this);
    this.gameScene.events.on('paused', this.showPause, this);

    this.updateHUD();
  }

  createHUD() {
    const barW = 160, barH = 14;

    // HUD background bar
    this.add.rectangle(0, 0, C.W, 52, 0x000000, 0.75).setOrigin(0);
    this.add.rectangle(0, 51, C.W, 1, 0x336633).setOrigin(0);

    // ── Health ──────────────────────────────────────────────────────────────
    this.add.text(16, 10, '❤ VIDA', { font: 'bold 11px monospace', fill: '#AAFFAA' });
    this.add.rectangle(16, 28, barW, barH, 0x331111).setOrigin(0);
    this.healthBar = this.add.rectangle(17, 29, barW - 2, barH - 2, C.COL.HUD_HEALTH).setOrigin(0);
    this.healthText = this.add.text(barW + 24, 20, '', { font: 'bold 13px monospace', fill: '#3DBA6F' });

    // ── Ammo ────────────────────────────────────────────────────────────────
    this.add.text(220, 10, '⬥ MUNICIÓN', { font: 'bold 11px monospace', fill: '#FFEEAA' });
    this.add.rectangle(220, 28, barW, barH, 0x332200).setOrigin(0);
    this.ammoBar = this.add.rectangle(221, 29, barW - 2, barH - 2, C.COL.HUD_AMMO).setOrigin(0);
    this.ammoText = this.add.text(barW + 228, 20, '', { font: 'bold 13px monospace', fill: '#FFD700' });

    // ── Level info ──────────────────────────────────────────────────────────
    const ld = this.gameScene.levelData;
    this.add.text(C.W / 2, 26, ld.name.toUpperCase(), {
      font: '11px monospace', fill: '#667766'
    }).setOrigin(0.5);

    // ── Controls hint ───────────────────────────────────────────────────────
    this.add.text(C.W - 16, 26, '← → Mover  ↑ Saltar  SPC Disparar  ESC Pausa', {
      font: '10px monospace', fill: '#334433'
    }).setOrigin(1, 0.5);

    // ── Pause overlay ───────────────────────────────────────────────────────
    this.pauseOverlay = this.add.container(0, 0).setVisible(false).setDepth(50);
    this.pauseOverlay.add(this.add.rectangle(C.W/2, C.H/2, C.W, C.H, 0x000000, 0.7));
    this.pauseOverlay.add(this.add.text(C.W/2, C.H/2 - 30, 'PAUSA', {
      font: 'bold 48px monospace', fill: '#FFFF00', stroke: '#444400', strokeThickness: 4
    }).setOrigin(0.5));
    this.pauseOverlay.add(this.add.text(C.W/2, C.H/2 + 30, 'Presioná ESC para continuar', {
      font: '18px monospace', fill: '#AAAAAA'
    }).setOrigin(0.5));
  }

  updateHUD() {
    const ps = this.gameScene.playerState;

    const hp = Math.max(0, ps.health) / C.PLAYER_MAX_HEALTH;
    const am = Math.max(0, ps.ammo)   / C.PLAYER_MAX_AMMO;

    this.healthBar.displayWidth = Math.max(1, (160 - 2) * hp);
    this.healthBar.setFillStyle(hp > 0.5 ? C.COL.HUD_HEALTH :
                                hp > 0.25 ? 0xDDAA00 : 0xFF2222);

    this.ammoBar.displayWidth = Math.max(1, (160 - 2) * am);

    this.healthText.setText(`${ps.health}/${C.PLAYER_MAX_HEALTH}`);
    this.ammoText.setText(`${ps.ammo}/${C.PLAYER_MAX_AMMO}`);
  }

  showPause(isPaused) {
    this.pauseOverlay.setVisible(isPaused);
  }
}
