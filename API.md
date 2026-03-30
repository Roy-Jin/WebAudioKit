# API Reference

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[English](API.md) | [中文](API_zh.md)

Complete API documentation for WebAudioKit library.

## Table of Contents

- [BGM Class](#bgm-class)
- [SFX Class](#sfx-class)
- [Music Class](#music-class)
- [MusicPlayer Class](#musicplayer-class)
- [Types & Enums](#types--enums)
- [Events](#events)

---

## BGM Class

Background music manager with fade effects and smooth transitions.

### Constructor

```typescript
new BGM(options?: BGMOptions)
```

#### BGMOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `volume` | `number` | `1` | Default volume (0-1) |
| `rate` | `number` | `1` | Playback rate |
| `loop` | `boolean` | `true` | Enable looping |
| `fade` | `boolean` | `false` | Enable default fade (1000ms) |
| `fadeIn` | `number` | `0` | Fade in duration (ms) |
| `fadeOut` | `number` | `0` | Fade out duration (ms) |
| `stopOnHidden` | `boolean` | `false` | Auto-pause when page hidden |
| `preload` | `boolean` | `false` | Preload audio files |
| `enable` | `boolean` | `true` | Enable BGM playback |

### Methods

#### `load(id: string, src: string): Promise<void>`
Load an audio file with the given ID.

```javascript
await bgm.load('menu', 'music/menu.mp3');
```

#### `play(id: string): Promise<void>`
Play the audio file with the given ID. Automatically fades out current track if playing.

```javascript
await bgm.play('menu');
```

#### `pause(): void`
Pause the current playback.

#### `resume(): Promise<void>`
Resume paused playback with fade in effect.

#### `stop(): void`
Stop playback and reset position.

#### `on(event: EventType, listener: EventListener): void`
Add event listener.

#### `off(event: EventType, listener: EventListener): void`
Remove event listener.

#### `destroy(): void`
Clean up resources and remove event listeners.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `volume` | `number` | Current volume (0-1), setter applies immediately |
| `rate` | `number` | Current playback rate, setter applies immediately |
| `loop` | `boolean` | Loop enabled, setter applies immediately |
| `currentTime` | `number` | Current playback position (seconds) |
| `duration` | `number` | Total duration (seconds) |
| `paused` | `boolean` | Whether playback is paused (read-only) |
| `playing` | `string \| null` | Currently playing track ID (read-only) |
| `config` | `BGMOptions` | Configuration object with Proxy support |

### Configuration Management

The `config` property uses Proxy to detect deep property changes:

```javascript
const bgm = new BGM({ volume: 0.7, loop: true });

// ✅ Both ways work now!
bgm.config.enable = false;  // Stops playback immediately
bgm.config = { enable: false };  // Also works

// Direct property modification is detected
bgm.config.volume = 0.5;  // Applied to audio immediately
bgm.config.stopOnHidden = true;  // Listener setup automatically

// Batch update
bgm.config = {
  volume: 0.6,
  fadeIn: 1500,
  stopOnHidden: true
};
```

**Auto-handled config changes:**
- `enable`: Stops playback when set to `false`
- `volume`: Applied to current audio immediately
- `rate`: Applied to current audio immediately
- `loop`: Applied to current audio immediately
- `stopOnHidden`: Visibility listener setup/teardown automatically

### Events

```javascript
bgm.on('play', () => console.log('Started'));
bgm.on('pause', () => console.log('Paused'));
bgm.on('stop', () => console.log('Stopped'));
bgm.on('ended', () => console.log('Ended'));
bgm.on('timeupdate', (data) => console.log(data.currentTime, data.duration));
bgm.on('volumechange', (volume) => console.log(volume));
bgm.on('error', (error) => console.error(error));
```

---

## SFX Class

Sound effects manager supporting overlapping playback.

### Constructor

```typescript
new SFX(options?: SFXOptions)
```

#### SFXOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `volume` | `number` | `1` | Default volume (0-1) |
| `rate` | `number` | `1` | Default playback rate |
| `stopOnHidden` | `boolean` | `false` | Stop all when page hidden |
| `preload` | `boolean` | `false` | Preload audio files |
| `enable` | `boolean` | `true` | Enable SFX playback |

### Methods

#### `load(id: string, src: string): Promise<void>`
Load a sound effect with the given ID.

```javascript
await sfx.load('click', 'sounds/click.wav');
```

#### `play(id: string, options?: SFXOptions & { src?: string }): Promise<void>`
Play a sound effect. Creates a new instance for each call, allowing overlapping.

```javascript
await sfx.play('click');
await sfx.play('click', { volume: 0.5 }); // Custom volume
await sfx.play('newSound', { src: 'sounds/new.wav' }); // Direct src
```

#### `once(src: string, options?: SFXOptions): Promise<void>`
Directly play an audio file without preloading or caching. Ideal for one-time sound effects.

```javascript
await sfx.once('sounds/notification.wav');
await sfx.once('sounds/alert.mp3', { volume: 0.7, rate: 1.2 }); // Custom options
```

#### `stop(id: string): void`
Stop all instances of a specific sound effect.

#### `stopAll(): void`
Stop all active sound effect instances.

#### `destroy(): void`
Clean up all resources.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `activeCount` | `number` | Number of currently playing instances (read-only) |
| `config` | `SFXOptions` | Configuration object with Proxy support |

### Configuration Management

```javascript
const sfx = new SFX({ volume: 0.8 });

// Direct property modification works
sfx.config.enable = false;  // Stops all instances immediately
sfx.config.volume = 0.6;  // Applied to future plays
sfx.config.stopOnHidden = true;  // Listener setup automatically
```

**Auto-handled config changes:**
- `enable`: Stops all instances when set to `false`
- `stopOnHidden`: Visibility listener setup/teardown automatically

---

## Music Class

Represents a single music track with metadata and lyrics.

### Constructor

```typescript
new Music(src: string, metadata?: Metadata, lrcUrl?: string | null)
```

#### Metadata

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Track title |
| `artist` | `string` | Artist name |
| `album` | `string` | Album name |
| `cover` | `string` | Cover image URL |
| `lrc` | `string` | LRC lyrics text |
| `duration` | `number` | Track duration (seconds) |

### Methods

#### `loadLyrics(): Promise<void>`
Load lyrics from the LRC URL (lazy loading).

#### `getLyrics(): Lyric[]`
Get parsed lyrics array.

#### `getLyricAt(time: number): Lyric | null`
Get lyric at specific time position.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | Audio file URL (read-only) |
| `meta` | `Metadata` | Track metadata with Proxy support |
| `hasLyrics` | `boolean` | Whether lyrics are available (read-only) |
| `lyricsReady` | `boolean` | Whether lyrics are loaded (read-only) |

### Metadata Management

The `meta` property uses Proxy to detect property changes:

```javascript
const music = new Music('song.mp3', { title: 'My Song' });

// ✅ Both ways work now!
music.meta.title = 'New Title';  // Direct modification works
music.meta = { title: 'New Title' };  // Also works

// LRC auto-parsing
music.meta.lrc = '[00:12.00]Hello world';  // Lyrics parsed automatically
```

### Static Methods

#### `Music.parseLyrics(text: string): Lyric[]`
Parse LRC format lyrics text.

```javascript
const lyrics = Music.parseLyrics('[00:12.00]First line\n[00:15.00]Second line');
```

---

## MusicPlayer Class

Full-featured music player with playlist management.

### Constructor

```typescript
new MusicPlayer(options?: MusicPlayerOptions)
```

#### MusicPlayerOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `volume` | `number` | `1` | Default volume (0-1) |
| `rate` | `number` | `1` | Playback rate |
| `loop` | `boolean` | `false` | Enable track looping |
| `mode` | `PlayMode` | `SEQUENTIAL` | Play mode |
| `fade` | `boolean` | `false` | Enable default fade (1000ms) |
| `fadeIn` | `number` | `0` | Fade in duration (ms) |
| `fadeOut` | `number` | `0` | Fade out duration (ms) |
| `stopOnHidden` | `boolean` | `false` | Auto-pause when page hidden |
| `preload` | `boolean` | `true` | Preload next track |
| `enable` | `boolean` | `true` | Enable player playback |

### Playlist Management

#### `add(music: Music): void`
Add a music track to the playlist.

#### `addList(musicList: Music[]): void`
Add multiple tracks to the playlist.

#### `addFromMeting(data: MetingData[]): Promise<void>`
Add tracks from Meting API response.

#### `remove(idx: number): void`
Remove track at index.

#### `clear(): void`
Clear the entire playlist.

### Playback Control

#### `play(idx?: number): Promise<void>`
Start playback. If index provided, plays that track.

#### `pause(): void`
Pause playback.

#### `stop(): void`
Stop playback and reset position.

#### `playNext(): Promise<void>`
Play next track according to play mode.

#### `playPrev(): Promise<void>`
Play previous track according to play mode.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `volume` | `number` | Current volume (0-1), setter applies immediately |
| `rate` | `number` | Current playback rate, setter applies immediately |
| `loop` | `boolean` | Track loop enabled, setter applies immediately |
| `currentTime` | `number` | Current position (seconds) |
| `duration` | `number` | Current track duration (read-only) |
| `paused` | `boolean` | Whether paused (read-only) |
| `state` | `PlayState` | Current player state (read-only) |
| `progress` | `number` | Playback progress (0-1) |
| `current` | `Music \| null` | Currently loaded track (read-only) |
| `length` | `number` | Playlist length (read-only) |
| `currentIndex` | `number` | Current track index |
| `playMode` | `PlayMode` | Current play mode, setter rebuilds shuffle |
| `lyric` | `Lyric \| null` | Current lyric line (read-only) |
| `config` | `MusicPlayerOptions` | Configuration object with Proxy support |

### Configuration Management

```javascript
const player = new MusicPlayer({ volume: 0.8, mode: PlayMode.SEQUENTIAL });

// Direct property modification works
player.config.enable = false;  // Stops playback immediately
player.config.volume = 0.5;  // Applied to audio immediately
player.config.mode = PlayMode.SHUFFLE;  // Rebuilds shuffle order automatically
player.config.stopOnHidden = true;  // Listener setup automatically

// Batch update
player.config = {
  volume: 0.6,
  mode: PlayMode.LOOP,
  fadeIn: 500,
  fadeOut: 500
};
```

**Auto-handled config changes:**
- `enable`: Stops playback when set to `false`
- `volume`: Applied to current audio immediately
- `rate`: Applied to current audio immediately
- `loop`: Applied to current audio immediately
- `mode`: Rebuilds shuffle order if set to `SHUFFLE`
- `stopOnHidden`: Visibility listener setup/teardown automatically

### Playlist Access

#### `get(idx: number): Music | null`
Get track at index.

#### `getAll(): Music[]`
Get copy of entire playlist.

#### `getLyrics(): Lyric[]`
Get lyrics of current track.

### Events

```javascript
player.on('play', () => console.log('Playing'));
player.on('pause', () => console.log('Paused'));
player.on('stop', () => console.log('Stopped'));
player.on('ended', () => console.log('Track ended'));
player.on('musicchange', (music) => console.log('Track changed:', music));
player.on('timeupdate', (data) => console.log(data.currentTime, data.duration));
player.on('lyricchange', (lyric) => console.log('Lyric:', lyric?.text));
player.on('lyricsloaded', () => console.log('Lyrics loaded'));
player.on('playlistchange', () => console.log('Playlist updated'));
player.on('volumechange', (volume) => console.log('Volume:', volume));
player.on('error', (error) => console.error(error));
```

---

## Types & Enums

### PlayMode

```typescript
enum PlayMode {
  LOOP = 'loop',           // Loop entire playlist
  SHUFFLE = 'shuffle',     // Random order
  SINGLE = 'single',       // Repeat single track
  SEQUENTIAL = 'sequential' // Play once in order
}
```

### PlayState

```typescript
enum PlayState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  LOADING = 'loading',
  ERROR = 'error'
}
```

### Lyric

```typescript
interface Lyric {
  time: number;  // Timestamp in seconds
  text: string;  // Lyric text
}
```

### SFXInstance

```typescript
interface SFXInstance {
  audio: HTMLAudioElement;
  id: string;
  stop(): void;
}
```

### MetingData

```typescript
interface MetingData {
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
```

### EventType

```typescript
type EventType = 
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
```

---

## Events

All classes support event listening with `on()` and `off()` methods:

```typescript
// Add event listener
instance.on(event: EventType, listener: EventListener): void

// Remove event listener  
instance.off(event: EventType, listener: EventListener): void

// Event listener function
type EventListener = (data?: any) => void
```

### Common Events

- **`play`** - Playback started
- **`pause`** - Playback paused
- **`stop`** - Playback stopped
- **`ended`** - Track/audio ended
- **`timeupdate`** - Playback position updated
- **`volumechange`** - Volume changed
- **`error`** - Error occurred

### MusicPlayer Specific Events

- **`musicchange`** - Current track changed
- **`lyricchange`** - Current lyric line changed
- **`lyricsloaded`** - Lyrics finished loading
- **`playlistchange`** - Playlist modified

---

## Error Handling

All async methods can throw errors. Always use try-catch:

```javascript
try {
  await player.play();
} catch (error) {
  console.error('Playback failed:', error);
}

// Or handle via events
player.on('error', (error) => {
  console.error('Player error:', error);
});
```

## Best Practices

1. **Always handle errors** - Use try-catch or error events
2. **Clean up resources** - Call `destroy()` when done
3. **Preload wisely** - Enable preloading for better UX, but consider bandwidth
4. **Handle page visibility** - Use `stopOnHidden` for better mobile experience
5. **Fade effects** - Use fade in/out for smooth transitions
6. **Event listeners** - Remove listeners when components unmount
7. **Use Proxy config** - Direct property modification (`config.enable = false`) is now supported
8. **Batch updates** - Use object assignment for multiple config changes at once
