/**
 * SFX - 音效类
 * 可重叠播放的音频效果
 */

import type { SFXOptions, EventType, EventListener } from '../types';

export class SFX {
  private src: string | null = null;
  private defaultVolume: number = 1;
  private defaultRate: number = 1;
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();
  private activeInstances: Set<HTMLAudioElement> = new Set();
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(options: SFXOptions = {}) {
    if (options.volume !== undefined) {
      this.defaultVolume = Math.max(0, Math.min(1, options.volume));
    }
    if (options.rate !== undefined) {
      this.defaultRate = options.rate;
    }
  }

  /**
   * 预加载音效资源
   */
  async load(src: string): Promise<void> {
    if (this.src === src && this.isLoaded) {
      return;
    }

    this.src = src;
    this.isLoaded = false;

    // 如果已有加载中的Promise，返回它
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const audio = new Audio(src);
      
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
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplaythrough', onLoad, { once: true });
      audio.addEventListener('error', onError, { once: true });
      audio.load();
    });

    return this.loadPromise;
  }

  /**
   * 播放音效（每次创建新实例，支持重叠播放）
   */
  async play(): Promise<void> {
    if (!this.src) {
      throw new Error('SFX: No audio source loaded. Call load() first.');
    }

    const audio = new Audio(this.src);
    audio.volume = this.defaultVolume;
    audio.playbackRate = this.defaultRate;

    this.activeInstances.add(audio);

    audio.addEventListener('play', () => this.emit('play'));
    audio.addEventListener('ended', () => {
      this.emit('ended');
      this.activeInstances.delete(audio);
    });
    audio.addEventListener('error', (e) => {
      this.emit('error', e);
      this.activeInstances.delete(audio);
    });

    try {
      await audio.play();
    } catch (error) {
      this.emit('error', error);
      this.activeInstances.delete(audio);
      throw error;
    }
  }

  /**
   * 停止所有正在播放的音效实例
   */
  stopAll(): void {
    this.activeInstances.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeInstances.clear();
    this.emit('stop');
  }

  get volume(): number {
    return this.defaultVolume;
  }

  set volume(value: number) {
    this.defaultVolume = Math.max(0, Math.min(1, value));
    this.activeInstances.forEach(audio => {
      audio.volume = this.defaultVolume;
    });
    this.emit('volumechange', this.defaultVolume);
  }

  get rate(): number {
    return this.defaultRate;
  }

  set rate(value: number) {
    this.defaultRate = value;
    this.activeInstances.forEach(audio => {
      audio.playbackRate = this.defaultRate;
    });
  }

  get activeCount(): number {
    return this.activeInstances.size;
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

  destroy(): void {
    this.stopAll();
    this.eventListeners.clear();
    this.src = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }
}
