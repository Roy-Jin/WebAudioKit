/**
 * BGM - 背景音乐类
 * 支持淡入淡出效果，不支持重叠播放
 */

import type { BGMOptions, EventType, EventListener } from '../types';

export class BGM {
  private audio: HTMLAudioElement | null = null;
  private src: string | null = null;
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private fadeInMs: number = 0;
  private fadeOutMs: number = 0;
  private fadeTimer: number | null = null;
  private defaultVolume: number = 1;
  private defaultRate: number = 1;
  private defaultLoop: boolean = true;
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(options: BGMOptions = {}) {
    if (options.volume !== undefined) {
      this.defaultVolume = Math.max(0, Math.min(1, options.volume));
    }
    if (options.rate !== undefined) {
      this.defaultRate = options.rate;
    }
    if (options.loop !== undefined) {
      this.defaultLoop = options.loop;
    }
    if (options.fadeIn !== undefined) {
      this.fadeInMs = options.fadeIn;
    }
    if (options.fadeOut !== undefined) {
      this.fadeOutMs = options.fadeOut;
    }
  }

  /**
   * 预加载BGM资源
   */
  async load(src: string): Promise<void> {
    if (this.src === src && this.isLoaded) {
      return;
    }

    // 如果正在播放，先停止
    if (this.audio && !this.audio.paused) {
      this.stop();
    }

    this.src = src;
    this.isLoaded = false;

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      this.audio = new Audio(src);
      this.audio.volume = this.defaultVolume;
      this.audio.playbackRate = this.defaultRate;
      this.audio.loop = this.defaultLoop;
      this.setupEvents();

      const onLoad = () => {
        this.isLoaded = true;
        this.loadPromise = null;
        this.emit('loaded');
        cleanup();
        resolve();
      };

      const onError = (e: ErrorEvent) => {
        this.loadPromise = null;
        this.emit('error', e);
        cleanup();
        reject(e);
      };

      const cleanup = () => {
        this.audio!.removeEventListener('canplaythrough', onLoad);
        this.audio!.removeEventListener('error', onError);
      };

      this.audio.addEventListener('canplaythrough', onLoad, { once: true });
      this.audio.addEventListener('error', onError, { once: true });
      this.audio.load();
    });

    return this.loadPromise;
  }

  private setupEvents(): void {
    if (!this.audio) return;
    
    this.audio.addEventListener('play', () => this.emit('play'));
    this.audio.addEventListener('pause', () => this.emit('pause'));
    this.audio.addEventListener('ended', () => this.emit('ended'));
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', {
      currentTime: this.audio!.currentTime,
      duration: this.audio!.duration
    }));
    this.audio.addEventListener('error', (e) => this.emit('error', e));
  }

  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('BGM: No audio source loaded. Call load() first.');
    }

    if (this.fadeInMs > 0) {
      await this.fadeIn();
    } else {
      try {
        await this.audio.play();
      } catch (error) {
        this.emit('error', error);
        throw error;
      }
    }
  }

  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  stop(): void {
    if (!this.audio) return;

    if (this.fadeOutMs > 0) {
      this.fadeOut().then(() => {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
          this.emit('stop');
        }
      });
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.emit('stop');
    }
  }

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

  get loaded(): boolean {
    return this.isLoaded;
  }

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

  private async fadeIn(): Promise<void> {
    if (!this.audio) return;

    this.clearFade();
    const targetVolume = this.audio.volume;
    this.audio.volume = 0;
    
    try {
      await this.audio.play();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
    
    return new Promise((resolve) => {
      const step = targetVolume / (this.fadeInMs / 50);
      let vol = 0;
      
      this.fadeTimer = window.setInterval(() => {
        if (!this.audio) {
          this.clearFade();
          resolve();
          return;
        }

        vol += step;
        if (vol >= targetVolume) {
          this.audio.volume = targetVolume;
          this.clearFade();
          resolve();
        } else {
          this.audio.volume = vol;
        }
      }, 50);
    });
  }

  private async fadeOut(): Promise<void> {
    if (!this.audio) return;

    this.clearFade();
    const startVolume = this.audio.volume;
    
    return new Promise((resolve) => {
      const step = startVolume / (this.fadeOutMs / 50);
      let vol = startVolume;
      
      this.fadeTimer = window.setInterval(() => {
        if (!this.audio) {
          this.clearFade();
          resolve();
          return;
        }

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

  private clearFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  /**
   * 切换到新的BGM源
   */
  async switch(src: string): Promise<void> {
    if (this.fadeOutMs > 0 && this.audio && !this.audio.paused) {
      await this.fadeOut();
    }
    this.stop();
    await this.load(src);
    await this.play();
  }

  destroy(): void {
    this.clearFade();
    this.stop();
    if (this.audio) {
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.eventListeners.clear();
    this.src = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }
}
