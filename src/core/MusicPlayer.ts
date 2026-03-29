/**
 * MusicPlayer - 音乐播放器类
 * 管理播放列表，支持多种播放模式
 */

import type { MusicPlayerOptions, MetingData, EventType, EventListener, Lyric, Metadata } from '../types';
import { PlayState, PlayMode } from '../types';
import { Music } from './Music';

export class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private _state: PlayState = PlayState.STOPPED;
  private lyricIndex: number = -1;
  
  private playlist: Music[] = [];
  private index: number = -1;
  private mode: PlayMode = PlayMode.SEQUENTIAL;
  private shuffleOrder: number[] = [];
  
  private defaultVolume: number = 1;
  private defaultRate: number = 1;
  private defaultLoop: boolean = false;

  constructor(options: MusicPlayerOptions = {}) {
    if (options.volume !== undefined) {
      this.defaultVolume = Math.max(0, Math.min(1, options.volume));
    }
    if (options.rate !== undefined) {
      this.defaultRate = options.rate;
    }
    if (options.loop !== undefined) {
      this.defaultLoop = options.loop;
    }
    if (options.mode !== undefined) {
      this.mode = options.mode;
    }
  }

  /**
   * 添加音乐到播放列表
   */
  add(music: Music): void {
    this.playlist.push(music);
    if (this.index === -1) {
      this.index = 0;
    }
    this.updateShuffle();
    this.emit('playlistchange');
  }

  /**
   * 批量添加音乐到播放列表
   */
  addList(musicList: Music[]): void {
    this.playlist.push(...musicList);
    if (this.index === -1 && this.playlist.length > 0) {
      this.index = 0;
    }
    this.updateShuffle();
    this.emit('playlistchange');
  }

  /**
   * 从Meting API数据添加到播放列表
   */
  async addFromMeting(data: MetingData[]): Promise<void> {
    const musicList: Music[] = [];

    for (const item of data) {
      const metadata: Metadata = {
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

      const music = new Music(item.url, metadata);
      musicList.push(music);
    }

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
      this.emit('playlistchange');
    }
  }

  /**
   * 清空播放列表
   */
  clear(): void {
    this.stop();
    this.playlist = [];
    this.index = -1;
    this.shuffleOrder = [];
    this.emit('playlistchange');
  }

  /**
   * 加载指定索引的音乐
   */
  private async loadMusic(idx: number): Promise<void> {
    if (idx < 0 || idx >= this.playlist.length) {
      throw new Error('Invalid music index');
    }

    const music = this.playlist[idx];
    const wasPlaying = this.audio && !this.audio.paused;

    // 停止当前播放
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    // 创建新的audio实例
    this.audio = new Audio(music.url);
    this.audio.volume = this.defaultVolume;
    this.audio.playbackRate = this.defaultRate;
    this.audio.loop = this.defaultLoop;
    this.setupEvents();

    this.index = idx;
    this.lyricIndex = -1;
    this._state = PlayState.LOADING;
    this.emit('musicchange', music);

    // 等待加载
    await new Promise<void>((resolve, reject) => {
      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = (e: ErrorEvent) => {
        this._state = PlayState.ERROR;
        cleanup();
        reject(e);
      };

      const cleanup = () => {
        this.audio!.removeEventListener('canplaythrough', onLoad);
        this.audio!.removeEventListener('error', onError);
      };

      this.audio!.addEventListener('canplaythrough', onLoad, { once: true });
      this.audio!.addEventListener('error', onError, { once: true });
      this.audio!.load();
    });

    // 如果之前在播放，自动播放新音乐
    if (wasPlaying) {
      await this.play();
    }
  }

  private setupEvents(): void {
    if (!this.audio) return;
    
    this.audio.addEventListener('play', () => {
      this._state = PlayState.PLAYING;
      this.emit('play');
    });
    
    this.audio.addEventListener('pause', () => {
      this._state = PlayState.PAUSED;
      this.emit('pause');
    });
    
    this.audio.addEventListener('ended', () => {
      this.emit('ended');
      this.handleEnded();
    });
    
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.audio!.currentTime,
        duration: this.audio!.duration
      });
      this.updateLyric();
    });
    
    this.audio.addEventListener('error', (e) => {
      this._state = PlayState.ERROR;
      this.emit('error', e);
    });
  }

  private async handleEnded(): Promise<void> {
    const nextMusic = this.next();
    if (nextMusic) {
      await this.loadMusic(this.index);
      await this.play();
    } else {
      this._state = PlayState.STOPPED;
      this.emit('stop');
    }
  }

  async play(idx?: number): Promise<void> {
    if (idx !== undefined) {
      await this.loadMusic(idx);
    }

    if (!this.audio) {
      if (this.playlist.length > 0 && this.index >= 0) {
        await this.loadMusic(this.index);
      } else {
        throw new Error('No music to play');
      }
    }

    try {
      await this.audio!.play();
    } catch (error) {
      this._state = PlayState.ERROR;
      this.emit('error', error);
      throw error;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this._state = PlayState.STOPPED;
      this.emit('stop');
    }
  }

  /**
   * 下一首
   */
  next(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this.mode) {
      case PlayMode.SINGLE:
        return this.current;

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

    return this.current;
  }

  /**
   * 上一首
   */
  prev(): Music | null {
    if (this.playlist.length === 0) return null;

    switch (this.mode) {
      case PlayMode.SINGLE:
        return this.current;

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

    return this.current;
  }

  /**
   * 播放下一首
   */
  async playNext(): Promise<void> {
    const nextMusic = this.next();
    if (nextMusic) {
      await this.loadMusic(this.index);
      await this.play();
    }
  }

  /**
   * 播放上一首
   */
  async playPrev(): Promise<void> {
    const prevMusic = this.prev();
    if (prevMusic) {
      await this.loadMusic(this.index);
      await this.play();
    }
  }

  private updateShuffle(): void {
    this.shuffleOrder = Array.from({ length: this.playlist.length }, (_, i) => i);
    for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleOrder[i], this.shuffleOrder[j]] = 
        [this.shuffleOrder[j], this.shuffleOrder[i]];
    }
  }

  private updateLyric(): void {
    const music = this.current;
    if (!music) return;

    const lyrics = music.getLyrics();
    if (lyrics.length === 0) return;

    const time = this.currentTime;
    let newIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== this.lyricIndex) {
      this.lyricIndex = newIndex;
      this.emit('lyricchange', this.lyric);
    }
  }

  // ==================== Getters & Setters ====================

  get volume(): number {
    return this.audio?.volume ?? this.defaultVolume;
  }

  set volume(value: number) {
    const vol = Math.max(0, Math.min(1, value));
    this.defaultVolume = vol;
    if (this.audio) {
      this.audio.volume = vol;
      this.emit('volumechange', vol);
    }
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  set currentTime(value: number) {
    if (this.audio) {
      this.audio.currentTime = value;
    }
  }

  get duration(): number {
    return this.audio?.duration ?? 0;
  }

  get paused(): boolean {
    return this.audio?.paused ?? true;
  }

  get loop(): boolean {
    return this.audio?.loop ?? this.defaultLoop;
  }

  set loop(value: boolean) {
    this.defaultLoop = value;
    if (this.audio) {
      this.audio.loop = value;
    }
  }

  get rate(): number {
    return this.audio?.playbackRate ?? this.defaultRate;
  }

  set rate(value: number) {
    this.defaultRate = value;
    if (this.audio) {
      this.audio.playbackRate = value;
    }
  }

  get state(): PlayState {
    return this._state;
  }

  get progress(): number {
    if (this.duration === 0) return 0;
    return this.currentTime / this.duration;
  }

  set progress(value: number) {
    this.currentTime = value * this.duration;
  }

  get current(): Music | null {
    if (this.index >= 0 && this.index < this.playlist.length) {
      return this.playlist[this.index];
    }
    return null;
  }

  get(idx: number): Music | null {
    if (idx >= 0 && idx < this.playlist.length) {
      return this.playlist[idx];
    }
    return null;
  }

  getAll(): Music[] {
    return [...this.playlist];
  }

  get length(): number {
    return this.playlist.length;
  }

  get currentIndex(): number {
    return this.index;
  }

  set currentIndex(value: number) {
    if (value >= 0 && value < this.playlist.length) {
      this.index = value;
    }
  }

  get playMode(): PlayMode {
    return this.mode;
  }

  set playMode(value: PlayMode) {
    this.mode = value;
    if (value === PlayMode.SHUFFLE) {
      this.updateShuffle();
    }
  }

  get lyric(): Lyric | null {
    const music = this.current;
    if (!music) return null;

    const lyrics = music.getLyrics();
    if (this.lyricIndex >= 0 && this.lyricIndex < lyrics.length) {
      return lyrics[this.lyricIndex];
    }
    return null;
  }

  getLyrics(): Lyric[] {
    const music = this.current;
    return music ? music.getLyrics() : [];
  }

  // ==================== Events ====================

  on(event: EventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: EventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit(event: EventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  destroy(): void {
    this.stop();
    if (this.audio) {
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.eventListeners.clear();
    this.playlist = [];
    this.index = -1;
  }
}
