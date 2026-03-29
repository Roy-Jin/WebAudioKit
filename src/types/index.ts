/**
 * WebAudioKit - Type Definitions
 */

/**
 * 音效配置
 */
export interface SFXOptions {
  volume?: number;
  rate?: number;
  stopOnHidden?: boolean;
}

/**
 * 音效实例（单次播放的音频对象）
 */
export interface SFXInstance {
  audio: HTMLAudioElement;
  id: string;
  stop(): void;
}

/**
 * 淡入淡出配置
 * fade: true 时使用默认时长 1000ms；也可直接用 fadeIn/fadeOut 指定毫秒数
 */
export interface FadeOptions {
  fade?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

/**
 * BGM配置
 */
export interface BGMOptions extends FadeOptions {
  volume?: number;
  rate?: number;
  loop?: boolean;
  stopOnHidden?: boolean;
}

/**
 * 音乐元数据
 */
export interface Metadata {
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  lrc?: string;
  duration?: number;
}

/**
 * 音乐播放器配置
 */
export interface MusicPlayerOptions extends FadeOptions {
  volume?: number;
  rate?: number;
  loop?: boolean;
  mode?: PlayMode;
  stopOnHidden?: boolean;
}

/**
 * 播放模式
 */
export enum PlayMode {
  LOOP = 'loop',
  SHUFFLE = 'shuffle',
  SINGLE = 'single',
  SEQUENTIAL = 'sequential'
}

/**
 * 播放状态
 */
export enum PlayState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  LOADING = 'loading',
  ERROR = 'error'
}

/**
 * 歌词行
 */
export interface Lyric {
  time: number;
  text: string;
}

/**
 * Meting API 数据
 */
export interface MetingData {
  id: string | number;
  name: string;
  title?: string;
  artist: string;
  author?: string;
  album: string;
  pic: string;
  cover?: string;
  url: string;
  lrc: string;
  lyric?: string;
}

/**
 * 事件类型
 */
export type EventType = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'ended'
  | 'timeupdate'
  | 'volumechange'
  | 'error'
  | 'loaded'
  | 'lyricchange'
  | 'lyricsloaded'
  | 'musicchange'
  | 'playlistchange';

/**
 * 事件监听器
 */
export type EventListener = (data?: any) => void;
