/**
 * Base - 音频基类
 */

import type { EventType, EventListener } from '../types';

export abstract class Base {
  protected audio: HTMLAudioElement;
  protected eventListeners: Map<EventType, Set<EventListener>> = new Map();

  constructor(src: string) {
    this.audio = new Audio(src);
    this.setupEvents();
  }

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

  async play(): Promise<void> {
    try {
      await this.audio.play();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.emit('stop');
  }

  get volume(): number {
    return this.audio.volume;
  }

  set volume(value: number) {
    this.audio.volume = Math.max(0, Math.min(1, value));
    this.emit('volumechange', this.audio.volume);
  }

  get currentTime(): number {
    return this.audio.currentTime;
  }

  set currentTime(value: number) {
    this.audio.currentTime = value;
  }

  get duration(): number {
    return this.audio.duration || 0;
  }

  get paused(): boolean {
    return this.audio.paused;
  }

  get loop(): boolean {
    return this.audio.loop;
  }

  set loop(value: boolean) {
    this.audio.loop = value;
  }

  get rate(): number {
    return this.audio.playbackRate;
  }

  set rate(value: number) {
    this.audio.playbackRate = value;
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

  protected emit(event: EventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  destroy(): void {
    this.stop();
    this.audio.src = '';
    this.audio.load();
    this.eventListeners.clear();
  }
}
