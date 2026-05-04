class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const cx = C.W / 2, cy = C.H / 2;

    // Background
    this.add.rectangle(0, 0, C.W, C.H, 0x000000).setOrigin(0);
    this.add.image(0, 0, 'bg_jungle_far').setOrigin(0).setAlpha(0.6);

    // Title
    this.add.text(cx, cy - 200, 'RESCATE DEL SOLDADO', {
      font: 'bold 52px monospace', fill: '#AAFFAA',
      stroke: '#003300', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, cy - 148, 'TACTICAL ACTION', {
      font: '18px monospace', fill: '#557755', letterSpacing: 6
    }).setOrigin(0.5);

    // Separator line
    this.add.rectangle(cx, cy - 120, 500, 2, 0x336633);

    // Mission info
    this.add.text(cx, cy - 80, 'OPERACIÓN: PROYECTO ARES', {
      font: '14px monospace', fill: '#AAAAAA'
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(cx, cy, '[ INICIAR MISIÓN ]', {
      font: 'bold 28px monospace', fill: '#FFFF00',
      stroke: '#664400', strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setFill('#FFFFFF'));
    startBtn.on('pointerout',  () => startBtn.setFill('#FFFF00'));
    startBtn.on('pointerdown', () => this.startGame());

    // Controls
    this.add.text(cx, cy + 120,
      'CONTROLES:\n' +
      '← → Mover     ↑ Saltar     ESPACIO Disparar\n' +
      'ENTER Confirmar     ESC Pausa',
      { font: '14px monospace', fill: '#667766', align: 'center' }
    ).setOrigin(0.5);

    // Blinking prompt
    const blink = this.add.text(cx, cy + 60, 'ENTER para comenzar', {
      font: '16px monospace', fill: '#AAFFAA'
    }).setOrigin(0.5);
    this.tweens.add({ targets: blink, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    // Enter key
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());

    // Version
    this.add.text(C.W - 10, C.H - 10, 'v0.1 — PROTOTIPO', {
      font: '11px monospace', fill: '#334433'
    }).setOrigin(1);
  }

  startGame() {
    this.scene.start('CinematicScene', {
      storyKey: 'intro',
      nextScene: 'GameScene',
      nextData: { levelIndex: 0 }
    });
  }
}
