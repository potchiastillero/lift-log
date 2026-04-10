export type UpgradeCategory = "damage" | "speed" | "survivability";

export interface UpgradeOption {
  id: string;
  category: UpgradeCategory;
  label: string;
  description: string;
}

export interface UpgradeLevels {
  damage: number;
  speed: number;
  survivability: number;
}

export interface PlayerStats {
  maxHealth: number;
  health: number;
  moveSpeed: number;
  projectileSpeed: number;
  projectileDamage: number;
  fireRate: number;
  xp: number;
  xpToNext: number;
  level: number;
  invulnerableUntil: number;
}

export interface HudState {
  health: number;
  maxHealth: number;
  xp: number;
  xpToNext: number;
  level: number;
  upgrades: UpgradeLevels;
  wave: number;
  elapsedSeconds: number;
}
