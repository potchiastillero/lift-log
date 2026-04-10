# Eclipse Protocol

Eclipse Protocol is a playable browser-based 2D action RPG prototype built with Phaser 3, TypeScript, and Vite. You begin underpowered, survive escalating enemy waves, gain XP, level up, and choose focused upgrades across damage, speed, and survivability.

## Features

- Top-down movement with `WASD`
- Mouse aiming and firing
- Keyboard-only firing with `Space` plus arrow-key aim
- Scaling enemy waves with increasing health, speed, and pressure
- XP, level-up, and upgrade draft flow
- Health, invulnerability window, game over, and instant restart
- Responsive full-window canvas with a separate HUD scene
- Modular scene, entity, system, and UI structure for expansion

## Tech

- Phaser 3
- TypeScript
- Vite

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Controls

- `WASD`: move
- `Mouse`: aim
- `Left click`: fire
- `Arrow keys`: keyboard aim
- `Space`: fire with keyboard aim
- `R`: restart after game over

## Project structure

- `src/game/scenes`: boot, gameplay, and UI scenes
- `src/game/entities`: player, enemy, and projectile behaviors
- `src/game/systems`: wave scaling and progression systems
- `src/game/constants.ts`: scene keys, events, and upgrade pool
- `src/game/types.ts`: shared gameplay types

## Notes

- Visuals are generated from Phaser graphics to keep the prototype asset-light and easy to modify.
- The current prototype favors clean contrast and readable combat over content volume.
- A natural next step would be adding enemy archetypes, upgrade synergies, pickups, arena set pieces, and audio.
