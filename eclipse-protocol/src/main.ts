import Phaser from "phaser";
import { gameConfig } from "./game/config";
import "./style.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("App container not found.");
}

new Phaser.Game(gameConfig(container));
