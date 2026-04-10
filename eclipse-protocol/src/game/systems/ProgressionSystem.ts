import Phaser from "phaser";
import { UPGRADE_POOL } from "../constants";
import { Player } from "../entities/Player";
import { UpgradeLevels, UpgradeOption } from "../types";

export class ProgressionSystem {
  readonly upgrades: UpgradeLevels = {
    damage: 0,
    speed: 0,
    survivability: 0,
  };

  constructor(private readonly player: Player) {}

  gainXp(amount: number): boolean {
    this.player.stats.xp += amount;

    if (this.player.stats.xp < this.player.stats.xpToNext) {
      return false;
    }

    this.player.stats.xp -= this.player.stats.xpToNext;
    this.player.stats.level += 1;
    this.player.stats.xpToNext = Math.round(this.player.stats.xpToNext * 1.34);
    return true;
  }

  draftOptions(rng: Phaser.Math.RandomDataGenerator): UpgradeOption[] {
    const uniqueCategories = ["damage", "speed", "survivability"] as const;

    return uniqueCategories.map((category) => {
      const pool = UPGRADE_POOL.filter((upgrade) => upgrade.category === category);
      return pool[rng.between(0, pool.length - 1)];
    });
  }

  applyUpgrade(option: UpgradeOption): void {
    this.upgrades[option.category] += 1;

    switch (option.id) {
      case "damage-amplifier":
        this.player.stats.projectileDamage += 1;
        break;
      case "overclock-rounds":
        this.player.stats.projectileSpeed += 70;
        this.player.stats.projectileDamage += 0.5;
        break;
      case "thruster-surge":
        this.player.stats.moveSpeed += 18;
        break;
      case "rapid-cycle":
        this.player.stats.fireRate += 0.5;
        break;
      case "reactive-shielding":
        this.player.stats.maxHealth += 12;
        this.player.stats.health = Math.min(
          this.player.stats.maxHealth,
          this.player.stats.health + 18,
        );
        break;
      case "phase-weave":
        this.player.stats.health = Math.min(
          this.player.stats.maxHealth,
          this.player.stats.health + 10,
        );
        break;
    }
  }

  getInvulnerabilityDuration(): number {
    return 450 + this.upgrades.survivability * 150;
  }
}
