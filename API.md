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

#### `destroy(): void`
Clean up resources and remove event listeners.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `volume` | `number` | Current volume (0-1) |
| `rate` | `number` | Current playback rate |
| `loop` | `boolean` | Loop enabled |
| `currentTime` | `number` | Current playback position (seconds) |
| `duration` | `number` | Total duration (seconds) |
| `paused` | `boolean` | Whether playback is paused |
| `playing` | `string \| null` | Currently playing track ID |

### Events

```javascript
bgm.on('play', () => console.log('Started'));
bgm.on('pause', () => console.log('Paused'));
bgm.on('stop', () => console.log('Stopped'));
bgm.on('ended', () => console.log('Ended'));
bgm.on('timeupdate', (data) => console.log(data.currentTime));
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

#### `stop(id: string): void`
Stop all instances of a specific sound effect.

#### `stopAll(): void`
Stop all active sound effect instances.

#### `destroy(): void`
Clean up all resources.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `activeCount` | `number` | Number of currently playing instances |

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
| `url` | `string` | Audio file URL |
| `meta` | `Metadata` | Track metadata |
| `hasLyrics` | `boolean` | Whether lyrics are available |
| `lyricsReady` | `boolean` | Whether lyrics are loaded |

### Static Methods

#### `Music.parseLyrics(text: string): Lyric[]`
Parse LRC format lyrics text.

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
| `volume` | `number` | Current volume (0-1) |
| `rate` | `number` | Current playback rate |
| `loop` | `boolean` | Track loop enabled |
| `currentTime` | `number` | Current position (seconds) |
| `duration` | `number` | Current track duration |
| `paused` | `boolean` | Whether paused |
| `state` | `PlayState` | Current player state |
| `progress` | `number` | Playback progress (0-1) |
| `current` | `Music \| null` | Currently loaded track |
| `length` | `number` | Playlist length |
| `currentIndex` | `number` | Current track index |
| `playMode` | `PlayMode` | Current play mode |
| `lyric` | `Lyric \| null` | Current lyric line |

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