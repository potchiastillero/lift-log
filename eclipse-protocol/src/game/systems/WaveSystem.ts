export class WaveSystem {
  wave = 1;
  elapsedSeconds = 0;

  update(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds;
    this.wave = 1 + Math.floor(this.elapsedSeconds / 18);
  }

  getSpawnCap(): number {
    return 5 + this.wave * 2 + Math.floor(this.elapsedSeconds / 12);
  }

  getSpawnIntervalMs(): number {
    return Math.max(320, 1050 - this.elapsedSeconds * 16);
  }

  getDifficultyScale(): number {
    return 1 + this.wave * 0.55 + this.elapsedSeconds * 0.04;
  }
}
