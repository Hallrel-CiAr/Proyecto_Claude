class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'VictoryScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(600);

    const cx = C.W / 2, cy = C.H / 2;

    this.add.image(0, 0, 'bg_facility_far').setOrigin(0).setAlpha(0.3);

    this.add.text(cx, cy - 180, '✦ MISIÓN CUMPLIDA ✦', {
      font: 'bold 48px monospace',
      fill: '#FFDD00',
      stroke: '#554400',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy - 120, 600, 2, 0x335533);

    this.add.text(cx, cy - 80,
      'La Dra. Elena Voss ha sido rescatada.\n' +
      'Pero las preguntas siguen sin respuesta:\n' +
      '¿Qué tan lejos llegó el Proyecto Ares?',
      {
        font: '18px monospace', fill: '#AAAAAA',
        align: 'center', wordWrap: { width: 600 }
      }
    ).setOrigin(0.5);

    this.add.rectangle(cx, cy + 20, 600, 2, 0x335533);

    this.add.text(cx, cy + 60, 'CONTINUARÁ...', {
      font: 'bold 28px monospace', fill: '#AAFFAA',
      stroke: '#003300', strokeThickness: 3
    }).setOrigin(0.5);

    const blink = this.add.text(cx, cy + 110, '— Más misiones próximamente —', {
      font: '15px monospace', fill: '#446644'
    }).setOrigin(0.5);
    this.tweens.add({ targets: blink, alpha: 0.2, duration: 900, yoyo: true, repeat: -1 });

    const menuBtn = this.add.text(cx, cy + 180, '[ VOLVER AL MENÚ ]', {
      font: 'bold 22px monospace', fill: '#FFDD00',
      stroke: '#444400', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setFill('#FFFFFF'));
    menuBtn.on('pointerout',  () => menuBtn.setFill('#FFDD00'));
    menuBtn.on('pointerdown', () => this.goMenu());

    this.input.keyboard.on('keydown-ENTER', () => this.goMenu());
  }

  goMenu() {
    this.cameras.main.fadeOut(400);
    this.time.delayedCall(420, () => this.scene.start('MenuScene'));
  }
}
