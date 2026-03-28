/**
 * SoundEffect - 音效类
 * 可重叠播放的音频效果，播放完自动销毁
 */

import { BaseAudio } from './BaseAudio';
import type { SoundEffectOptions } from '../types';

export class SoundEffect extends BaseAudio {
  private autoDestroy: boolean = true;

  constructor(src: string, options: SoundEffectOptions = {}) {
    super(src);
    
    // 应用配置
    if (options.volume !== undefined) {
      this.volume = options.volume;
    }
    if (options.playbackRate !== undefined) {
      this.playbackRate = options.playbackRate;
    }
    if (options.loop !== undefined) {
      this.loop = options.loop;
      this.autoDestroy = !options.loop; // 循环播放时不自动销毁
    }

    // 播放结束后自动销毁
    this.audio.addEventListener('ended', () => {
      if (this.autoDestroy) {
        this.destroy();
      }
    });
  }

  /**
   * 创建并播放音效（静态方法）
   */
  static async playOnce(src: string, options: SoundEffectOptions = {}): Promise<SoundEffect> {
    const sound = new SoundEffect(src, options);
    await sound.play();
    return sound;
  }

  /**
   * 克隆音效实例（用于重叠播放）
   */
  clone(): SoundEffect {
    const cloned = new SoundEffect(this.audio.src, {
      volume: this.volume,
      playbackRate: this.playbackRate,
      loop: this.loop
    });
    return cloned;
  }
}
