/**
 * Music - 音乐子类
 * 表示单个音乐项，包含元数据和歌词
 */

import type { Metadata, Lyric, EventType, EventListener } from '../types';
import { Lrc } from 'lrc-kit';

export class Music {
  private src: string;
  private metadata: Metadata;
  private lyrics: Lyric[] = [];
  private eventListeners: Map<EventType, Set<EventListener>> = new Map();

  constructor(src: string, metadata: Metadata = {}) {
    this.src = src;
    this.metadata = metadata;

    if (this.metadata.lrc) {
      this.parseLyrics(this.metadata.lrc);
    }
  }

  get url(): string {
    return this.src;
  }

  get meta(): Metadata {
    return { ...this.metadata };
  }

  set meta(data: Partial<Metadata>) {
    this.metadata = { ...this.metadata, ...data };
    
    if (data.lrc) {
      this.parseLyrics(data.lrc);
    }
  }

  getLyrics(): Lyric[] {
    return [...this.lyrics];
  }

  getLyricAt(time: number): Lyric | null {
    if (this.lyrics.length === 0) return null;

    let index = -1;
    for (let i = 0; i < this.lyrics.length; i++) {
      if (time >= this.lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    return index >= 0 ? this.lyrics[index] : null;
  }

  private parseLyrics(text: string): void {
    try {
      const lrc = Lrc.parse(text);
      this.lyrics = lrc.lyrics.map(line => ({
        time: line.timestamp,
        text: line.content
      }));
      this.emit('lyricsloaded');
    } catch (error) {
      console.warn('Failed to parse lyrics:', error);
      this.lyrics = [];
    }
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
}
