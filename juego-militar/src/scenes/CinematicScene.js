class CinematicScene extends Phaser.Scene {
  constructor() { super({ key: 'CinematicScene' }); }

  init(data) {
    this.storyKey  = data.storyKey;
    this.nextScene = data.nextScene;
    this.nextData  = data.nextData || {};
    this.panels    = STORY[this.storyKey] || [];
    this.pageIndex = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.showPage(0);

    // Advance on click or Enter/Space
    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.advance());

    // Skip all
    const skipTxt = this.add.text(C.W - 16, C.H - 16, 'SALTAR [S]', {
      font: '13px monospace', fill: '#555555'
    }).setOrigin(1).setDepth(100);
    this.input.keyboard.on('keydown-S', () => this.finish());
    skipTxt.setInteractive().on('pointerdown', () => this.finish());
  }

  showPage(index) {
    this.children.removeAll(true);

    if (index >= this.panels.length) { this.finish(); return; }

    const page = this.panels[index];
    const cx = C.W / 2, cy = C.H / 2;

    // Background
    const bgColor = page.bg === 'jungle'   ? 0x0A1A08 :
                    page.bg === 'base'     ? 0x050505 :
                    page.bg === 'facility' ? 0x000008 :
                    page.bg === 'dark'     ? 0x050505 : 0x000000;

    this.add.rectangle(0, 0, C.W, C.H, bgColor).setOrigin(0);

    // Comic border effect
    this.add.rectangle(cx, cy, C.W - 20, C.H - 20, 0x000000, 0)
      .setStrokeStyle(3, 0x334433);

    // Panel counter
    this.add.text(C.W - 20, 20,
      `${index + 1} / ${this.panels.length}`,
      { font: '13px monospace', fill: '#334433' }
    ).setOrigin(1, 0);

    // Draw each text panel
    let yOffset = 0;
    page.panels.forEach((panel, i) => {
      const style = panel.style || 'normal';
      const isTitle   = style === 'title';
      const isWarning = style === 'warning';

      const textStyle = {
        font:            isTitle ? 'bold 32px monospace' : '20px monospace',
        fill:            isTitle ? '#FFFF00' : isWarning ? '#FF4444' : '#DDDDDD',
        stroke:          isTitle ? '#444400' : isWarning ? '#440000' : '#000000',
        strokeThickness: isTitle ? 4 : 2,
        wordWrap:        { width: C.W - 120 },
        align:           'center'
      };

      let yPos;
      if (panel.pos === 'top')    yPos = 60 + i * 80;
      else if (panel.pos === 'center') yPos = cy - 40 + i * 60;
      else                        yPos = C.H - 180 + i * 80;

      if (panel.speaker) {
        this.add.text(cx, yPos - 24, panel.speaker.toUpperCase() + ':', {
          font: 'bold 13px monospace', fill: '#AAFFAA'
        }).setOrigin(0.5);
      }

      // Comic box background
      const txt = this.add.text(cx, yPos, panel.text, textStyle)
        .setOrigin(0.5).setDepth(2);

      const bounds = txt.getBounds();
      this.add.rectangle(bounds.centerX, bounds.centerY,
        bounds.width + 32, bounds.height + 16,
        0x000000, 0.75
      ).setStrokeStyle(1, 0x334433).setDepth(1);
    });

    // "Continue" hint
    const hint = this.add.text(cx, C.H - 24, '▶ Clic o ENTER para continuar', {
      font: '13px monospace', fill: '#334433'
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });

    // Fade in
    this.cameras.main.fadeIn(300);
  }

  advance() {
    this.cameras.main.fadeOut(250);
    this.time.delayedCall(260, () => {
      this.pageIndex++;
      this.showPage(this.pageIndex);
    });
  }

  finish() {
    this.cameras.main.fadeOut(400);
    this.time.delayedCall(420, () => {
      this.scene.start(this.nextScene, this.nextData);
    });
  }
}
