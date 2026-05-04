class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelName  = data.levelName  || '';
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(400);

    const cx = C.W / 2, cy = C.H / 2;

    this.add.image(0, 0, 'bg_jungle_far').setOrigin(0).setAlpha(0.2);

    this.add.text(cx, cy - 140, 'MISIÓN FALLIDA', {
      font: 'bold 56px monospace',
      fill: '#FF2222',
      stroke: '#440000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, cy - 70, this.levelName, {
      font: '16px monospace', fill: '#888888'
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy - 30, 400, 2, 0x440000);

    this.add.text(cx, cy + 10, '"El soldado caído no es el final.\nEs el comienzo de la siguiente misión."', {
      font: '16px monospace', fill: '#666666', align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    // Retry
    const retryBtn = this.add.text(cx, cy + 110, '[ REINTENTAR MISIÓN ]', {
      font: 'bold 26px monospace', fill: '#FFDD00',
      stroke: '#444400', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => retryBtn.setFill('#FFFFFF'));
    retryBtn.on('pointerout',  () => retryBtn.setFill('#FFDD00'));
    retryBtn.on('pointerdown', () => this.retry());

    // Menu
    const menuBtn = this.add.text(cx, cy + 160, '[ MENÚ PRINCIPAL ]', {
      font: '18px monospace', fill: '#667766',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setFill('#AAFFAA'));
    menuBtn.on('pointerout',  () => menuBtn.setFill('#667766'));
    menuBtn.on('pointerdown', () => this.goMenu());

    this.input.keyboard.on('keydown-ENTER', () => this.retry());
    this.input.keyboard.on('keydown-M',     () => this.goMenu());
  }

  retry() {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(320, () => {
      const storyBefore = LEVELS[this.levelIndex].storyBefore;
      if (storyBefore) {
        this.scene.start('CinematicScene', {
          storyKey:  storyBefore,
          nextScene: 'GameScene',
          nextData:  { levelIndex: this.levelIndex }
        });
      } else {
        this.scene.start('GameScene', { levelIndex: this.levelIndex });
      }
    });
  }

  goMenu() {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(320, () => this.scene.start('MenuScene'));
  }
}
