import Phaser from "phaser";
import { EVENTS, SCENE_KEYS } from "../constants";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { HudState, UpgradeOption } from "../types";

type ControlKeys = {
  moveUp: Phaser.Input.Keyboard.Key;
  moveDown: Phaser.Input.Keyboard.Key;
  moveLeft: Phaser.Input.Keyboard.Key;
  moveRight: Phaser.Input.Keyboard.Key;
  fire: Phaser.Input.Keyboard.Key;
  aimUp: Phaser.Input.Keyboard.Key;
  aimDown: Phaser.Input.Keyboard.Key;
  aimLeft: Phaser.Input.Keyboard.Key;
  aimRight: Phaser.Input.Keyboard.Key;
};

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: ControlKeys;
  private progression!: ProgressionSystem;
  private waveSystem = new WaveSystem();
  private lastShotAt = 0;
  private spawnAccumulator = 0;
  private pausedForUpgrade = false;
  private isGameOver = false;
  private readonly worldBounds = new Phaser.Geom.Rectangle(0, 0, 2400, 2400);

  constructor() {
    super(SCENE_KEYS.game);
  }

  create(): void {
    this.physics.world.setBounds(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height,
    );

    this.add
      .tileSprite(
        this.worldBounds.centerX,
        this.worldBounds.centerY,
        this.worldBounds.width,
        this.worldBounds.height,
        "grid",
      )
      .setScrollFactor(1);

    this.add.rectangle(
      this.worldBounds.centerX,
      this.worldBounds.centerY,
      this.worldBounds.width,
      this.worldBounds.height,
      0x03060d,
      0.18,
    );

    this.player = new Player(
      this,
      this.worldBounds.centerX,
      this.worldBounds.centerY,
    );
    this.progression = new ProgressionSystem(this.player);

    this.projectiles = this.physics.add.group({
      classType: Projectile,
      maxSize: 80,
      runChildUpdate: false,
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 120,
      runChildUpdate: false,
    });

    this.cursors = this.createControls();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height,
    );

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    );

    this.scale.on("resize", this.handleResize, this);
    this.input.keyboard?.on("keydown-R", () => {
      if (this.isGameOver) {
        this.restartRun();
      }
    });

    this.events.on(EVENTS.resume, this.resumeFromUpgrade, this);
    this.emitHud();
  }

  update(_time: number, delta: number): void {
    if (this.pausedForUpgrade || this.isGameOver) {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.waveSystem.update(deltaSeconds);
    this.spawnAccumulator += delta;

    this.handleMovement();
    this.handleAttacking();
    this.updateEnemies();
    this.despawnProjectiles();

    const spawnInterval = this.waveSystem.getSpawnIntervalMs();

    while (
      this.spawnAccumulator >= spawnInterval &&
      this.enemies.countActive(true) < this.waveSystem.getSpawnCap()
    ) {
      this.spawnAccumulator -= spawnInterval;
      this.spawnEnemy();
    }

    this.emitHud();
  }

  private createControls(): ControlKeys {
    return this.input.keyboard?.addKeys({
      moveUp: Phaser.Input.Keyboard.KeyCodes.W,
      moveDown: Phaser.Input.Keyboard.KeyCodes.S,
      moveLeft: Phaser.Input.Keyboard.KeyCodes.A,
      moveRight: Phaser.Input.Keyboard.KeyCodes.D,
      fire: Phaser.Input.Keyboard.KeyCodes.SPACE,
      aimUp: Phaser.Input.Keyboard.KeyCodes.UP,
      aimDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      aimLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      aimRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    }) as ControlKeys;
  }

  private handleMovement(): void {
    const direction = new Phaser.Math.Vector2(
      Number(this.cursors.moveRight.isDown) - Number(this.cursors.moveLeft.isDown),
      Number(this.cursors.moveDown.isDown) - Number(this.cursors.moveUp.isDown),
    );

    this.player.applyMovement(direction);

    const aimKeys = new Phaser.Math.Vector2(
      Number(this.cursors.aimRight.isDown) - Number(this.cursors.aimLeft.isDown),
      Number(this.cursors.aimDown.isDown) - Number(this.cursors.aimUp.isDown),
    );

    if (aimKeys.lengthSq() > 0) {
      this.player.lastAim = aimKeys.normalize();
      return;
    }

    const pointer = this.input.activePointer;
    const worldPoint =
      pointer.positionToCamera(this.cameras.main) ?? new Phaser.Math.Vector2();
    const aim = new Phaser.Math.Vector2(
      worldPoint.x - this.player.x,
      worldPoint.y - this.player.y,
    );

    if (aim.lengthSq() > 16) {
      this.player.lastAim = aim.normalize();
    }
  }

  private handleAttacking(): void {
    const pointer = this.input.activePointer;
    const keyboardAttack = this.cursors.fire.isDown;
    const wantsAttack = pointer.isDown || keyboardAttack;
    const cooldown = 1000 / this.player.stats.fireRate;

    if (!wantsAttack || this.time.now - this.lastShotAt < cooldown) {
      return;
    }

    this.lastShotAt = this.time.now;

    const projectile = this.projectiles.get() as Projectile | null;

    if (!projectile) {
      return;
    }

    const spread = Phaser.Math.FloatBetween(-0.04, 0.04);
    const direction = this.player.lastAim.clone().rotate(spread).normalize();

    projectile.fire(
      this.player.x + direction.x * 26,
      this.player.y + direction.y * 26,
      direction,
      this.player.stats.projectileSpeed,
      this.player.stats.projectileDamage,
    );
  }

  private updateEnemies(): void {
    const activeEnemies = this.enemies.getChildren() as Enemy[];

    activeEnemies.forEach((enemy) => {
      if (!enemy.active) {
        return;
      }

      const direction = new Phaser.Math.Vector2(
        this.player.x - enemy.x,
        this.player.y - enemy.y,
      )
        .normalize()
        .scale(enemy.speed);

      enemy.setVelocity(direction.x, direction.y);
    });
  }

  private despawnProjectiles(): void {
    const activeProjectiles = this.projectiles.getChildren() as Projectile[];

    activeProjectiles.forEach((projectile) => {
      if (!projectile.active) {
        return;
      }

      if (!this.worldBounds.contains(projectile.x, projectile.y)) {
        projectile.disableBody(true, true);
      }
    });
  }

  private spawnEnemy(): void {
    const enemy = this.enemies.get() as Enemy | null;

    if (!enemy) {
      return;
    }

    const spawnPoint = this.getSpawnPoint();
    const difficulty = this.waveSystem.getDifficultyScale();

    enemy.enableBody(true, spawnPoint.x, spawnPoint.y, true, true);
    enemy.configure(difficulty);
    enemy.setTint(
      Phaser.Display.Color.GetColor(
        255,
        Phaser.Math.Clamp(110 - difficulty * 2, 60, 110),
        Phaser.Math.Clamp(140 - difficulty * 3, 70, 140),
      ),
    );
  }

  private getSpawnPoint(): Phaser.Math.Vector2 {
    const padding = 240;
    const edge = Phaser.Math.Between(0, 3);

    switch (edge) {
      case 0:
        return new Phaser.Math.Vector2(
          Phaser.Math.Between(this.player.x - 460, this.player.x + 460),
          this.player.y - padding,
        );
      case 1:
        return new Phaser.Math.Vector2(
          this.player.x + padding,
          Phaser.Math.Between(this.player.y - 460, this.player.y + 460),
        );
      case 2:
        return new Phaser.Math.Vector2(
          Phaser.Math.Between(this.player.x - 460, this.player.x + 460),
          this.player.y + padding,
        );
      default:
        return new Phaser.Math.Vector2(
          this.player.x - padding,
          Phaser.Math.Between(this.player.y - 460, this.player.y + 460),
        );
    }
  }

  private handleProjectileHit(
    projectileGameObject: Phaser.GameObjects.GameObject,
    enemyGameObject: Phaser.GameObjects.GameObject,
  ): void {
    const projectile = projectileGameObject as Projectile;
    const enemy = enemyGameObject as Enemy;

    if (!projectile.active || !enemy.active) {
      return;
    }

    enemy.health -= projectile.damage;
    projectile.disableBody(true, true);
    this.spawnHitFlash(enemy.x, enemy.y, 0xfff1ad);

    if (enemy.health > 0) {
      return;
    }

    enemy.disableBody(true, true);
    this.spawnHitFlash(enemy.x, enemy.y, 0x7cf5ff, 1.4);

    const leveledUp = this.progression.gainXp(enemy.xpReward);

    if (leveledUp) {
      this.startUpgradeDraft();
    }
  }

  private handlePlayerHit(
    playerGameObject: Phaser.GameObjects.GameObject,
    enemyGameObject: Phaser.GameObjects.GameObject,
  ): void {
    const player = playerGameObject as Player;
    const enemy = enemyGameObject as Enemy;

    if (!enemy.active || !player.canTakeDamage(this.time.now)) {
      return;
    }

    player.stats.health -= enemy.damage;
    player.setInvulnerability(
      this.time.now,
      this.progression.getInvulnerabilityDuration(),
    );
    enemy.disableBody(true, true);
    this.spawnHitFlash(player.x, player.y, 0xff5f76, 1.3);

    this.tweens.add({
      targets: player,
      alpha: 0.25,
      yoyo: true,
      repeat: 3,
      duration: 70,
    });

    if (player.stats.health <= 0) {
      this.triggerGameOver();
    }
  }

  private startUpgradeDraft(): void {
    this.pausedForUpgrade = true;
    this.physics.pause();

    const options = this.progression.draftOptions(
      this.math.randomDataGenerator,
    );
    this.events.emit(EVENTS.levelUp, { options });
  }

  private resumeFromUpgrade(selectedOption: UpgradeOption): void {
    if (!this.pausedForUpgrade) {
      return;
    }

    this.progression.applyUpgrade(selectedOption);
    this.pausedForUpgrade = false;
    this.physics.resume();
    this.emitHud();
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    this.physics.pause();
    this.events.emit(EVENTS.gameOver);
    this.emitHud();
  }

  private restartRun(): void {
    this.scene.stop(SCENE_KEYS.ui);
    this.scene.restart();
    this.scene.launch(SCENE_KEYS.ui);
  }

  private emitHud(): void {
    const hudState: HudState = {
      health: Math.max(0, this.player.stats.health),
      maxHealth: this.player.stats.maxHealth,
      xp: this.player.stats.xp,
      xpToNext: this.player.stats.xpToNext,
      level: this.player.stats.level,
      upgrades: this.progression.upgrades,
      wave: this.waveSystem.wave,
      elapsedSeconds: this.waveSystem.elapsedSeconds,
    };

    this.events.emit(EVENTS.hudUpdate, hudState);
  }

  private spawnHitFlash(
    x: number,
    y: number,
    tint: number,
    scale = 1,
  ): void {
    const flash = this.add
      .image(x, y, "hit")
      .setTint(tint)
      .setAlpha(0.85)
      .setScale(scale)
      .setDepth(4);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: scale * 2.5,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }

  private handleResize(): void {
    const { width, height } = this.scale;
    this.cameras.main.setViewport(0, 0, width, height);
  }
}
