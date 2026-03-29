/**
 * SFX - 音效类
 * 可重叠播放的音频效果
 */

import type { SFXOptions, SFXInstance } from '../types';

export class SFX {
  private Config: SFXOptions = {};
  private ActiveInstances: Set<SFXInstance> = new Set();
  private Cache: Map<string, string> = new Map(); // id -> src
  private visibilityHandler: (() => void) | null = null;
  private blocked: boolean = false;

  constructor(options: SFXOptions = {}) {
    if (options.volume !== undefined) {
      this.Config.volume = Math.max(0, Math.min(1, options.volume));
    }
    if (options.rate !== undefined) {
      this.Config.rate = options.rate;
    }
    if (options.stopOnHidden !== undefined) {
      this.Config.stopOnHidden = options.stopOnHidden;
    }

    if (this.Config.stopOnHidden) {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.blocked = true;
          this.stopAll();
        } else {
          this.blocked = false;
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  /**
   * 预加载音效资源
   */
  async load(id: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      const onLoad = () => {
        this.Cache.set(id, src);
        cleanup();
        resolve();
      };
      const onError = (e: ErrorEvent) => {
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
  }

  /**
   * 播放音效（每次创建新实例，支持重叠播放）
   */
  async play(id: string, options: SFXOptions = {}): Promise<void> {
    if (this.blocked) return;

    const src = this.Cache.get(id);
    if (!src) {
      throw new Error(`SFX: "${id}" not loaded. Call load() first.`);
    }

    const mergedOptions: SFXOptions = { ...this.Config, ...options };
    const audio = new Audio(src);

    if (mergedOptions.volume !== undefined) {
      audio.volume = Math.max(0, Math.min(1, mergedOptions.volume));
    }
    if (mergedOptions.rate !== undefined) {
      audio.playbackRate = mergedOptions.rate;
    }

    const instance: SFXInstance = {
      audio,
      id,
      stop() {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    this.ActiveInstances.add(instance);

    audio.addEventListener('ended', () => {
      this.ActiveInstances.delete(instance);
    }, { once: true });

    audio.addEventListener('error', () => {
      this.ActiveInstances.delete(instance);
    }, { once: true });

    try {
      await audio.play();
    } catch (error) {
      this.ActiveInstances.delete(instance);
      throw error;
    }
  }

  /**
   * 停止所有正在播放的音效实例
   */
  stopAll(): void {
    this.ActiveInstances.forEach(instance => instance.stop());
    this.ActiveInstances.clear();
  }

  /**
   * 停止指定 id 的所有音效实例
   */
  stop(id: string): void {
    this.ActiveInstances.forEach(instance => {
      if (instance.id === id) {
        instance.stop();
        this.ActiveInstances.delete(instance);
      }
    });
  }

  /**
   * 获取当前活跃实例数量
   */
  get activeCount(): number {
    return this.ActiveInstances.size;
  }

  destroy(): void {
    this.stopAll();
    this.ActiveInstances.clear();
    this.Cache.clear();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
