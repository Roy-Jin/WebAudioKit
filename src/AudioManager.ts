/**
 * AudioManager - 音频管理器
 * 管理所有音频实例和全局配置
 */

import { SoundEffect } from './core/SoundEffect';
import { AudioBGM } from './core/AudioBGM';
import { Music } from './core/Music';
import { MusicPlaylist } from './core/MusicPlaylist';
import type { 
  AudioManagerConfig, 
  SoundEffectOptions, 
  AudioOptions, 
  MusicOptions,
  PlayMode 
} from './types';

export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private config: Required<AudioManagerConfig> = {
    volume: 1,
    pauseOnHidden: true,
    muted: false
  };

  private soundEffects: Set<SoundEffect> = new Set();
  private currentBGM: AudioBGM | null = null;
  private musicPlaylist: MusicPlaylist | null = null;
  private visibilityChangeHandler: (() => void) | null = null;

  private constructor(config: AudioManagerConfig = {}) {
    this.updateConfig(config);
    this.setupVisibilityHandler();
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: AudioManagerConfig): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(config);
    }
    return AudioManager.instance;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AudioManagerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 应用全局音量
    if (config.volume !== undefined) {
      this.applyGlobalVolume();
    }

    // 应用静音状态
    if (config.muted !== undefined) {
      this.applyMutedState();
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
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.applyGlobalVolume();
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
  setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.applyMutedState();
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
  private applyGlobalVolume(): void {
    // 应用到所有音效
    this.soundEffects.forEach(sound => {
      sound.volume = this.config.volume;
    });

    // 应用到BGM
    if (this.currentBGM) {
      this.currentBGM.volume = this.config.volume;
    }

    // 应用到音乐播放列表
    if (this.musicPlaylist) {
      const currentMusic = this.musicPlaylist.getCurrentMusic();
      if (currentMusic) {
        currentMusic.volume = this.config.volume;
      }
    }
  }

  /**
   * 应用静音状态
   */
  private applyMutedState(): void {
    const volume = this.config.muted ? 0 : this.config.volume;

    this.soundEffects.forEach(sound => {
      sound.volume = volume;
    });

    if (this.currentBGM) {
      this.currentBGM.volume = volume;
    }

    if (this.musicPlaylist) {
      const currentMusic = this.musicPlaylist.getCurrentMusic();
      if (currentMusic) {
        currentMusic.volume = volume;
      }
    }
  }

  /**
   * 创建音效
   */
  createSoundEffect(src: string, options: SoundEffectOptions = {}): SoundEffect {
    const sound = new SoundEffect(src, {
      ...options,
      volume: options.volume ?? this.config.volume
    });

    this.soundEffects.add(sound);

    // 音效结束后从集合中移除
    sound.on('ended', () => {
      this.soundEffects.delete(sound);
    });

    return sound;
  }

  /**
   * 播放音效（快捷方法）
   */
  async playSoundEffect(src: string, options: SoundEffectOptions = {}): Promise<SoundEffect> {
    const sound = this.createSoundEffect(src, options);
    await sound.play();
    return sound;
  }

  /**
   * 停止所有音效
   */
  stopAllSoundEffects(): void {
    this.soundEffects.forEach(sound => sound.stop());
    this.soundEffects.clear();
  }

  /**
   * 创建BGM
   */
  createBGM(src: string, options: AudioOptions = {}): AudioBGM {
    const bgm = new AudioBGM(src, {
      ...options,
      volume: options.volume ?? this.config.volume
    });
    return bgm;
  }

  /**
   * 播放BGM
   */
  async playBGM(src: string, options: AudioOptions = {}): Promise<AudioBGM> {
    // 停止当前BGM
    if (this.currentBGM) {
      this.currentBGM.stop();
    }

    const bgm = this.createBGM(src, options);
    this.currentBGM = bgm;
    await bgm.play();
    return bgm;
  }

  /**
   * 切换BGM
   */
  async switchBGM(src: string, options: AudioOptions = {}): Promise<AudioBGM> {
    const newBGM = this.createBGM(src, options);
    
    if (this.currentBGM) {
      await this.currentBGM.switchTo(newBGM);
    } else {
      await newBGM.play();
    }

    this.currentBGM = newBGM;
    return newBGM;
  }

  /**
   * 停止BGM
   */
  stopBGM(): void {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM = null;
    }
  }

  /**
   * 获取当前BGM
   */
  getCurrentBGM(): AudioBGM | null {
    return this.currentBGM;
  }

  /**
   * 创建音乐播放列表
   */
  createMusicPlaylist(musics: Music[] = []): MusicPlaylist {
    this.musicPlaylist = new MusicPlaylist(musics);
    return this.musicPlaylist;
  }

  /**
   * 获取音乐播放列表
   */
  getMusicPlaylist(): MusicPlaylist | null {
    return this.musicPlaylist;
  }

  /**
   * 播放音乐播放列表中的当前音乐
   */
  async playCurrentMusic(): Promise<void> {
    if (!this.musicPlaylist) return;

    const music = this.musicPlaylist.getCurrentMusic();
    if (music) {
      music.volume = this.config.muted ? 0 : this.config.volume;
      await music.play();
    }
  }

  /**
   * 播放下一首音乐
   */
  async playNextMusic(): Promise<void> {
    if (!this.musicPlaylist) return;

    const currentMusic = this.musicPlaylist.getCurrentMusic();
    if (currentMusic) {
      currentMusic.stop();
    }

    const nextMusic = this.musicPlaylist.next();
    if (nextMusic) {
      nextMusic.volume = this.config.muted ? 0 : this.config.volume;
      await nextMusic.play();
    }
  }

  /**
   * 播放上一首音乐
   */
  async playPreviousMusic(): Promise<void> {
    if (!this.musicPlaylist) return;

    const currentMusic = this.musicPlaylist.getCurrentMusic();
    if (currentMusic) {
      currentMusic.stop();
    }

    const prevMusic = this.musicPlaylist.previous();
    if (prevMusic) {
      prevMusic.volume = this.config.muted ? 0 : this.config.volume;
      await prevMusic.play();
    }
  }

  /**
   * 设置音乐播放模式
   */
  setMusicPlayMode(mode: PlayMode): void {
    if (this.musicPlaylist) {
      this.musicPlaylist.playMode = mode;
    }
  }

  /**
   * 设置页面可见性处理
   */
  private setupVisibilityHandler(): void {
    this.visibilityChangeHandler = () => {
      if (!this.config.pauseOnHidden) return;

      if (document.hidden) {
        // 页面隐藏时暂停所有音频
        this.soundEffects.forEach(sound => {
          if (!sound.paused) {
            sound.pause();
            (sound as any)._wasPlayingBeforeHidden = true;
          }
        });

        if (this.currentBGM && !this.currentBGM.paused) {
          this.currentBGM.pause();
          (this.currentBGM as any)._wasPlayingBeforeHidden = true;
        }

        if (this.musicPlaylist) {
          const music = this.musicPlaylist.getCurrentMusic();
          if (music && !music.paused) {
            music.pause();
            (music as any)._wasPlayingBeforeHidden = true;
          }
        }
      } else {
        // 页面显示时恢复播放
        this.soundEffects.forEach(sound => {
          if ((sound as any)._wasPlayingBeforeHidden) {
            sound.play();
            delete (sound as any)._wasPlayingBeforeHidden;
          }
        });

        if (this.currentBGM && (this.currentBGM as any)._wasPlayingBeforeHidden) {
          this.currentBGM.play();
          delete (this.currentBGM as any)._wasPlayingBeforeHidden;
        }

        if (this.musicPlaylist) {
          const music = this.musicPlaylist.getCurrentMusic();
          if (music && (music as any)._wasPlayingBeforeHidden) {
            music.play();
            delete (music as any)._wasPlayingBeforeHidden;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 停止所有音效
    this.stopAllSoundEffects();

    // 停止BGM
    this.stopBGM();

    // 停止音乐
    if (this.musicPlaylist) {
      const music = this.musicPlaylist.getCurrentMusic();
      if (music) {
        music.stop();
      }
    }

    // 移除事件监听
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    AudioManager.instance = null;
  }
}
