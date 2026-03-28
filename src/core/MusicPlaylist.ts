/**
 * MusicPlaylist - 音乐播放列表
 * 管理音乐列表和播放模式
 */

import { Music } from './Music';
import { PlayMode } from '../types';

export class MusicPlaylist {
  private playlist: Music[] = [];
  private currentIndex: number = -1;
  private _playMode: PlayMode = PlayMode.SEQUENTIAL;
  private shuffleIndices: number[] = [];

  constructor(musics: Music[] = []) {
    this.playlist = musics;
    if (musics.length > 0) {
      this.currentIndex = 0;
    }
  }

  /**
   * 添加音乐
   */
  add(music: Music): void {
    this.playlist.push(music);
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
    this.updateShuffleIndices();
  }

  /**
   * 移除音乐
   */
  remove(index: number): void {
    if (index >= 0 && index < this.playlist.length) {
      this.playlist.splice(index, 1);
      if (this.currentIndex >= this.playlist.length) {
        this.currentIndex = this.playlist.length - 1;
      }
      this.updateShuffleIndices();
    }
  }

  /**
   * 清空播放列表
   */
  clear(): void {
    this.playlist = [];
    this.currentIndex = -1;
    this.shuffleIndices = [];
  }

  /**
   * 获取当前音乐
   */
  getCurrentMusic(): Music | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
      return this.playlist[this.currentIndex];
    }
    return null;
  }

  /**
   * 获取指定索引的音乐
   */
  getMusic(index: number): Music | null {
    if (index >= 0 && index < this.playlist.length) {
      return this.playlist[index];
    }
    return null;
  }

  /**
   * 获取所有音乐
   */
  getAllMusic(): Music[] {
    return [...this.playlist];
  }

  /**
   * 获取播放列表长度
   */
  get length(): number {
    return this.playlist.length;
  }

  /**
   * 获取当前索引
   */
  get index(): number {
    return this.currentIndex;
  }

  /**
   * 设置当前索引
   */
  set index(value: number) {
    if (value >= 0 && value < this.playlist.length) {
      this.currentIndex = value;
    }
  }

  /**
   * 获取/设置播放模式
   */
  get playMode(): PlayMode {
    return this._playMode;
  }

  set playMode(mode: PlayMode) {
    this._playMode = mode;
    if (mode === PlayMode.SHUFFLE) {
      this.updateShuffleIndices();
    }
  }

  /**
   * 下一首
   */
  next(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this._playMode) {
      case PlayMode.SINGLE:
        // 单曲循环，返回当前歌曲
        return this.getCurrentMusic();

      case PlayMode.SHUFFLE:
        // 随机播放
        const currentShuffleIndex = this.shuffleIndices.indexOf(this.currentIndex);
        const nextShuffleIndex = (currentShuffleIndex + 1) % this.shuffleIndices.length;
        this.currentIndex = this.shuffleIndices[nextShuffleIndex];
        break;

      case PlayMode.LOOP:
        // 列表循环
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        break;

      case PlayMode.SEQUENTIAL:
        // 顺序播放
        if (this.currentIndex < this.playlist.length - 1) {
          this.currentIndex++;
        } else {
          return null; // 播放完毕
        }
        break;
    }

    return this.getCurrentMusic();
  }

  /**
   * 上一首
   */
  previous(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this._playMode) {
      case PlayMode.SINGLE:
        // 单曲循环，返回当前歌曲
        return this.getCurrentMusic();

      case PlayMode.SHUFFLE:
        // 随机播放
        const currentShuffleIndex = this.shuffleIndices.indexOf(this.currentIndex);
        const prevShuffleIndex = currentShuffleIndex === 0 
          ? this.shuffleIndices.length - 1 
          : currentShuffleIndex - 1;
        this.currentIndex = this.shuffleIndices[prevShuffleIndex];
        break;

      case PlayMode.LOOP:
        // 列表循环
        this.currentIndex = this.currentIndex === 0 
          ? this.playlist.length - 1 
          : this.currentIndex - 1;
        break;

      case PlayMode.SEQUENTIAL:
        // 顺序播放
        if (this.currentIndex > 0) {
          this.currentIndex--;
        } else {
          return null;
        }
        break;
    }

    return this.getCurrentMusic();
  }

  /**
   * 更新随机播放索引
   */
  private updateShuffleIndices(): void {
    this.shuffleIndices = Array.from({ length: this.playlist.length }, (_, i) => i);
    // Fisher-Yates 洗牌算法
    for (let i = this.shuffleIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleIndices[i], this.shuffleIndices[j]] = 
        [this.shuffleIndices[j], this.shuffleIndices[i]];
    }
  }
}
