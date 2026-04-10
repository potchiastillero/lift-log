import Phaser from "phaser";
import { SCENE_KEYS } from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  create(): void {
    this.createTextures();
    this.scene.start(SCENE_KEYS.game);
    this.scene.start(SCENE_KEYS.ui);
  }

  private createTextures(): void {
    const grid = this.make.graphics({ x: 0, y: 0, add: false });
    grid.fillStyle(0x08111d, 1);
    grid.fillRect(0, 0, 128, 128);
    grid.lineStyle(1, 0x173149, 0.65);

    for (let i = 0; i <= 128; i += 32) {
      grid.lineBetween(i, 0, i, 128);
      grid.lineBetween(0, i, 128, i);
    }

    grid.generateTexture("grid", 128, 128);
    grid.destroy();

    const player = this.make.graphics({ x: 0, y: 0, add: false });
    player.fillStyle(0x8ef9ff, 1);
    player.fillTriangle(22, 0, 44, 48, 22, 38);
    player.fillStyle(0x3ed0ff, 1);
    player.fillTriangle(22, 14, 34, 40, 22, 32);
    player.fillStyle(0xffffff, 1);
    player.fillCircle(22, 20, 4);
    player.generateTexture("player", 44, 48);
    player.destroy();

    const enemy = this.make.graphics({ x: 0, y: 0, add: false });
    enemy.fillStyle(0xff5577, 1);
    enemy.fillCircle(20, 20, 18);
    enemy.fillStyle(0x300611, 1);
    enemy.fillCircle(20, 20, 8);
    enemy.lineStyle(2, 0xffb1be, 0.8);
    enemy.strokeCircle(20, 20, 18);
    enemy.generateTexture("enemy", 40, 40);
    enemy.destroy();

    const projectile = this.make.graphics({ x: 0, y: 0, add: false });
    projectile.fillStyle(0xf6ff8a, 1);
    projectile.fillCircle(8, 8, 6);
    projectile.lineStyle(2, 0xffffff, 0.8);
    projectile.strokeCircle(8, 8, 6);
    projectile.generateTexture("projectile", 16, 16);
    projectile.destroy();

    const hit = this.make.graphics({ x: 0, y: 0, add: false });
    hit.fillStyle(0xffffff, 0.8);
    hit.fillCircle(24, 24, 8);
    hit.generateTexture("hit", 48, 48);
    hit.destroy();
  }
}
