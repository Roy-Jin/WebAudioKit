/**
 * BGM - 背景音乐类
 * 支持多曲预加载、按 id 播放、淡入淡出、页面隐藏暂停/恢复
 */

import type { BGMOptions, EventListener, EventType } from "../types";

const DEFAULT_FADE_MS = 1000;

function resolveFadeMs(fade?: boolean, explicit?: number): number {
  if (explicit !== undefined && explicit > 0) return explicit;
  if (fade) return DEFAULT_FADE_MS;
  return 0;
}

export class BGM {
  private Config: BGMOptions = {
    loop: true,
    volume: 1,
    rate: 1,
    fade: false,
    preload: false,
    stopOnHidden: false,
    enable: true,
  };
  private configProxy: BGMOptions;
  private Cache: Map<string, string> = new Map();
  private audio: HTMLAudioElement | null = null;
  private currentId: string | null = null;
  private fadeTimer: number | null = null;
  private blocked: boolean = false;
  private pausedByHidden: boolean = false;
  private visibilityHandler: (() => void) | null = null;
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();

  constructor(options: BGMOptions = {}) {
    if (options.volume !== undefined) {
      this.Config.volume = Math.max(0, Math.min(1, options.volume));
    }
    if (options.rate !== undefined) this.Config.rate = options.rate;
    if (options.loop !== undefined) this.Config.loop = options.loop;
    if (options.stopOnHidden !== undefined) {
      this.Config.stopOnHidden = options.stopOnHidden;
    }
    if (options.preload !== undefined) this.Config.preload = options.preload;
    if (options.enable !== undefined) this.Config.enable = options.enable;
    this.Config.fadeIn = resolveFadeMs(options.fade, options.fadeIn);
    this.Config.fadeOut = resolveFadeMs(options.fade, options.fadeOut);

    this.configProxy = this.createConfigProxy();
    this.setupVisibilityHandler();
  }

  private createConfigProxy(): BGMOptions {
    return new Proxy(this.Config, {
      set: (target, prop: string, value) => {
        const oldValue = target[prop as keyof BGMOptions];
        (target as any)[prop] = value;

        // 处理配置变更
        this.handleConfigChange(prop as keyof BGMOptions, value, oldValue);
        return true;
      },
    });
  }

  private handleConfigChange(
    key: keyof BGMOptions,
    newValue: any,
    oldValue: any,
  ): void {
    if (newValue === oldValue) return;

    switch (key) {
      case "enable":
        if (newValue === false) {
          this.clearFade();
          this.stop();
        }
        break;
      case "volume":
        if (this.audio) {
          this.audio.volume = Math.max(0, Math.min(1, newValue));
          this.emit("volumechange", newValue);
        }
        break;
      case "rate":
        if (this.audio) {
          this.audio.playbackRate = newValue;
        }
        break;
      case "loop":
        if (this.audio) {
          this.audio.loop = newValue;
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
          if (this.audio && !this.audio.paused) {
            this.clearFade();
            this.audio.pause();
            this.pausedByHidden = true;
          }
        } else {
          this.blocked = false;
          if (this.pausedByHidden && this.audio) {
            this.pausedByHidden = false;
            this.resumePlay();
          }
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  async load(id: string, src: string): Promise<void> {
    // load 操作不受 enable 限制，允许预加载资源
    if (!this.Config.preload) {
      // 非预加载模式：仅缓存 src
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

  async play(id: string): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    if (this.blocked) return;

    const src = this.Cache.get(id);
    if (!src) throw new Error(`BGM: "${id}" not found. Call load() first.`);

    if (this.currentId === id && this.audio && !this.audio.paused) return;

    if (this.audio && !this.audio.paused) {
      await this.fadeOut();
      this.stopCurrent();
    } else if (this.audio) {
      this.stopCurrent();
    }

    this.audio = new Audio(src);
    this.audio.volume = this.Config.volume!;
    this.audio.playbackRate = this.Config.rate!;
    this.audio.loop = this.Config.loop!;
    this.currentId = id;
    this.setupAudioEvents();
    this.pausedByHidden = false;

    await this.fadeIn();
  }

  pause(): void {
    if (!this.audio) return;
    this.clearFade();
    this.audio.pause();
  }

  async resume(): Promise<void> {
    if (!this.Config.enable) {
      return;
    }
    if (this.blocked || !this.audio || !this.audio.paused) return;
    await this.resumePlay();
  }

  stop(): void {
    this.clearFade();
    this.stopCurrent();
    this.pausedByHidden = false;
  }

  get volume(): number {
    return this.audio?.volume ?? this.Config.volume!;
  }
  set volume(value: number) {
    const vol = Math.max(0, Math.min(1, value));
    this.Config.volume = vol;
    if (this.audio) {
      this.audio.volume = vol;
      this.emit("volumechange", vol);
    }
  }

  get rate(): number {
    return this.audio?.playbackRate ?? this.Config.rate!;
  }
  set rate(value: number) {
    this.Config.rate = value;
    if (this.audio) this.audio.playbackRate = value;
  }

  get loop(): boolean {
    return this.audio?.loop ?? this.Config.loop!;
  }
  set loop(value: boolean) {
    this.Config.loop = value;
    if (this.audio) this.audio.loop = value;
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0;
  }
  set currentTime(value: number) {
    if (this.audio) this.audio.currentTime = value;
  }

  get duration(): number {
    return this.audio?.duration ?? 0;
  }
  get paused(): boolean {
    return this.audio?.paused ?? true;
  }
  get playing(): string | null {
    return this.currentId;
  }

  get config(): BGMOptions {
    return this.configProxy;
  }
  set config(newConfig: Partial<BGMOptions>) {
    Object.keys(newConfig).forEach((key) => {
      const k = key as keyof BGMOptions;
      if (newConfig[k] !== undefined) {
        (this.configProxy as any)[k] = newConfig[k];
      }
    });
  }

  on(event: EventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: EventType, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  destroy(): void {
    this.clearFade();
    this.stopCurrent();
    this.Cache.clear();
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    this.eventListeners.clear();
  }

  private stopCurrent(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = "";
    this.audio.load();
    this.audio = null;
    this.currentId = null;
    this.emit("stop");
  }

  private setupAudioEvents(): void {
    if (!this.audio) return;
    this.audio.addEventListener("play", () => this.emit("play"));
    this.audio.addEventListener("pause", () => this.emit("pause"));
    this.audio.addEventListener("ended", () => this.emit("ended"));
    this.audio.addEventListener("timeupdate", () => {
      if (!this.audio) return;
      this.emit("timeupdate", {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration,
      });
    });
    this.audio.addEventListener("error", (e) => this.emit("error", e));
  }

  private async resumePlay(): Promise<void> {
    if (!this.audio || this.blocked) return;
    try {
      if (this.Config.fadeIn! > 0) await this.fadeIn();
      else await this.audio.play();
    } catch (error) {
      this.emit("error", error);
    }
  }

  private async fadeIn(): Promise<void> {
    if (!this.audio) return;
    this.clearFade();
    if (this.Config.fadeIn! <= 0) {
      try {
        await this.audio.play();
      } catch (e) {
        this.emit("error", e);
        throw e;
      }
      return;
    }
    const target = this.Config.volume!;
    this.audio.volume = 0;
    try {
      await this.audio.play();
    } catch (e) {
      this.emit("error", e);
      throw e;
    }
    return new Promise((resolve) => {
      const step = target / (this.Config.fadeIn! / 50);
      let vol = 0;
      this.fadeTimer = window.setInterval(() => {
        if (!this.audio) {
          this.clearFade();
          resolve();
          return;
        }
        vol += step;
        if (vol >= target) {
          this.audio.volume = target;
          this.clearFade();
          resolve();
        } else this.audio.volume = vol;
      }, 50);
    });
  }

  private async fadeOut(): Promise<void> {
    if (!this.audio || this.Config.fadeOut! <= 0) return;
    this.clearFade();
    const start = this.audio.volume;
    return new Promise((resolve) => {
      const step = start / (this.Config.fadeOut! / 50);
      let vol = start;
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
        } else this.audio.volume = vol;
      }, 50);
    });
  }

  private clearFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private emit(event: EventType, data?: any): void {
    this.eventListeners.get(event)?.forEach((listener) => listener(data));
  }
}
