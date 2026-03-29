/**
 * WebAudioKit - Main Entry Point
 * 主入口文件
 */

// 导出核心类
export { AudioManager } from './AudioManager';
export { BaseAudio } from './core/BaseAudio';
export { SoundEffect } from './core/SoundEffect';
export { AudioBGM } from './core/AudioBGM';
export { Music } from './core/Music';

// 导出类型定义
export type {
  AudioManagerConfig,
  SoundEffectOptions,
  AudioOptions,
  MusicOptions,
  MusicMetadata,
  LyricLine,
  MetingData,
  AudioEventType,
  AudioEventListener
} from './types';

export { PlayMode, PlayState } from './types';

// 默认导出
import { AudioManager } from './AudioManager';
export default AudioManager;