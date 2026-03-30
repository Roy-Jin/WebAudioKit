/**
 * MusicPlayer - 音乐播放器类
 * 管理播放列表，支持多种播放模式、页面隐藏暂停/恢复
 */

import type { MusicPlayerOptions, MetingData, EventType, EventListener, Lyric, Metadata } from '../types';
import { PlayState, PlayMode } from '../types';
import { Music } from './Music';

const DEFAULT_FADE_MS = 1000;

function resolveFadeMs(fade?: boolean, explicit?: number): number {
  if (explicit !== undefined && explicit > 0) return explicit;
  if (fade) return DEFAULT_FADE_MS;
  return 0;
}

export class MusicPlayer {
  private Config: MusicPlayerOptions = {
    volume: 1,
    rate: 1,
    loop: false,
    fade: false,
    stopOnHidden: false,
    preload: true,
    mode: PlayMode.SEQUENTIAL,
    enable: true
  };
  private configProxy: MusicPlayerOptions;

  private audio: HTMLAudioElement | null = null;
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private _state: PlayState = PlayState.STOPPED;
  private lyricIndex: number = -1;

  private playlist: Music[] = [];
  private index: number = -1;
  private shuffleOrder: number[] = [];

  private blocked: boolean = false;
  private pausedByHidden: boolean = false;
  private visibilityHandler: (() => void) | null = null;
  private fadeTimer: number | null = null;
  private preloadAudio: HTMLAudioElement | null = null;
  private preloadSrc: string | null = null;

  constructor(options: MusicPlayerOptions = {}) {
    if (options.volume !== undefined) this.Config.volume = Math.max(0, Math.min(1, options.volume));
    if (options.rate !== undefined) this.Config.rate = options.rate;
    if (options.loop !== undefined) this.Config.loop = options.loop;
    if (options.mode !== undefined) this.Config.mode = options.mode;
    if (options.enable !== undefined) this.Config.enable = options.enable;
    this.Config.fadeIn = resolveFadeMs(options.fade, options.fadeIn);
    this.Config.fadeOut = resolveFadeMs(options.fade, options.fadeOut);
    if (options.preload !== undefined) this.Config.preload = options.preload;
    if (options.stopOnHidden !== undefined) this.Config.stopOnHidden = options.stopOnHidden;

    this.configProxy = this.createConfigProxy();
    this.setupVisibilityHandler();
  }

  private createConfigProxy(): MusicPlayerOptions {
    return new Proxy(this.Config, {
      set: (target, prop: string, value) => {
        const oldValue = target[prop as keyof MusicPlayerOptions];
        (target as any)[prop] = value;

        // 处理配置变更
        this.handleConfigChange(prop as keyof MusicPlayerOptions, value, oldValue);
        return true;
      }
    });
  }

  private handleConfigChange(key: keyof MusicPlayerOptions, newValue: any, oldValue: any): void {
    if (newValue === oldValue) return;

    switch (key) {
      case 'enable':
        if (newValue === false) {
          this.clearFade();
          this.stop();
        }
        break;
      case 'volume':
        if (this.audio) {
          this.audio.volume = Math.max(0, Math.min(1, newValue));
          this.emit('volumechange', newValue);
        }
        break;
      case 'rate':
        if (this.audio) {
          this.audio.playbackRate = newValue;
        }
        break;
      case 'loop':
        if (this.audio) {
          this.audio.loop = newValue;
        }
        break;
      case 'mode':
        if (newValue === PlayMode.SHUFFLE) {
          this.rebuildShuffle();
        }
        break;
      case 'stopOnHidden':
        this.setupVisibilityHandler();
        break;
    }
  }

  private setupVisibilityHandler(): void {
    // 清理旧的监听器
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    // 如果启用 stopOnHidden，设置新的监听器
    if (this.Config.stopOnHidden) {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.blocked = true;
          if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.pausedByHidden = true;
          }
        } else {
          this.blocked = false;
          if (this.pausedByHidden && this.audio) {
            this.pausedByHidden = false;
            this.audio.play().catch(e => this.emit('error', e));
          }
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  // ==================== 播放列表管理 ====================

  add(music: Music): void {
    this.playlist.push(music);
    if (this.index === -1) this.index = 0;
    this.rebuildShuffle();
    this.emit('playlistchange');
  }

  addList(musicList: Music[]): void {
    this.playlist.push(...musicList);
    if (this.index === -1 && this.playlist.length > 0) this.index = 0;
    this.rebuildShuffle();
    this.emit('playlistchange');
  }

  async addFromMeting(data: MetingData[]): Promise<void> {
    const musicList = data.map(item => {
      const metadata: Metadata = {
        title: item.name ?? item.title,
        artist: item.artist ?? item.author,
        album: item.album ?? '',
        cover: item.pic ?? item.cover,
      };
      // 只存歌词 URL，播放时懒加载
      const lrcUrl = item.lrc ?? item.lyric ?? null;
      return new Music(item.url, metadata, lrcUrl);
    });
    this.addList(musicList);
  }

  remove(idx: number): void {
    if (idx < 0 || idx >= this.playlist.length) return;
    this.playlist.splice(idx, 1);
    if (this.index >= this.playlist.length) this.index = this.playlist.length - 1;
    this.rebuildShuffle();
    this.emit('playlistchange');
  }

  clear(): void {
    this.stop();
    this.playlist = [];
    this.index = -1;
    this.shuffleOrder = [];
    this.emit('playlistchange');
  }

  // ==================== 播放控制 ====================

  async play(idx?: number): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    if (this.blocked) return;

    if (idx !== undefined) {
      await this.loadAt(idx);
      return;
    }

    // 没有 audio 实例时，加载当前 index
    if (!this.audio) {
      if (this.playlist.length === 0 || this.index < 0) throw new Error('No music to play');
      await this.loadAt(this.index);
      return;
    }

    try {
      await this.audio.play();
    } catch (error) {
      this._state = PlayState.ERROR;
      this.emit('error', error);
      throw error;
    }
  }

  pause(): void {
    if (!this.audio) return;
    this.clearFade();
    this.pausedByHidden = false;
    this.audio.pause();
  }

  stop(): void {
    if (!this.audio) return;
    this.clearFade();
    this.pausedByHidden = false;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = '';
    this.audio.load();
    this._state = PlayState.STOPPED;
    this.emit('stop');
  }

  async playNext(): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    const nextIdx = this.resolveNext();
    if (nextIdx === null) return;
    await this.loadAt(nextIdx);
  }

  async playPrev(): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    const prevIdx = this.resolvePrev();
    if (prevIdx === null) return;
    await this.loadAt(prevIdx);
  }

  // ==================== 内部加载 ====================

  private async loadAt(idx: number): Promise<void> {
    if (idx < 0 || idx >= this.playlist.length) throw new Error('Invalid music index');

    const music = this.playlist[idx];

    // 淡出并清理旧实例
    if (this.audio && !this.audio.paused) {
      await this.execFadeOut(this.audio);
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }

    // 复用预加载的 audio（如果 src 匹配）
    if (this.preloadAudio && this.preloadSrc === music.url) {
      this.audio = this.preloadAudio;
      this.preloadAudio = null;
      this.preloadSrc = null;
    } else {
      // 丢弃不匹配的预加载
      if (this.preloadAudio) {
        this.preloadAudio.src = '';
        this.preloadAudio = null;
        this.preloadSrc = null;
      }
      this.audio = new Audio(music.url);
    }
    this.audio.volume = this.Config.volume!;
    this.audio.playbackRate = this.Config.rate!;
    this.audio.loop = this.Config.loop!;
    this.index = idx;
    this.lyricIndex = -1;
    this._state = PlayState.LOADING;
    this.setupEvents();
    this.emit('musicchange', music);

    // 歌词懒加载，不阻塞播放
    music.loadLyrics().catch(() => {});

    if (!this.blocked && this.Config.enable) {
      try {
        await this.execFadeIn(this.audio);
      } catch (error) {
        this._state = PlayState.ERROR;
        this.emit('error', error);
        throw error;
      }
    }

    // 预加载下一首
    if (this.Config.preload) this.preloadNext();
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
      if (!this.audio) return;
      this.emit('timeupdate', { currentTime: this.audio.currentTime, duration: this.audio.duration });
      this.updateLyric();
    });
    this.audio.addEventListener('error', (e) => {
      this._state = PlayState.ERROR;
      this.emit('error', e);
    });
  }

  private async handleEnded(): Promise<void> {
    if (!this.Config.enable) {
      this._state = PlayState.STOPPED;
      this.emit('stop');
      return;
    }
    const nextIdx = this.resolveNext();
    if (nextIdx !== null) {
      await this.loadAt(nextIdx);
    } else {
      this._state = PlayState.STOPPED;
      this.emit('stop');
    }
  }

  /** 预加载下一首的音频、封面图片和歌词 */
  private preloadNext(): void {
    const nextIdx = this.resolveNext();
    if (nextIdx === null || nextIdx === this.index) return;

    const next = this.playlist[nextIdx];
    if (!next) return;

    // 避免重复预加载同一首
    if (this.preloadSrc === next.url) return;

    // 清理旧的预加载
    if (this.preloadAudio) {
      this.preloadAudio.src = '';
      this.preloadAudio = null;
    }

    // 预加载音频
    this.preloadSrc = next.url;
    this.preloadAudio = new Audio();
    this.preloadAudio.preload = 'auto';
    this.preloadAudio.src = next.url;
    this.preloadAudio.volume = 0;
    this.preloadAudio.load();

    // 预加载封面
    const cover = next.meta.cover;
    if (cover) {
      const img = new Image();
      img.src = cover;
    }

    // 预加载歌词
    next.loadLyrics().catch(() => {});
  }

  // ==================== 播放顺序计算（无副作用） ====================

  /**
   * 计算下一首的 index，不修改 this.index
   */
  private resolveNext(): number | null {
    if (this.playlist.length === 0) return null;

    switch (this.Config.mode) {
      case PlayMode.SINGLE:
        return this.index;

      case PlayMode.SHUFFLE: {
        const pos = this.shuffleOrder.indexOf(this.index);
        return this.shuffleOrder[(pos + 1) % this.shuffleOrder.length];
      }

      case PlayMode.LOOP:
        return (this.index + 1) % this.playlist.length;

      case PlayMode.SEQUENTIAL:
        return this.index < this.playlist.length - 1 ? this.index + 1 : null;

      default:
        return null;
    }
  }

  /**
   * 计算上一首的 index，不修改 this.index
   */
  private resolvePrev(): number | null {
    if (this.playlist.length === 0) return null;

    switch (this.Config.mode) {
      case PlayMode.SINGLE:
        return this.index;

      case PlayMode.SHUFFLE: {
        const pos = this.shuffleOrder.indexOf(this.index);
        return this.shuffleOrder[pos === 0 ? this.shuffleOrder.length - 1 : pos - 1];
      }

      case PlayMode.LOOP:
        return this.index === 0 ? this.playlist.length - 1 : this.index - 1;

      case PlayMode.SEQUENTIAL:
        return this.index > 0 ? this.index - 1 : null;

      default:
        return null;
    }
  }

  private rebuildShuffle(): void {
    this.shuffleOrder = Array.from({ length: this.playlist.length }, (_, i) => i);
    for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
    }
  }

  private updateLyric(): void {
    const music = this.current;
    if (!music || !music.hasLyrics) return;

    const lyrics = music.getLyrics();
    const time = this.currentTime;
    let newIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].time) newIndex = i;
      else break;
    }

    if (newIndex !== this.lyricIndex) {
      this.lyricIndex = newIndex;
      this.emit('lyricchange', this.lyric);
    }
  }

  // ==================== Getters & Setters ====================

  get volume(): number { return this.audio?.volume ?? this.Config.volume!; }
  set volume(value: number) {
    const vol = Math.max(0, Math.min(1, value));
    this.Config.volume = vol;
    if (this.audio) { this.audio.volume = vol; this.emit('volumechange', vol); }
  }

  get rate(): number { return this.audio?.playbackRate ?? this.Config.rate!; }
  set rate(value: number) {
    this.Config.rate = value;
    if (this.audio) this.audio.playbackRate = value;
  }

  get loop(): boolean { return this.audio?.loop ?? this.Config.loop!; }
  set loop(value: boolean) {
    this.Config.loop = value;
    if (this.audio) this.audio.loop = value;
  }

  get currentTime(): number { return this.audio?.currentTime ?? 0; }
  set currentTime(value: number) { if (this.audio) this.audio.currentTime = value; }

  get duration(): number { return this.audio?.duration ?? 0; }
  get paused(): boolean { return this.audio?.paused ?? true; }
  get state(): PlayState { return this._state; }

  get progress(): number { return this.duration > 0 ? this.currentTime / this.duration : 0; }
  set progress(value: number) { this.currentTime = value * this.duration; }

  get current(): Music | null {
    return this.index >= 0 && this.index < this.playlist.length ? this.playlist[this.index] : null;
  }

  get(idx: number): Music | null {
    return idx >= 0 && idx < this.playlist.length ? this.playlist[idx] : null;
  }

  getAll(): Music[] { return [...this.playlist]; }

  get length(): number { return this.playlist.length; }
  get currentIndex(): number { return this.index; }
  set currentIndex(value: number) {
    if (value >= 0 && value < this.playlist.length) this.index = value;
  }

  get playMode(): PlayMode { return this.Config.mode!; }
  set playMode(value: PlayMode) {
    this.Config.mode = value;
    if (value === PlayMode.SHUFFLE) this.rebuildShuffle();
  }

  get config(): MusicPlayerOptions { 
    return this.configProxy; 
  }
  set config(newConfig: Partial<MusicPlayerOptions>) {
    Object.keys(newConfig).forEach(key => {
      const k = key as keyof MusicPlayerOptions;
      if (newConfig[k] !== undefined) {
        (this.configProxy as any)[k] = newConfig[k];
      }
    });
  }

  get lyric(): Lyric | null {
    const music = this.current;
    if (!music) return null;
    const lyrics = music.getLyrics();
    return this.lyricIndex >= 0 && this.lyricIndex < lyrics.length ? lyrics[this.lyricIndex] : null;
  }

  getLyrics(): Lyric[] { return this.current?.getLyrics() ?? []; }

  // ==================== Events ====================

  on(event: EventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, new Set());
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: EventType, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: EventType, data?: any): void {
    this.eventListeners.get(event)?.forEach(listener => listener(data));
  }

  destroy(): void {
    this.clearFade();
    this.stop();
    if (this.audio) { this.audio.src = ''; this.audio.load(); this.audio = null; }
    if (this.preloadAudio) { this.preloadAudio.src = ''; this.preloadAudio = null; this.preloadSrc = null; }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    this.eventListeners.clear();
    this.playlist = [];
    this.index = -1;
  }

  private clearFade(): void {
    if (this.fadeTimer !== null) { clearInterval(this.fadeTimer); this.fadeTimer = null; }
  }

  private async execFadeIn(audio: HTMLAudioElement): Promise<void> {
    this.clearFade();
    if (this.Config.fadeIn! <= 0) {
      await audio.play();
      return;
    }
    const target = this.Config.volume!;
    audio.volume = 0;
    await audio.play();
    return new Promise((resolve) => {
      const step = target / (this.Config.fadeIn! / 50);
      let vol = 0;
      this.fadeTimer = window.setInterval(() => {
        vol += step;
        if (vol >= target) { audio.volume = target; this.clearFade(); resolve(); }
        else audio.volume = vol;
      }, 50);
    });
  }

  private async execFadeOut(audio: HTMLAudioElement): Promise<void> {
    if (this.Config.fadeOut! <= 0) return;
    this.clearFade();
    const start = audio.volume;
    return new Promise((resolve) => {
      const step = start / (this.Config.fadeOut! / 50);
      let vol = start;
      this.fadeTimer = window.setInterval(() => {
        vol -= step;
        if (vol <= 0) { audio.volume = 0; this.clearFade(); resolve(); }
        else audio.volume = vol;
      }, 50);
    });
  }
}
