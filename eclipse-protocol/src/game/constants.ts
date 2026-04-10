import { UpgradeOption } from "./types";

export const SCENE_KEYS = {
  boot: "boot",
  game: "game",
  ui: "ui",
} as const;

export const EVENTS = {
  hudUpdate: "hud:update",
  levelUp: "level:up",
  resume: "game:resume",
  gameOver: "game:over",
} as const;

export const UPGRADE_POOL: UpgradeOption[] = [
  {
    id: "damage-amplifier",
    category: "damage",
    label: "Damage Amplifier",
    description: "+1 projectile damage and stronger hit pulses.",
  },
  {
    id: "overclock-rounds",
    category: "damage",
    label: "Overclock Rounds",
    description: "+12% projectile speed to land hits faster.",
  },
  {
    id: "thruster-surge",
    category: "speed",
    label: "Thruster Surge",
    description: "+18 move speed for tighter repositioning.",
  },
  {
    id: "rapid-cycle",
    category: "speed",
    label: "Rapid Cycle",
    description: "+10% fire rate to keep pressure on the wave.",
  },
  {
    id: "reactive-shielding",
    category: "survivability",
    label: "Reactive Shielding",
    description: "+12 max health and partial restore.",
  },
  {
    id: "phase-weave",
    category: "survivability",
    label: "Phase Weave",
    description: "+0.15s contact invulnerability after taking damage.",
  },
];
