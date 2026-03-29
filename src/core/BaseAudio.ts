/**
 * BaseAudio - 音频基类
 * 所有音频类型的基础类
 */

import type { AudioEventType, AudioEventListener } from '../types';

export abstract class BaseAudio {
  protected audio: HTMLAudioElement;
  protected _volume: number = 1;
  protected eventListeners: Map<AudioEventType, Set<AudioEventListener>> = new Map();

  constructor(src: string) {
    this.audio = new Audio(src);
    this.setupEvents();
  }

  /**
   * 设置基础事件监听
   */
  protected setupEvents(): void {
    this.audio.addEventListener('play', () => this.emit('play'));
    this.audio.addEventListener('pause', () => this.emit('pause'));
    this.audio.addEventListener('ended', () => this.emit('ended'));
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration
    }));
    this.audio.addEventListener('error', (e) => this.emit('error', e));
    this.audio.addEventListener('loadeddata', () => this.emit('loaded'));
  }

  /**
   * 播放
   */
  async play(): Promise<void> {
    try {
      await this.audio.play();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 暂停
   */
  pause(): void {
    this.audio.pause();
  }

  /**
   * 停止
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.emit('stop');
  }

  /**
   * 获取/设置音量
   */
  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    this.audio.volume = this._volume;
    this.emit('volumechange', this._volume);
  }

  /**
   * 获取/设置当前播放时间
   */
  get currentTime(): number {
    return this.audio.currentTime;
  }

  set currentTime(value: number) {
    this.audio.currentTime = value;
  }

  /**
   * 获取音频时长
   */
  get duration(): number {
    return this.audio.duration || 0;
  }

  /**
   * 获取播放状态
   */
  get paused(): boolean {
    return this.audio.paused;
  }

  /**
   * 获取/设置循环
   */
  get loop(): boolean {
    return this.audio.loop;
  }

  set loop(value: boolean) {
    this.audio.loop = value;
  }

  /**
   * 获取/设置播放速率
   */
  get rate(): number {
    return this.audio.playbackRate;
  }

  set rate(value: number) {
    this.audio.playbackRate = value;
  }

  // 保留兼容性
  get playbackRate(): number {
    return this.rate;
  }

  set playbackRate(value: number) {
    this.rate = value;
  }

  /**
   * 添加事件监听器
   */
  on(event: AudioEventType, listener: AudioEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: AudioEventType, listener: AudioEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  protected emit(event: AudioEventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stop();
    this.audio.src = '';
    this.audio.load();
    this.eventListeners.clear();
  }
}
