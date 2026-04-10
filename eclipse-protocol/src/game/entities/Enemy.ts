import Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  maxHealth = 0;
  health = 0;
  damage = 8;
  speed = 90;
  xpReward = 6;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(2);
    this.setCircle(16, 4, 4);
  }

  configure(levelScale: number): void {
    this.maxHealth = Math.round(5 + levelScale * 3.2);
    this.health = this.maxHealth;
    this.damage = Math.round(8 + levelScale * 1.6);
    this.speed = 78 + levelScale * 6;
    this.xpReward = Math.round(5 + levelScale * 1.1);
    this.setScale(1 + Math.min(0.6, levelScale * 0.03));
  }
}
