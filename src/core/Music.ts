/**
 * Music - 音乐数据类
 * 表示单个音乐项，包含元数据和歌词（纯数据，歌词懒加载）
 */

import type { Metadata, Lyric } from '../types';
import { Lrc } from 'lrc-kit';

export class Music {
  private src: string;
  private metadata: Metadata;
  private lyrics: Lyric[] = [];
  private lrcUrl: string | null;
  private lrcLoaded: boolean = false;

  constructor(src: string, metadata: Metadata = {}, lrcUrl: string | null = null) {
    this.src = src;
    this.metadata = metadata;
    this.lrcUrl = lrcUrl;

    // 如果直接传了 lrc 文本，立即解析
    if (this.metadata.lrc) {
      this.lyrics = Music.parseLyrics(this.metadata.lrc);
      this.lrcLoaded = true;
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
      this.lyrics = Music.parseLyrics(data.lrc);
      this.lrcLoaded = true;
    }
  }

  /**
   * 懒加载歌词，播放时调用，已加载则直接返回
   */
  async loadLyrics(): Promise<void> {
    if (this.lrcLoaded || !this.lrcUrl) return;
    try {
      const text = await fetch(this.lrcUrl).then(r => r.text());
      this.lyrics = Music.parseLyrics(text);
    } catch {
      console.warn(`Failed to fetch lyrics: ${this.metadata.title}`);
    }
    this.lrcLoaded = true;
  }

  getLyrics(): Lyric[] {
    return [...this.lyrics];
  }

  getLyricAt(time: number): Lyric | null {
    if (this.lyrics.length === 0) return null;
    let index = -1;
    for (let i = 0; i < this.lyrics.length; i++) {
      if (time >= this.lyrics[i].time) index = i;
      else break;
    }
    return index >= 0 ? this.lyrics[index] : null;
  }

  get hasLyrics(): boolean {
    return this.lyrics.length > 0;
  }

  get lyricsReady(): boolean {
    return this.lrcLoaded;
  }

  static parseLyrics(text: string): Lyric[] {
    try {
      const lrc = Lrc.parse(text);
      return lrc.lyrics.map(line => ({ time: line.timestamp, text: line.content }));
    } catch (error) {
      console.warn('Failed to parse lyrics:', error);
      return [];
    }
  }
}
