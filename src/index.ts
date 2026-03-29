/**
 * WebAudioKit - Main Entry Point
 */

export { SFX } from './core/Sfx';
export { BGM } from './core/Bgm';
export { Music } from './core/Music';
export { MusicPlayer } from './core/MusicPlayer';

export type {
  SFXOptions,
  BGMOptions,
  MusicPlayerOptions,
  Metadata,
  Lyric,
  MetingData,
  EventType,
  EventListener
} from './types';

export { PlayMode, PlayState } from './types';