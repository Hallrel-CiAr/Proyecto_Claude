const config = {
  type:   Phaser.AUTO,
  width:  C.W,
  height: C.H,
  backgroundColor: '#000000',
  pixelArt: true,          // crisp pixel-art rendering (no anti-aliasing)
  antialias: false,
  roundPixels: true,
  parent: document.body,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: C.GRAVITY },
      debug:   false
    }
  },

  pipeline: {
    'Light2D': Phaser.Renderer.WebGL.Pipelines.LightPipeline
  },

  scene: [
    BootScene,
    MenuScene,
    CinematicScene,
    GameScene,
    HUDScene,
    GameOverScene,
    VictoryScene
  ]
};

const game = new Phaser.Game(config);
