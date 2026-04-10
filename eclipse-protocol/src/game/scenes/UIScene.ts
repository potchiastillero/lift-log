import Phaser from "phaser";
import { EVENTS, SCENE_KEYS } from "../constants";
import { HudState, UpgradeOption } from "../types";

export class UIScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Container;
  private gameScene!: Phaser.Scene;

  constructor() {
    super(SCENE_KEYS.ui);
  }

  create(): void {
    this.gameScene = this.scene.get(SCENE_KEYS.game);

    this.hudText = this.add
      .text(24, 20, "", {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "20px",
        color: "#f5fbff",
        lineSpacing: 8,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.hintText = this.add
      .text(24, 136, "Move: WASD  Aim: Mouse or Arrows  Fire: Click or Space", {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "14px",
        color: "#8aa1b8",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.panel = this.add.container(0, 0).setVisible(false).setDepth(20);

    this.scale.on("resize", this.layout, this);
    this.layout();

    this.gameScene.events.on(EVENTS.hudUpdate, this.renderHud, this);
    this.gameScene.events.on(EVENTS.levelUp, this.openUpgradeDraft, this);
    this.gameScene.events.on(EVENTS.gameOver, this.openGameOver, this);
  }

  private renderHud(state: HudState): void {
    this.hudText.setText([
      `Health  ${Math.ceil(state.health)} / ${state.maxHealth}`,
      `XP      ${Math.floor(state.xp)} / ${state.xpToNext}`,
      `Level   ${state.level}`,
      `Wave    ${state.wave}`,
      `Time    ${state.elapsedSeconds.toFixed(1)}s`,
      `Upgrades  DMG ${state.upgrades.damage}  SPD ${state.upgrades.speed}  SUR ${state.upgrades.survivability}`,
    ]);
  }

  private openUpgradeDraft(payload: { options: UpgradeOption[] }): void {
    this.panel.removeAll(true);
    this.panel.setVisible(true);

    const { width, height } = this.scale;
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x010204, 0.72)
      .setOrigin(0);
    const card = this.add
      .rectangle(
        width / 2,
        height / 2,
        Math.min(980, width - 40),
        320,
        0x07111c,
        0.95,
      )
      .setStrokeStyle(2, 0x2bd9ff, 0.45);
    const title = this.add
      .text(width / 2, height / 2 - 118, "Signal Upgrade", {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "34px",
        color: "#f5fbff",
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(
        width / 2,
        height / 2 - 78,
        "Choose one protocol enhancement.",
        {
          fontFamily: "Trebuchet MS, sans-serif",
          fontSize: "16px",
          color: "#93a8be",
        },
      )
      .setOrigin(0.5);

    this.panel.add([overlay, card, title, subtitle]);

    payload.options.forEach((option, index) => {
      const boxWidth = Math.min(280, (width - 100) / 3);
      const x = width / 2 - boxWidth - 22 + index * (boxWidth + 22);
      const y = height / 2 - 20;
      const box = this.add
        .rectangle(x, y, boxWidth, 160, 0x0e1b2b, 0.98)
        .setStrokeStyle(2, this.categoryColor(option.category), 0.85)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x - boxWidth / 2 + 18, y - 52, option.label, {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "24px",
        color: "#f5fbff",
        wordWrap: { width: boxWidth - 36 },
      });
      const category = this.add.text(
        x - boxWidth / 2 + 18,
        y - 20,
        option.category.toUpperCase(),
        {
          fontFamily: "Trebuchet MS, sans-serif",
          fontSize: "13px",
          color: Phaser.Display.Color.IntegerToColor(
            this.categoryColor(option.category),
          ).rgba,
        },
      );
      const description = this.add.text(
        x - boxWidth / 2 + 18,
        y + 10,
        option.description,
        {
          fontFamily: "Trebuchet MS, sans-serif",
          fontSize: "15px",
          color: "#9db2c8",
          wordWrap: { width: boxWidth - 36 },
          lineSpacing: 4,
        },
      );

      box.on("pointerover", () => box.setFillStyle(0x13253a, 1));
      box.on("pointerout", () => box.setFillStyle(0x0e1b2b, 0.98));
      box.on("pointerdown", () => {
        this.panel.setVisible(false);
        this.panel.removeAll(true);
        this.gameScene.events.emit(EVENTS.resume, option);
      });

      this.panel.add([box, label, category, description]);
    });
  }

  private openGameOver(): void {
    this.panel.removeAll(true);
    this.panel.setVisible(true);

    const { width, height } = this.scale;
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0);
    const card = this.add
      .rectangle(width / 2, height / 2, 520, 240, 0x0b121d, 0.96)
      .setStrokeStyle(2, 0xff5d77, 0.75);
    const title = this.add
      .text(width / 2, height / 2 - 44, "Protocol Collapse", {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    const body = this.add
      .text(
        width / 2,
        height / 2 + 6,
        "The eclipse consumed the run.\nPress R to restart instantly.",
        {
          align: "center",
          fontFamily: "Trebuchet MS, sans-serif",
          fontSize: "18px",
          color: "#afc0d2",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    this.panel.add([overlay, card, title, body]);
  }

  private categoryColor(category: UpgradeOption["category"]): number {
    switch (category) {
      case "damage":
        return 0xffb347;
      case "speed":
        return 0x38f1d6;
      case "survivability":
        return 0x8db5ff;
    }
  }

  private layout(): void {
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);
  }
}
