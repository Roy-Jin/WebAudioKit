/**
 * Music - 音乐类
 * 具有完整元数据、歌词解析、播放列表等功能的音乐播放器
 */

import { BaseAudio } from './BaseAudio';
import type { MusicOptions, MusicMetadata, LyricLine, MetingData } from '../types';
import { PlayState } from '../types';
import { Lrc } from 'lrc-kit';

export class Music extends BaseAudio {
  private metadata: MusicMetadata;
  private lyrics: LyricLine[] = [];
  private currentLyricIndex: number = -1;
  private _state: PlayState = PlayState.STOPPED;

  constructor(src: string, options: MusicOptions = {}) {
    super(src);
    
    this.metadata = options.metadata || {};
    
    // 应用配置
    if (options.volume !== undefined) {
      this.volume = options.volume;
    }
    if (options.playbackRate !== undefined) {
      this.playbackRate = options.playbackRate;
    }
    if (options.loop !== undefined) {
      this.loop = options.loop;
    }

    // 解析歌词
    if (this.metadata.lrc) {
      this.parseLyrics(this.metadata.lrc);
    }

    // 监听时间更新以同步歌词
    this.on('timeupdate', () => this.updateCurrentLyric());
    this.on('play', () => this._state = PlayState.PLAYING);
    this.on('pause', () => this._state = PlayState.PAUSED);
    this.on('stop', () => this._state = PlayState.STOPPED);
    this.on('error', () => this._state = PlayState.ERROR);
  }

  /**
   * 从Meting API数据创建音乐实例
   */
  static async fromMetingData(data: MetingData, options: MusicOptions = {}): Promise<Music> {
    const metadata: MusicMetadata = {
      title: data.name,
      artist: data.artist,
      album: data.album,
      cover: data.pic
    };

    // 如果有歌词URL，获取歌词
    if (data.lrc) {
      try {
        const response = await fetch(data.lrc);
        metadata.lrc = await response.text();
      } catch (error) {
        console.warn('Failed to fetch lyrics:', error);
      }
    }

    return new Music(data.url, {
      ...options,
      metadata
    });
  }

  /**
   * 解析LRC歌词
   */
  private parseLyrics(lrcText: string): void {
    try {
      const lrc = Lrc.parse(lrcText);
      this.lyrics = lrc.lyrics.map(line => ({
        time: line.timestamp / 1000, // 转换为秒
        text: line.content
      }));
    } catch (error) {
      console.warn('Failed to parse lyrics:', error);
      this.lyrics = [];
    }
  }

  /**
   * 更新当前歌词
   */
  private updateCurrentLyric(): void {
    if (this.lyrics.length === 0) return;

    const currentTime = this.currentTime;
    let newIndex = -1;

    for (let i = 0; i < this.lyrics.length; i++) {
      if (currentTime >= this.lyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== this.currentLyricIndex) {
      this.currentLyricIndex = newIndex;
      this.emit('lyricchange', this.getCurrentLyric());
    }
  }

  /**
   * 获取当前歌词
   */
  getCurrentLyric(): LyricLine | null {
    if (this.currentLyricIndex >= 0 && this.currentLyricIndex < this.lyrics.length) {
      return this.lyrics[this.currentLyricIndex];
    }
    return null;
  }

  /**
   * 获取所有歌词
   */
  getAllLyrics(): LyricLine[] {
    return [...this.lyrics];
  }

  /**
   * 获取元数据
   */
  getMetadata(): MusicMetadata {
    return { ...this.metadata };
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: Partial<MusicMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
    
    // 如果更新了歌词，重新解析
    if (metadata.lrc) {
      this.parseLyrics(metadata.lrc);
    }
  }

  /**
   * 获取播放状态
   */
  get state(): PlayState {
    return this._state;
  }

  /**
   * 获取播放进度（0-1）
   */
  get progress(): number {
    if (this.duration === 0) return 0;
    return this.currentTime / this.duration;
  }

  /**
   * 设置播放进度（0-1）
   */
  set progress(value: number) {
    this.currentTime = value * this.duration;
  }
}
