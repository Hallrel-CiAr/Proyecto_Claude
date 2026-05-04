class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.levelData  = LEVELS[this.levelIndex];
  }

  create() {
    const ld = this.levelData;

    this.physics.world.setBounds(0, 0, ld.worldWidth, ld.worldHeight);
    this.cameras.main.setBounds(0, 0, ld.worldWidth, ld.worldHeight);

    this.setupBackground(ld);
    this.setupLighting(ld);
    this.setupWorld(ld);
    this.setupPlayer(ld);
    this.setupEnemies(ld);
    this.setupPickups(ld);
    this.setupObjective(ld);
    this.setupInput();
    this.setupParticles();
    this.setupCollisions();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(500);

    // Launch HUD scene in parallel
    this.scene.launch('HUDScene', { game: this });

    // Pause key
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  // ── BACKGROUND ─────────────────────────────────────────────────────────────
  setupBackground(ld) {
    const theme = ld.bgTheme;
    this.bgFar = this.add.tileSprite(0, 0, C.W, C.H, `bg_${theme}_far`)
      .setOrigin(0).setScrollFactor(0).setDepth(-10);
    this.bgMid = this.add.tileSprite(0, 0, C.W, C.H, `bg_${theme}_mid`)
      .setOrigin(0).setScrollFactor(0).setDepth(-9).setAlpha(0.85);
  }

  // ── LIGHTING ───────────────────────────────────────────────────────────────
  setupLighting(ld) {
    this.lights.enable().setAmbientColor(ld.ambientColor);

    this.playerLight = this.lights.addLight(
      0, 0,
      ld.playerLight.radius,
      ld.playerLight.color,
      ld.playerLight.intensity
    );
    this.muzzleLight = this.lights.addLight(0, 0, 80, C.COL.MUZZLE, 0);
  }

  // ── WORLD GEOMETRY ─────────────────────────────────────────────────────────
  setupWorld(ld) {
    // Static platforms
    this.platforms = this.physics.add.staticGroup();
    ld.platforms.forEach(([x, y, w, h]) => {
      const isGround = h > 40;
      const tex = isGround ? 'ground' : 'platform';
      // Tile the texture across the platform width
      const tiles = Math.ceil(w / 64);
      for (let i = 0; i < tiles; i++) {
        const px = x + i * 64;
        const pw = Math.min(64, x + w - px);
        const img = this.platforms.create(px, y, tex)
          .setOrigin(0)
          .refreshBody()
          .setPipeline('Light2D');
        img.displayWidth = pw;
        img.displayHeight = h;
        img.refreshBody();
      }
    });

    // Moving platforms
    this.movingPlatforms = this.physics.add.group();
    ld.movingPlatforms.forEach(mp => {
      const plat = this.movingPlatforms.create(mp.x, mp.y, 'platform_mov')
        .setOrigin(0)
        .setPipeline('Light2D');
      plat.displayWidth  = mp.w;
      plat.displayHeight = mp.h;
      plat.setImmovable(true);
      plat.body.allowGravity = false;
      plat._minX  = mp.minX;
      plat._maxX  = mp.maxX;
      plat._speed = mp.speed;
      plat.setVelocityX(mp.speed);
      plat.body.checkCollision.down = false;
      plat.body.checkCollision.left = false;
      plat.body.checkCollision.right = false;
    });
  }

  // ── PLAYER ─────────────────────────────────────────────────────────────────
  setupPlayer(ld) {
    this.player = this.physics.add.sprite(ld.spawn.x, ld.spawn.y, 'player')
      .setPipeline('Light2D')
      .setCollideWorldBounds(true);
    this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.9);

    this.playerState = {
      health:      C.PLAYER_MAX_HEALTH,
      ammo:        C.PLAYER_MAX_AMMO,
      facingRight: true,
      lastShot:    0,
      invincible:  false,
      dead:        false
    };

    this.bullets = this.physics.add.group({
      defaultKey:     'bullet',
      maxSize:        20,
      runChildUpdate: true
    });
  }

  // ── ENEMIES ────────────────────────────────────────────────────────────────
  setupEnemies(ld) {
    this.enemies       = this.physics.add.group();
    this.enemyBullets  = this.physics.add.group({ maxSize: 40 });

    ld.enemies.forEach(ed => {
      const isBoss = ed.type === 'supersoldier';
      const tex    = isBoss ? 'supersoldier' : 'enemy';
      const enemy  = this.enemies.create(ed.x, ed.y, tex)
        .setPipeline('Light2D')
        .setCollideWorldBounds(true);

      enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.9);
      enemy._health   = isBoss ? 8 : C.ENEMY_MAX_HEALTH;
      enemy._maxAmmo  = C.ENEMY_MAX_AMMO;
      enemy._ammo     = C.ENEMY_MAX_AMMO;
      enemy._minX     = ed.minX;
      enemy._maxX     = ed.maxX;
      enemy._lastShot = 0;
      enemy._isBoss   = isBoss;
      enemy._speed    = isBoss ? C.ENEMY_SPEED * 0.8 : C.ENEMY_SPEED;
      enemy._facingRight = true;

      if (isBoss) {
        // Boss glowing effect
        this.tweens.add({
          targets: enemy,
          alpha: 0.7,
          duration: 800,
          yoyo: true,
          repeat: -1
        });
        this.bossLight = this.lights.addLight(
          enemy.x, enemy.y, 120, 0x0000FF, 0.8
        );
      }
    });
  }

  // ── PICKUPS ────────────────────────────────────────────────────────────────
  setupPickups(ld) {
    this.pickups = this.physics.add.staticGroup();
    ld.pickups.forEach(pu => {
      const item = this.pickups.create(pu.x, pu.y, `pickup_${pu.type}`)
        .setPipeline('Light2D');
      item._type = pu.type;
      item.body.allowGravity = false;
      // Floating animation
      this.tweens.add({
        targets: item,
        y: pu.y - 8,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      // Add small light for pickups
      if (pu.type === 'intel') {
        this.lights.addLight(pu.x, pu.y, 60, 0xAABBFF, 0.5);
      }
    });
  }

  // ── OBJECTIVE ──────────────────────────────────────────────────────────────
  setupObjective(ld) {
    const obj = ld.objective;
    this.objective = this.physics.add.sprite(obj.x, obj.y, 'objective')
      .setPipeline('Light2D');
    this.objective.body.allowGravity = false;
    this.objective.body.setImmovable(true);

    // Pulsing light on objective
    this.objectiveLight = this.lights.addLight(obj.x, obj.y, 100, C.COL.OBJECTIVE, 1.0);
    this.tweens.add({
      targets: { v: 1 },
      v: 0.3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      onUpdate: t => { this.objectiveLight.intensity = t.targets[0].v; }
    });

    // Label above objective
    this.add.text(obj.x, obj.y - 60, '▼ ' + obj.label, {
      font: 'bold 14px monospace',
      fill: '#FFDD44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(5);
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // ── PARTICLES ─────────────────────────────────────────────────────────────
  setupParticles() {
    this.muzzleEmitter = this.add.particles(0, 0, 'particle', {
      speed:    { min: 80, max: 240 },
      angle:    { min: -25, max: 25 },
      scale:    { start: 1.2, end: 0 },
      tint:     [C.COL.MUZZLE, 0xFFFFAA, 0xFFFFFF],
      lifespan: 100,
      quantity: 6,
      emitting: false
    }).setDepth(5);

    this.impactEmitter = this.add.particles(0, 0, 'particle', {
      speed:    { min: 50, max: 150 },
      angle:    { min: 0, max: 360 },
      scale:    { start: 0.8, end: 0 },
      tint:     [0xFF4444, 0xAA2222, 0xFF8844],
      lifespan: 200,
      quantity: 8,
      emitting: false
    }).setDepth(5);

    this.bloodEmitter = this.add.particles(0, 0, 'particle', {
      speed:    { min: 60, max: 180 },
      angle:    { min: -60, max: 60 },
      scale:    { start: 1, end: 0 },
      tint:     [C.COL.BLOOD, 0x880000],
      lifespan: 300,
      quantity: 10,
      gravityY: 200,
      emitting: false
    }).setDepth(5);
  }

  // ── COLLISIONS ─────────────────────────────────────────────────────────────
  setupCollisions() {
    // Player + world
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.movingPlatforms);

    // Player bullets hit enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy, null, this);

    // Enemy bullets hit player
    this.physics.add.overlap(this.enemyBullets, this.player, this.onEnemyBulletHitPlayer, null, this);

    // Bullets hit platforms
    this.physics.add.collider(this.bullets, this.platforms, (b) => {
      this.impactEmitter.setPosition(b.x, b.y);
      this.impactEmitter.explode(4);
      b.destroy();
    });
    this.physics.add.collider(this.enemyBullets, this.platforms, (b) => { b.destroy(); });

    // Player collects pickups
    this.physics.add.overlap(this.player, this.pickups, this.onPickup, null, this);

    // Player reaches objective
    this.physics.add.overlap(this.player, this.objective, this.onReachObjective, null, this);
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  update(time, delta) {
    if (this.playerState.dead) return;
    if (this._paused) return;

    this.updatePlayer(time);
    this.updateMovingPlatforms();
    this.updateEnemies(time);
    this.updateParallax();
    this.updateLights();
    this.cleanupBullets();
  }

  updateParallax() {
    const camX = this.cameras.main.scrollX;
    const worldW = this.levelData.worldWidth;
    this.bgFar.tilePositionX = camX * 0.15;
    this.bgMid.tilePositionX = camX * 0.40;
  }

  updateLights() {
    this.playerLight.x = this.player.x;
    this.playerLight.y = this.player.y;
    if (this.bossLight) {
      const boss = this.enemies.getChildren().find(e => e._isBoss);
      if (boss && boss.active) {
        this.bossLight.x = boss.x;
        this.bossLight.y = boss.y;
      }
    }
  }

  // ── PLAYER MOVEMENT ────────────────────────────────────────────────────────
  updatePlayer(time) {
    const ps = this.playerState;
    const body = this.player.body;
    const onGround = body.blocked.down;

    // Horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-C.PLAYER_SPEED);
      ps.facingRight = false;
      this.player.setTexture('player_left');
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(C.PLAYER_SPEED);
      ps.facingRight = true;
      this.player.setTexture('player');
    } else {
      this.player.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(C.PLAYER_JUMP);
    }

    // Shoot
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shoot(time);
    }

    // Fall death
    if (this.player.y > this.levelData.worldHeight + 100) {
      this.killPlayer();
    }
  }

  shoot(time) {
    const ps = this.playerState;
    if (ps.ammo <= 0) return;
    if (time - ps.lastShot < C.SHOOT_COOLDOWN) return;

    ps.lastShot = time;
    ps.ammo--;

    const bullet = this.bullets.create(
      this.player.x + (ps.facingRight ? 40 : -40),
      this.player.y - 8,
      'bullet'
    );
    if (!bullet) return;
    bullet.setVelocityX(ps.facingRight ? C.BULLET_SPEED : -C.BULLET_SPEED);
    bullet.body.allowGravity = false;
    bullet.setFlipX(!ps.facingRight);
    bullet.setDepth(4);
    bullet._born = time;

    // Muzzle flash
    this.muzzleEmitter.setPosition(
      this.player.x + (ps.facingRight ? 44 : -44),
      this.player.y - 8
    );
    this.muzzleEmitter.explode(6);

    // Brief muzzle light
    this.muzzleLight.x = bullet.x;
    this.muzzleLight.y = bullet.y;
    this.muzzleLight.intensity = 2;
    this.time.delayedCall(80, () => { this.muzzleLight.intensity = 0; });

    // Camera shake
    this.cameras.main.shake(60, 0.003);

    // Update HUD
    this.events.emit('hudUpdate');
  }

  // ── MOVING PLATFORMS ───────────────────────────────────────────────────────
  updateMovingPlatforms() {
    this.movingPlatforms.getChildren().forEach(p => {
      if (p.x <= p._minX) p.setVelocityX(p._speed);
      if (p.x + p.displayWidth >= p._maxX) p.setVelocityX(-p._speed);
    });
  }

  // ── ENEMIES AI ─────────────────────────────────────────────────────────────
  updateEnemies(time) {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;

      const dx  = this.player.x - enemy.x;
      const dy  = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vision = enemy._isBoss ? C.ENEMY_VISION * 1.5 : C.ENEMY_VISION;

      if (dist < vision) {
        // Chase and shoot
        enemy._facingRight = dx > 0;
        const spd = enemy._isBoss ? enemy._speed * 1.2 : enemy._speed;
        enemy.setVelocityX(dx > 0 ? spd : -spd);

        const shootCD = enemy._isBoss ? C.ENEMY_SHOOT_CD * 0.6 : C.ENEMY_SHOOT_CD;
        if (time - enemy._lastShot > shootCD && enemy._ammo > 0) {
          this.enemyShoot(enemy, dx > 0);
          enemy._lastShot = time;
        }
      } else {
        // Patrol
        const at = enemy._facingRight ? (enemy.x >= enemy._maxX) : (enemy.x <= enemy._minX);
        if (at) enemy._facingRight = !enemy._facingRight;
        enemy.setVelocityX(enemy._facingRight ? enemy._speed : -enemy._speed);
      }
    });
  }

  enemyShoot(enemy, facingRight) {
    if (enemy._ammo <= 0) return;
    enemy._ammo--;

    const bullet = this.enemyBullets.create(
      enemy.x + (facingRight ? 32 : -32),
      enemy.y - 8,
      'enemy_bullet'
    );
    if (!bullet) return;
    bullet.setVelocityX(facingRight ? C.ENEMY_BULLET_SPEED : -C.ENEMY_BULLET_SPEED);
    bullet.body.allowGravity = false;
    bullet.setFlipX(!facingRight);
    bullet.setDepth(4);
  }

  // ── COLLISION CALLBACKS ────────────────────────────────────────────────────
  onBulletHitEnemy(bullet, enemy) {
    this.bloodEmitter.setPosition(enemy.x, enemy.y);
    this.bloodEmitter.explode(10);

    bullet.destroy();
    enemy._health--;

    // Hit flash
    this.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => { enemy.setAlpha(1); }
    });

    if (enemy._health <= 0) {
      this.bloodEmitter.explode(20);
      this.cameras.main.shake(100, 0.006);
      if (enemy._isBoss) {
        this.lights.removeLight(this.bossLight);
        this.cameras.main.shake(300, 0.012);
        // Special boss kill effect
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 120, () => {
            this.bloodEmitter.setPosition(
              enemy.x + Phaser.Math.Between(-40, 40),
              enemy.y + Phaser.Math.Between(-20, 20)
            );
            this.bloodEmitter.explode(15);
          });
        }
      }
      enemy.destroy();
    }
  }

  onEnemyBulletHitPlayer(player, bullet) {
    if (this.playerState.invincible) return;
    bullet.destroy();
    this.hitPlayer();
  }

  hitPlayer() {
    const ps = this.playerState;
    ps.health--;
    ps.invincible = true;

    this.cameras.main.shake(120, 0.008);
    this.cameras.main.flash(100, 150, 0, 0, true);

    // Invincibility blink
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.player.setAlpha(1);
        ps.invincible = false;
      }
    });

    this.events.emit('hudUpdate');

    if (ps.health <= 0) this.killPlayer();
  }

  killPlayer() {
    if (this.playerState.dead) return;
    this.playerState.dead = true;
    this.player.setVelocity(0, -300);
    this.player.setAngularVelocity(300);
    this.cameras.main.shake(400, 0.015);

    this.time.delayedCall(1200, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', {
        levelIndex: this.levelIndex,
        levelName:  this.levelData.name
      });
    });
  }

  onPickup(player, item) {
    const type = item._type;
    if (type === 'ammo') {
      this.playerState.ammo = C.PLAYER_MAX_AMMO;
      this.showFloatingText(item.x, item.y, '+MUNICIÓN', '#FFD700');
    } else if (type === 'health') {
      this.playerState.health = Math.min(
        this.playerState.health + 2, C.PLAYER_MAX_HEALTH
      );
      this.showFloatingText(item.x, item.y, '+VIDA', '#3DBA6F');
    } else if (type === 'intel') {
      this.showFloatingText(item.x, item.y, 'INTEL OBTENIDO', '#AABBFF');
    }

    item.destroy();
    this.events.emit('hudUpdate');
  }

  onReachObjective() {
    if (this._objectiveReached) return;
    this._objectiveReached = true;

    this.playerState.dead = true; // stop input
    this.cameras.main.fadeOut(800);

    const storyAfter = this.levelData.storyAfter;

    this.time.delayedCall(900, () => {
      this.scene.stop('HUDScene');
      const nextLevelIndex = this.levelIndex + 1;

      if (storyAfter) {
        this.scene.start('CinematicScene', {
          storyKey:  storyAfter,
          nextScene: nextLevelIndex < LEVELS.length ? 'GameScene' : 'VictoryScene',
          nextData:  nextLevelIndex < LEVELS.length
            ? { levelIndex: nextLevelIndex }
            : {}
        });
      } else if (nextLevelIndex < LEVELS.length) {
        const nextStory = LEVELS[nextLevelIndex].storyBefore;
        if (nextStory) {
          this.scene.start('CinematicScene', {
            storyKey:  nextStory,
            nextScene: 'GameScene',
            nextData:  { levelIndex: nextLevelIndex }
          });
        } else {
          this.scene.start('GameScene', { levelIndex: nextLevelIndex });
        }
      } else {
        this.scene.start('VictoryScene');
      }
    });
  }

  // ── UTILITIES ─────────────────────────────────────────────────────────────
  showFloatingText(x, y, msg, color) {
    const txt = this.add.text(x, y - 20, msg, {
      font: 'bold 16px monospace', fill: color,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({
      targets: txt,
      y: y - 70,
      alpha: 0,
      duration: 900,
      onComplete: () => txt.destroy()
    });
  }

  cleanupBullets() {
    const now = this.time.now;
    this.bullets.getChildren().forEach(b => {
      if (now - b._born > 2000 || b.x < 0 || b.x > this.levelData.worldWidth)
        b.destroy();
    });
  }

  togglePause() {
    this._paused = !this._paused;
    if (this._paused) {
      this.physics.pause();
      this.events.emit('paused', true);
    } else {
      this.physics.resume();
      this.events.emit('paused', false);
    }
  }
}
