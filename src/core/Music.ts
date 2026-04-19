/**
 * Music - 音乐数据类
 * 表示单个音乐项，包含元数据和歌词（纯数据，歌词懒加载）
 */

import type { Lyric, Metadata } from "../types";
import { Lrc } from "lrc-kit";

export class Music {
  private src: string;
  private metadata: Metadata;
  private metadataProxy: Metadata;
  private lyrics: Lyric[] = [];
  private lrcUrl: string | null;
  private lrcLoaded: boolean = false;
  private lrcLoading: boolean = false;

  constructor(
    src: string,
    metadata: Metadata = {},
    lrcUrl: string | null = null,
  ) {
    this.src = src;
    this.metadata = metadata;
    this.lrcUrl = lrcUrl;

    this.metadataProxy = this.createMetadataProxy();

    if (this.metadata.lrc) {
      if (Music.isURL(this.metadata.lrc)) {
        if (!this.lrcUrl) {
          this.lrcUrl = this.metadata.lrc;
        }
      } else {
        this.lyrics = Music.parseLyrics(this.metadata.lrc);
        this.lrcLoaded = true;
      }
    }
  }

  private static isURL(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  private createMetadataProxy(): Metadata {
    return new Proxy(this.metadata, {
      set: (target, prop: string, value) => {
        (target as any)[prop] = value;

        if (prop === "lrc") {
          if (value) {
            if (Music.isURL(value)) {
              this.lrcUrl = value;
              this.lrcLoaded = false;
              this.lyrics = [];
            } else {
              this.lyrics = Music.parseLyrics(value);
              this.lrcLoaded = true;
            }
          } else {
            this.lrcUrl = null;
            this.lrcLoaded = false;
            this.lyrics = [];
          }
        }
        return true;
      },
    });
  }

  get url(): string {
    return this.src;
  }

  get meta(): Metadata {
    return this.metadataProxy;
  }

  set meta(data: Partial<Metadata>) {
    Object.keys(data).forEach((key) => {
      const k = key as keyof Metadata;
      if (data[k] !== undefined) {
        (this.metadataProxy as any)[k] = data[k];
      }
    });
  }

  /**
   * 懒加载歌词，播放时调用，已加载则直接返回
   */
  async loadLyrics(): Promise<void> {
    if (this.lrcLoaded || this.lrcLoading) return;
    
    let urlToFetch: string | null = null;
    
    if (this.lrcUrl) {
      urlToFetch = this.lrcUrl;
    } else if (this.metadata.lrc && Music.isURL(this.metadata.lrc)) {
      urlToFetch = this.metadata.lrc;
      this.lrcUrl = urlToFetch;
    }
    
    if (!urlToFetch) return;
    
    this.lrcLoading = true;
    try {
      const text = await fetch(urlToFetch).then((r) => r.text());
      this.lyrics = Music.parseLyrics(text);
      this.lrcLoaded = true;
    } catch {
      // Silently fail if lyrics cannot be fetched
    } finally {
      this.lrcLoading = false;
    }
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
      return lrc.lyrics.map((line) => ({
        time: line.timestamp,
        text: line.content,
      }));
    } catch {
      return [];
    }
  }
}
