/**
 * AudioBGM - 背景音乐类
 * 不可重叠，只可切换，支持淡入淡出效果
 */

import { BaseAudio } from './BaseAudio';
import type { AudioOptions } from '../types';

export class AudioBGM extends BaseAudio {
  private fadeInMs: number = 0;
  private fadeOutMs: number = 0;
  private fadeTimer: number | null = null;
  private targetVol: number = 1;

  constructor(src: string, options: AudioOptions = {}) {
    super(src);
    
    // 应用配置
    this.targetVol = options.volume ?? 1;
    this.volume = this.targetVol;
    
    if (options.playbackRate !== undefined) {
      this.playbackRate = options.playbackRate;
    }
    if (options.loop !== undefined) {
      this.loop = options.loop;
    }
    if (options.fadeInDuration !== undefined) {
      this.fadeInMs = options.fadeInDuration;
    }
    if (options.fadeOutDuration !== undefined) {
      this.fadeOutMs = options.fadeOutDuration;
    }
  }

  /**
   * 播放（支持淡入）
   */
  async play(): Promise<void> {
    if (this.fadeInMs > 0) {
      await this.fadeIn();
    } else {
      await super.play();
    }
  }

  /**
   * 停止（支持淡出）
   */
  stop(): void {
    if (this.fadeOutMs > 0) {
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
    const startVol = 0;
    this.audio.volume = startVol;
    
    await super.play();
    
    return new Promise((resolve) => {
      const step = (this.targetVol - startVol) / (this.fadeInMs / 50);
      let vol = startVol;
      
      this.fadeTimer = window.setInterval(() => {
        vol += step;
        if (vol >= this.targetVol) {
          this.audio.volume = this.targetVol;
          this.clearFade();
          resolve();
        } else {
          this.audio.volume = vol;
        }
      }, 50);
    });
  }

  /**
   * 淡出效果
   */
  private async fadeOut(): Promise<void> {
    this.clearFade();
    const startVol = this.audio.volume;
    
    return new Promise((resolve) => {
      const step = startVol / (this.fadeOutMs / 50);
      let vol = startVol;
      
      this.fadeTimer = window.setInterval(() => {
        vol -= step;
        if (vol <= 0) {
          this.audio.volume = 0;
          this.clearFade();
          resolve();
        } else {
          this.audio.volume = vol;
        }
      }, 50);
    });
  }

  /**
   * 清除淡入淡出定时器
   */
  private clearFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  /**
   * 切换到新的BGM
   */
  async switchTo(newBGM: AudioBGM): Promise<void> {
    if (this.fadeOutMs > 0) {
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
