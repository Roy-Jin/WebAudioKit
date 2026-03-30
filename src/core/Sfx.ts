/**
 * SFX - 音效类
 * 可重叠播放的音频效果
 */

import type { SFXInstance, SFXOptions } from "../types";

export class SFX {
  private Config: SFXOptions = {
    volume: 1,
    rate: 1,
    stopOnHidden: false,
    preload: false,
    enable: true,
  };
  private configProxy: SFXOptions;
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
    if (options.preload !== undefined) {
      this.Config.preload = options.preload;
    }
    if (options.enable !== undefined) {
      this.Config.enable = options.enable;
    }

    this.configProxy = this.createConfigProxy();
    this.setupVisibilityHandler();
  }

  private createConfigProxy(): SFXOptions {
    return new Proxy(this.Config, {
      set: (target, prop: string, value) => {
        const oldValue = target[prop as keyof SFXOptions];
        (target as any)[prop] = value;

        // 处理配置变更
        this.handleConfigChange(prop as keyof SFXOptions, value, oldValue);
        return true;
      },
    });
  }

  private handleConfigChange(
    key: keyof SFXOptions,
    newValue: any,
    oldValue: any,
  ): void {
    if (newValue === oldValue) return;

    switch (key) {
      case "enable":
        if (newValue === false) {
          this.stopAll();
        }
        break;
      case "stopOnHidden":
        this.setupVisibilityHandler();
        break;
    }
  }

  private setupVisibilityHandler(): void {
    // 清理旧的监听器
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }

    // 如果启用 stopOnHidden，设置新的监听器
    if (this.Config.stopOnHidden) {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.blocked = true;
          this.stopAll();
        } else {
          this.blocked = false;
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  /**
   * 预加载音效资源（preload: true 时建议提前调用；preload: false 时可跳过）
   */
  async load(id: string, src: string): Promise<void> {
    // load 操作不受 enable 限制，允许预加载资源
    if (!this.Config.preload) {
      // 非预加载模式：仅缓存 src，不触发网络请求
      this.Cache.set(id, src);
      return;
    }
    return new Promise((resolve, reject) => {
      let audio: HTMLAudioElement | null = new Audio(src);
      this.Cache.set(id, src);
      const onLoad = () => {
        audio = null;
        resolve();
      };
      const onError = (e: ErrorEvent) => {
        audio = null;
        reject(e);
      };
      audio.addEventListener("canplaythrough", onLoad, { once: true });
      audio.addEventListener("error", onError, { once: true });
      audio.load();
    });
  }

  /**
   * 播放音效（每次创建新实例，支持重叠播放）
   * preload: false 时可直接传 src 而无需提前调用 load()
   */
  async play(
    id: string,
    options: SFXOptions & { src?: string } = {},
  ): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    if (this.blocked) return;

    const src = options.src ?? this.Cache.get(id);
    if (!src) {
      throw new Error(
        `SFX: "${id}" not found. Call load() first or pass { src } directly.`,
      );
    }
    // 按需缓存
    if (!this.Cache.has(id)) this.Cache.set(id, src);

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
      },
    };

    this.ActiveInstances.add(instance);

    audio.addEventListener("ended", () => {
      this.ActiveInstances.delete(instance);
    }, { once: true });

    audio.addEventListener("error", () => {
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
   * 直接播放一个音频文件（无需预加载或缓存）
   * 适用于一次性播放的音效
   */
  async once(src: string, options: SFXOptions = {}): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    if (this.blocked) return;

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
      id: src, // 使用 src 作为临时 id
      stop() {
        audio.pause();
        audio.currentTime = 0;
      },
    };

    this.ActiveInstances.add(instance);

    audio.addEventListener("ended", () => {
      this.ActiveInstances.delete(instance);
    }, { once: true });

    audio.addEventListener("error", () => {
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
    this.ActiveInstances.forEach((instance) => instance.stop());
    this.ActiveInstances.clear();
  }

  /**
   * 停止指定 id 的所有音效实例
   */
  stop(id: string): void {
    this.ActiveInstances.forEach((instance) => {
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

  get config(): SFXOptions {
    return this.configProxy;
  }
  set config(newConfig: Partial<SFXOptions>) {
    Object.keys(newConfig).forEach((key) => {
      const k = key as keyof SFXOptions;
      if (newConfig[k] !== undefined) {
        (this.configProxy as any)[k] = newConfig[k];
      }
    });
  }

  destroy(): void {
    this.stopAll();
    this.ActiveInstances.clear();
    this.Cache.clear();
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
