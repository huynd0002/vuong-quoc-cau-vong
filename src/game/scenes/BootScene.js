import * as Phaser from 'phaser';

/**
 * Boot Scene
 * Thiết lập cơ bản trước khi nạp tài nguyên.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
