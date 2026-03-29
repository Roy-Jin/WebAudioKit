/**
 * Music - 音乐播放器类
 * 支持单曲播放、播放列表、歌词解析等功能
 */

import { BaseAudio } from './BaseAudio';
import type { MusicOptions, MusicMetadata, LyricLine, MetingData } from '../types';
import { PlayState, PlayMode } from '../types';
import { Lrc } from 'lrc-kit';

export class Music extends BaseAudio {
  private metadata: MusicMetadata;
  private lyrics: LyricLine[] = [];
  private lyricIndex: number = -1;
  private _state: PlayState = PlayState.STOPPED;
  
  // 播放列表相关
  private playlist: Music[] = [];
  private index: number = -1;
  private mode: PlayMode = PlayMode.SEQUENTIAL;
  private shuffleOrder: number[] = [];

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

    // 监听事件
    this.on('timeupdate', () => this.updateLyric());
    this.on('play', () => this._state = PlayState.PLAYING);
    this.on('pause', () => this._state = PlayState.PAUSED);
    this.on('stop', () => this._state = PlayState.STOPPED);
    this.on('error', () => this._state = PlayState.ERROR);
  }

  /**
   * 从Meting API数据创建音乐实例
   */
  static async fromMeting(data: MetingData[], options: MusicOptions = {}): Promise<Music[]> {
    const musicList: Music[] = [];

    for (const item of data) {
      const metadata: MusicMetadata = {
        title: item.name ?? item.title,
        artist: item.artist ?? item.author,
        album: item.album ?? "",
        cover: item.pic ?? item.cover,
      };

      // 获取歌词
      if (item.lrc || item.lyric) {
        try {
          const response = await fetch(item.lrc ?? item.lyric);
          metadata.lrc = await response.text();
        } catch (error) {
          console.warn('Failed to fetch lyrics:', error);
        }
      }

      const music = new Music(item.url, {
        ...options,
        metadata
      });

      musicList.push(music);
    }

    return musicList;
  }

  // ==================== 歌词相关 ====================

  /**
   * 解析LRC歌词
   */
  private parseLyrics(lrcText: string): void {
    try {
      const lrc = Lrc.parse(lrcText);
      this.lyrics = lrc.lyrics.map(line => ({
        time: line.timestamp,
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
  private updateLyric(): void {
    if (this.lyrics.length === 0) return;

    const time = this.currentTime;
    let newIndex = -1;

    for (let i = 0; i < this.lyrics.length; i++) {
      if (time >= this.lyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== this.lyricIndex) {
      this.lyricIndex = newIndex;
      this.emit('lyricchange', this.getLyric());
    }
  }

  /**
   * 获取当前歌词
   */
  getLyric(): LyricLine | null {
    if (this.lyricIndex >= 0 && this.lyricIndex < this.lyrics.length) {
      return this.lyrics[this.lyricIndex];
    }
    return null;
  }

  /**
   * 获取所有歌词
   */
  getLyrics(): LyricLine[] {
    return [...this.lyrics];
  }

  // ==================== 元数据相关 ====================

  /**
   * 获取元数据
   */
  getMeta(): MusicMetadata {
    return { ...this.metadata };
  }

  /**
   * 更新元数据
   */
  setMeta(metadata: Partial<MusicMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
    
    // 如果更新了歌词，重新解析
    if (metadata.lrc) {
      this.parseLyrics(metadata.lrc);
    }
  }

  // ==================== 播放状态相关 ====================

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

  // ==================== 播放列表相关 ====================

  /**
   * 添加到播放列表
   */
  add(music: Music): void {
    this.playlist.push(music);
    if (this.index === -1) {
      this.index = 0;
    }
    this.updateShuffle();
  }

  /**
   * 批量添加到播放列表
   */
  addList(musicList: Music[]): void {
    this.playlist.push(...musicList);
    if (this.index === -1 && this.playlist.length > 0) {
      this.index = 0;
    }
    this.updateShuffle();
  }

  /**
   * 从Meting API数据添加到播放列表
   */
  async addFromMeting(data: MetingData[], options: MusicOptions = {}): Promise<void> {
    const musicList = await Music.fromMeting(data, options);
    this.addList(musicList);
  }

  /**
   * 从播放列表移除
   */
  remove(idx: number): void {
    if (idx >= 0 && idx < this.playlist.length) {
      this.playlist.splice(idx, 1);
      if (this.index >= this.playlist.length) {
        this.index = this.playlist.length - 1;
      }
      this.updateShuffle();
    }
  }

  /**
   * 清空播放列表
   */
  clear(): void {
    this.playlist = [];
    this.index = -1;
    this.shuffleOrder = [];
  }

  /**
   * 获取当前音乐
   */
  getCurrent(): Music | null {
    if (this.index >= 0 && this.index < this.playlist.length) {
      return this.playlist[this.index];
    }
    return null;
  }

  /**
   * 获取指定音乐
   */
  get(idx: number): Music | null {
    if (idx >= 0 && idx < this.playlist.length) {
      return this.playlist[idx];
    }
    return null;
  }

  /**
   * 获取所有音乐
   */
  getAll(): Music[] {
    return [...this.playlist];
  }

  /**
   * 获取列表长度
   */
  get length(): number {
    return this.playlist.length;
  }

  /**
   * 获取/设置当前索引
   */
  get currentIndex(): number {
    return this.index;
  }

  set currentIndex(value: number) {
    if (value >= 0 && value < this.playlist.length) {
      this.index = value;
    }
  }

  /**
   * 获取/设置播放模式
   */
  get playMode(): PlayMode {
    return this.mode;
  }

  set playMode(value: PlayMode) {
    this.mode = value;
    if (value === PlayMode.SHUFFLE) {
      this.updateShuffle();
    }
  }

  /**
   * 下一首
   */
  next(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this.mode) {
      case PlayMode.SINGLE:
        return this.getCurrent();

      case PlayMode.SHUFFLE:
        const currIdx = this.shuffleOrder.indexOf(this.index);
        const nextIdx = (currIdx + 1) % this.shuffleOrder.length;
        this.index = this.shuffleOrder[nextIdx];
        break;

      case PlayMode.LOOP:
        this.index = (this.index + 1) % this.playlist.length;
        break;

      case PlayMode.SEQUENTIAL:
        if (this.index < this.playlist.length - 1) {
          this.index++;
        } else {
          return null;
        }
        break;
    }

    return this.getCurrent();
  }

  /**
   * 上一首
   */
  prev(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this.mode) {
      case PlayMode.SINGLE:
        return this.getCurrent();

      case PlayMode.SHUFFLE:
        const currIdx = this.shuffleOrder.indexOf(this.index);
        const prevIdx = currIdx === 0 ? this.shuffleOrder.length - 1 : currIdx - 1;
        this.index = this.shuffleOrder[prevIdx];
        break;

      case PlayMode.LOOP:
        this.index = this.index === 0 ? this.playlist.length - 1 : this.index - 1;
        break;

      case PlayMode.SEQUENTIAL:
        if (this.index > 0) {
          this.index--;
        } else {
          return null;
        }
        break;
    }

    return this.getCurrent();
  }

  /**
   * 更新随机播放顺序
   */
  private updateShuffle(): void {
    this.shuffleOrder = Array.from({ length: this.playlist.length }, (_, i) => i);
    // Fisher-Yates 洗牌
    for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleOrder[i], this.shuffleOrder[j]] = 
        [this.shuffleOrder[j], this.shuffleOrder[i]];
    }
  }
}
