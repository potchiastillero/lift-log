import Phaser from "phaser";
import { PlayerStats } from "../types";

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  lastAim = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(3);
    this.setCircle(18, 6, 6);
    this.setDamping(true);
    this.setDrag(0.001);
    this.setMaxVelocity(700, 700);

    this.stats = {
      maxHealth: 100,
      health: 100,
      moveSpeed: 240,
      projectileSpeed: 560,
      projectileDamage: 2,
      fireRate: 4,
      xp: 0,
      xpToNext: 20,
      level: 1,
      invulnerableUntil: 0,
    };
  }

  applyMovement(direction: Phaser.Math.Vector2): void {
    const velocity = direction.clone().normalize().scale(this.stats.moveSpeed);
    this.setVelocity(velocity.x || 0, velocity.y || 0);

    if (direction.lengthSq() > 0) {
      this.setRotation(direction.angle() + Math.PI / 2);
    }
  }

  canTakeDamage(now: number): boolean {
    return now >= this.stats.invulnerableUntil;
  }

  setInvulnerability(now: number, durationMs: number): void {
    this.stats.invulnerableUntil = now + durationMs;
  }
}
