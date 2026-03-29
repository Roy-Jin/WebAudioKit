/**
 * AudioManager - 音频管理器
 * 管理所有音频实例和全局配置
 */

import { SoundEffect } from './core/SoundEffect';
import { AudioBGM } from './core/AudioBGM';
import { Music } from './core/Music';
import type { 
  AudioManagerConfig, 
  SoundEffectOptions, 
  AudioOptions, 
  MusicOptions
} from './types';

export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private config: Required<AudioManagerConfig> = {
    volume: 1,
    pauseOnHidden: true,
    muted: false
  };

  private sounds: Set<SoundEffect> = new Set();
  private bgm: AudioBGM | null = null;
  private music: Music | null = null;
  private visibilityHandler: (() => void) | null = null;

  private constructor(config: AudioManagerConfig = {}) {
    this.setConfig(config);
    this.setupVisibility();
  }

  /**
   * 获取单例实例
   */
  static get(config?: AudioManagerConfig): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(config);
    }
    return AudioManager.instance;
  }

  // ==================== 配置管理 ====================

  /**
   * 更新配置
   */
  setConfig(config: Partial<AudioManagerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.volume !== undefined) {
      this.applyVolume();
    }

    if (config.muted !== undefined) {
      this.applyMute();
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Required<AudioManagerConfig> {
    return { ...this.config };
  }

  /**
   * 设置全局音量
   */
  setVolume(vol: number): void {
    this.config.volume = Math.max(0, Math.min(1, vol));
    this.applyVolume();
  }

  /**
   * 获取全局音量
   */
  getVolume(): number {
    return this.config.volume;
  }

  /**
   * 设置静音
   */
  setMute(muted: boolean): void {
    this.config.muted = muted;
    this.applyMute();
  }

  /**
   * 获取静音状态
   */
  isMuted(): boolean {
    return this.config.muted;
  }

  /**
   * 应用全局音量
   */
  private applyVolume(): void {
    this.sounds.forEach(s => s.volume = this.config.volume);
    if (this.bgm) this.bgm.volume = this.config.volume;
    if (this.music) this.music.volume = this.config.volume;
  }

  /**
   * 应用静音状态
   */
  private applyMute(): void {
    const vol = this.config.muted ? 0 : this.config.volume;
    this.sounds.forEach(s => s.volume = vol);
    if (this.bgm) this.bgm.volume = vol;
    if (this.music) this.music.volume = vol;
  }

  // ==================== 音效管理 ====================

  /**
   * 创建音效
   */
  createSound(src: string, options: SoundEffectOptions = {}): SoundEffect {
    const sound = new SoundEffect(src, {
      ...options,
      volume: options.volume ?? this.config.volume
    });

    this.sounds.add(sound);
    sound.on('ended', () => this.sounds.delete(sound));

    return sound;
  }

  /**
   * 播放音效（快捷方法）
   */
  async playSound(src: string, options: SoundEffectOptions = {}): Promise<SoundEffect> {
    const sound = this.createSound(src, options);
    await sound.play();
    return sound;
  }

  /**
   * 停止所有音效
   */
  stopSounds(): void {
    this.sounds.forEach(s => s.stop());
    this.sounds.clear();
  }

  // ==================== BGM管理 ====================

  /**
   * 创建BGM
   */
  createBGM(src: string, options: AudioOptions = {}): AudioBGM {
    return new AudioBGM(src, {
      ...options,
      volume: options.volume ?? this.config.volume
    });
  }

  /**
   * 播放BGM
   */
  async playBGM(src: string, options: AudioOptions = {}): Promise<AudioBGM> {
    if (this.bgm) {
      this.bgm.stop();
    }

    const newBGM = this.createBGM(src, options);
    this.bgm = newBGM;
    await newBGM.play();
    return newBGM;
  }

  /**
   * 切换BGM
   */
  async switchBGM(src: string, options: AudioOptions = {}): Promise<AudioBGM> {
    const newBGM = this.createBGM(src, options);
    
    if (this.bgm) {
      await this.bgm.switchTo(newBGM);
    } else {
      await newBGM.play();
    }

    this.bgm = newBGM;
    return newBGM;
  }

  /**
   * 停止BGM
   */
  stopBGM(): void {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
  }

  /**
   * 获取当前BGM
   */
  getBGM(): AudioBGM | null {
    return this.bgm;
  }

  // ==================== 音乐管理 ====================

  /**
   * 创建音乐播放器
   */
  createMusic(src: string, options: MusicOptions = {}): Music {
    return new Music(src, {
      ...options,
      volume: options.volume ?? this.config.volume
    });
  }

  /**
   * 设置音乐播放器
   */
  setMusic(music: Music): void {
    if (this.music) {
      this.music.stop();
    }
    this.music = music;
  }

  /**
   * 获取音乐播放器
   */
  getMusic(): Music | null {
    return this.music;
  }

  /**
   * 播放当前音乐
   */
  async playMusic(): Promise<void> {
    if (this.music) {
      this.music.volume = this.config.muted ? 0 : this.config.volume;
      await this.music.play();
    }
  }

  /**
   * 停止音乐
   */
  stopMusic(): void {
    if (this.music) {
      this.music.stop();
    }
  }

  // ==================== 页面可见性处理 ====================

  /**
   * 设置页面可见性处理
   */
  private setupVisibility(): void {
    this.visibilityHandler = () => {
      if (!this.config.pauseOnHidden) return;

      if (document.hidden) {
        // 页面隐藏时暂停并静音所有音频
        this.sounds.forEach(s => {
          if (!s.paused) {
            s.pause();
            (s as any)._wasPlaying = true;
          }
          (s as any)._vol = s.volume;
          s.volume = 0;
        });

        if (this.bgm) {
          if (!this.bgm.paused) {
            this.bgm.pause();
            (this.bgm as any)._wasPlaying = true;
          }
          (this.bgm as any)._vol = this.bgm.volume;
          this.bgm.volume = 0;
        }

        if (this.music) {
          if (!this.music.paused) {
            this.music.pause();
            (this.music as any)._wasPlaying = true;
          }
          (this.music as any)._vol = this.music.volume;
          this.music.volume = 0;
        }
      } else {
        // 页面显示时恢复播放和音量
        this.sounds.forEach(s => {
          if ((s as any)._vol !== undefined) {
            s.volume = (s as any)._vol;
            delete (s as any)._vol;
          }
          if ((s as any)._wasPlaying) {
            s.play();
            delete (s as any)._wasPlaying;
          }
        });

        if (this.bgm) {
          if ((this.bgm as any)._vol !== undefined) {
            this.bgm.volume = (this.bgm as any)._vol;
            delete (this.bgm as any)._vol;
          }
          if ((this.bgm as any)._wasPlaying) {
            this.bgm.play();
            delete (this.bgm as any)._wasPlaying;
          }
        }

        if (this.music) {
          if ((this.music as any)._vol !== undefined) {
            this.music.volume = (this.music as any)._vol;
            delete (this.music as any)._vol;
          }
          if ((this.music as any)._wasPlaying) {
            this.music.play();
            delete (this.music as any)._wasPlaying;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // ==================== 销毁 ====================

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopSounds();
    this.stopBGM();
    this.stopMusic();

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }

    AudioManager.instance = null;
  }
}
