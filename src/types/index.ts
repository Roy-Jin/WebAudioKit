/**
 * WebAudioKit - Type Definitions
 * 类型定义
 */

/**
 * 全局配置选项
 */
export interface AudioManagerConfig {
  /** 全局音量 (0-1) */
  volume?: number;
  /** 页面隐藏时是否暂停播放 */
  pauseOnHidden?: boolean;
  /** 是否静音 */
  muted?: boolean;
}

/**
 * 音效配置选项
 */
export interface SoundEffectOptions {
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速率 */
  playbackRate?: number;
  /** 是否循环 */
  loop?: boolean;
}

/**
 * 音频（BGM）配置选项
 */
export interface AudioOptions {
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速率 */
  playbackRate?: number;
  /** 是否循环 */
  loop?: boolean;
  /** 淡入时间（毫秒） */
  fadeInDuration?: number;
  /** 淡出时间（毫秒） */
  fadeOutDuration?: number;
}

/**
 * 音乐元数据
 */
export interface MusicMetadata {
  /** 音乐名称 */
  title?: string;
  /** 艺术家 */
  artist?: string;
  /** 专辑 */
  album?: string;
  /** 封面图片URL */
  cover?: string;
  /** 歌词文本（LRC格式） */
  lrc?: string;
  /** 时长（秒） */
  duration?: number;
}

/**
 * 音乐配置选项
 */
export interface MusicOptions extends AudioOptions {
  /** 音乐元数据 */
  metadata?: MusicMetadata;
}

/**
 * 播放模式
 */
export enum PlayMode {
  /** 列表循环 */
  LOOP = 'loop',
  /** 随机播放 */
  SHUFFLE = 'shuffle',
  /** 单曲循环 */
  SINGLE = 'single',
  /** 顺序播放 */
  SEQUENTIAL = 'sequential'
}

/**
 * 播放状态
 */
export enum PlayState {
  /** 播放中 */
  PLAYING = 'playing',
  /** 暂停 */
  PAUSED = 'paused',
  /** 停止 */
  STOPPED = 'stopped',
  /** 加载中 */
  LOADING = 'loading',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 歌词行
 */
export interface LyricLine {
  /** 时间（秒） */
  time: number;
  /** 歌词文本 */
  text: string;
}

/**
 * Meting API 响应数据
 */
export interface MetingData {
  /** 音乐ID */
  id: string | number;
  /** 音乐名称 */
  name: string;
  title?: string;
  /** 艺术家 */
  artist: string;
  author?: string;
  /** 专辑 */
  album: string;
  /** 封面图片URL */
  pic: string;
  cover?: string;
  /** 音频URL */
  url: string;
  /** 歌词URL */
  lrc: string;
  lyric?: string;
}

/**
 * 事件类型
 */
export type AudioEventType = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'ended'
  | 'timeupdate'
  | 'volumechange'
  | 'error'
  | 'loaded'
  | 'lyricchange';

/**
 * 事件监听器
 */
export type AudioEventListener = (data?: any) => void;
