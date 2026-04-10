import Phaser from "phaser";

export class Projectile extends Phaser.Physics.Arcade.Image {
  damage = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "projectile");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(2);
    this.setCircle(6, 2, 2);
  }

  fire(
    originX: number,
    originY: number,
    direction: Phaser.Math.Vector2,
    speed: number,
    damage: number,
  ): void {
    this.enableBody(true, originX, originY, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.setRotation(direction.angle());

    const velocity = direction.clone().normalize().scale(speed);
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    body?.velocity.set(velocity.x, velocity.y);
  }
}
