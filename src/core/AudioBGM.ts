/**
 * AudioBGM - 背景音乐类
 * 不可重叠，只可切换，支持淡入淡出效果
 */

import { BaseAudio } from './BaseAudio';
import type { AudioOptions } from '../types';

export class AudioBGM extends BaseAudio {
  private fadeInDuration: number = 0;
  private fadeOutDuration: number = 0;
  private fadeInterval: number | null = null;
  private targetVolume: number = 1;

  constructor(src: string, options: AudioOptions = {}) {
    super(src);
    
    // 应用配置
    this.targetVolume = options.volume ?? 1;
    this.volume = this.targetVolume;
    
    if (options.playbackRate !== undefined) {
      this.playbackRate = options.playbackRate;
    }
    if (options.loop !== undefined) {
      this.loop = options.loop;
    }
    if (options.fadeInDuration !== undefined) {
      this.fadeInDuration = options.fadeInDuration;
    }
    if (options.fadeOutDuration !== undefined) {
      this.fadeOutDuration = options.fadeOutDuration;
    }
  }

  /**
   * 播放（支持淡入）
   */
  async play(): Promise<void> {
    if (this.fadeInDuration > 0) {
      await this.fadeIn();
    } else {
      await super.play();
    }
  }

  /**
   * 停止（支持淡出）
   */
  stop(): void {
    if (this.fadeOutDuration > 0) {
      this.fadeOut().then(() => super.stop());
    } else {
      super.stop();
    }
  }

  /**
   * 淡入效果
   */
  private async fadeIn(): Promise<void> {
    this.clearFade();
    const startVolume = 0;
    this.audio.volume = startVolume;
    
    await super.play();
    
    return new Promise((resolve) => {
      const step = (this.targetVolume - startVolume) / (this.fadeInDuration / 50);
      let currentVolume = startVolume;
      
      this.fadeInterval = window.setInterval(() => {
        currentVolume += step;
        if (currentVolume >= this.targetVolume) {
          this.audio.volume = this.targetVolume;
          this.clearFade();
          resolve();
        } else {
          this.audio.volume = currentVolume;
        }
      }, 50);
    });
  }

  /**
   * 淡出效果
   */
  private async fadeOut(): Promise<void> {
    this.clearFade();
    const startVolume = this.audio.volume;
    
    return new Promise((resolve) => {
      const step = startVolume / (this.fadeOutDuration / 50);
      let currentVolume = startVolume;
      
      this.fadeInterval = window.setInterval(() => {
        currentVolume -= step;
        if (currentVolume <= 0) {
          this.audio.volume = 0;
          this.clearFade();
          resolve();
        } else {
          this.audio.volume = currentVolume;
        }
      }, 50);
    });
  }

  /**
   * 清除淡入淡出定时器
   */
  private clearFade(): void {
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  /**
   * 切换到新的BGM
   */
  async switchTo(newBGM: AudioBGM): Promise<void> {
    if (this.fadeOutDuration > 0) {
      await this.fadeOut();
    }
    this.stop();
    await newBGM.play();
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.clearFade();
    super.destroy();
  }
}
