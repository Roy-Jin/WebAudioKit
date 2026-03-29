# API Reference

Complete API documentation for WebAudioKit.

## Table of Contents

- [BGM](#bgm)
- [SFX](#sfx)
- [Music](#music)
- [MusicPlayer](#musicplayer)
- [Types](#types)

---

## BGM

Background music manager with fade in/out effects. Does not support overlapping playback.

### Constructor

```typescript
new BGM(options?: BGMOptions)
```

**Options:**
- `volume?: number` - Initial volume (0-1), default: 1
- `rate?: number` - Playback rate, default: 1
- `loop?: boolean` - Loop playback, default: true
- `fadeIn?: number` - Fade in duration in milliseconds, default: 0
- `fadeOut?: number` - Fade out duration in milliseconds, default: 0

### Methods

#### load(src: string): Promise\<void\>
Preload BGM resource.

```javascript
await bgm.load('music/background.mp3');
```

#### play(): Promise\<void\>
Play the loaded BGM. Applies fade in effect if configured.

```javascript
await bgm.play();
```

#### pause(): void
Pause playback.

```javascript
bgm.pause();
```

#### stop(): void
Stop playback and reset to beginning. Applies fade out effect if configured.

```javascript
bgm.stop();
```

#### switch(src: string): Promise\<void\>
Switch to a new BGM source with fade transition.

```javascript
await bgm.switch('music/new-background.mp3');
```

#### destroy(): void
Clean up resources and remove all event listeners.

```javascript
bgm.destroy();
```

### Properties

#### volume: number
Get or set volume (0-1).

```javascript
bgm.volume = 0.5;
console.log(bgm.volume); // 0.5
```

#### currentTime: number
Get or set current playback position in seconds.

```javascript
bgm.currentTime = 30; // Jump to 30 seconds
```

#### duration: number (readonly)
Get total duration in seconds.

```javascript
console.log(bgm.duration);
```

#### paused: boolean (readonly)
Check if BGM is paused.

```javascript
if (bgm.paused) {
  await bgm.play();
}
```

#### loop: boolean
Get or set loop mode.

```javascript
bgm.loop = false;
```

#### rate: number
Get or set playback rate.

```javascript
bgm.rate = 1.5; // 1.5x speed
```

#### loaded: boolean (readonly)
Check if BGM is loaded.

```javascript
if (bgm.loaded) {
  await bgm.play();
}
```

### Events

#### on(event: EventType, listener: EventListener): void
Add event listener.

```javascript
bgm.on('play', () => console.log('BGM started'));
bgm.on('ended', () => console.log('BGM ended'));
```

#### off(event: EventType, listener: EventListener): void
Remove event listener.

**Available Events:**
- `play` - Playback started
- `pause` - Playback paused
- `stop` - Playback stopped
- `ended` - Playback ended naturally
- `timeupdate` - Time updated (provides `{currentTime, duration}`)
- `volumechange` - Volume changed
- `error` - Error occurred
- `loaded` - Resource loaded

---

## SFX

Sound effects manager supporting overlapping playback.

### Constructor

```typescript
new SFX(options?: SFXOptions)
```

**Options:**
- `volume?: number` - Initial volume (0-1), default: 1
- `rate?: number` - Playback rate, default: 1

### Methods

#### load(src: string): Promise\<void\>
Preload sound effect resource.

```javascript
await sfx.load('sounds/click.mp3');
```

#### play(): Promise\<void\>
Play the sound effect. Creates a new instance each time, allowing overlapping playback.

```javascript
await sfx.play();
await sfx.play(); // Can play simultaneously
```

#### stopAll(): void
Stop all active sound effect instances.

```javascript
sfx.stopAll();
```

#### destroy(): void
Clean up all resources and remove event listeners.

```javascript
sfx.destroy();
```

### Properties

#### volume: number
Get or set volume (0-1). Affects all active and future instances.

```javascript
sfx.volume = 0.8;
```

#### rate: number
Get or set playback rate. Affects all active and future instances.

```javascript
sfx.rate = 1.2;
```

#### activeCount: number (readonly)
Get number of currently playing instances.

```javascript
console.log(sfx.activeCount); // 3
```

#### loaded: boolean (readonly)
Check if sound effect is loaded.

```javascript
if (sfx.loaded) {
  await sfx.play();
}
```

### Events

Same event system as BGM:
- `play` - Instance started playing
- `ended` - Instance finished playing
- `stop` - All instances stopped
- `volumechange` - Volume changed
- `error` - Error occurred
- `loaded` - Resource loaded

---

## Music

Represents a single music track with metadata and lyrics.

### Constructor

```typescript
new Music(src: string, metadata?: Metadata)
```

```javascript
const music = new Music('songs/song.mp3', {
  title: 'Song Title',
  artist: 'Artist Name',
  album: 'Album Name',
  cover: 'covers/cover.jpg',
  lrc: '[00:00.00]Lyrics line 1\n[00:05.00]Lyrics line 2'
});
```

### Properties

#### url: string (readonly)
Get the audio source URL.

```javascript
console.log(music.url);
```

#### meta: Metadata
Get or set metadata. Setting new metadata merges with existing data.

```javascript
music.meta = { artist: 'New Artist' };
console.log(music.meta);
```

### Methods

#### getLyrics(): Lyric[]
Get all parsed lyrics.

```javascript
const lyrics = music.getLyrics();
// [{ time: 0, text: 'Lyrics line 1' }, ...]
```

#### getLyricAt(time: number): Lyric | null
Get the lyric at a specific time.

```javascript
const lyric = music.getLyricAt(5.5);
console.log(lyric?.text);
```

### Events

- `lyricsloaded` - Lyrics parsed successfully

---

## MusicPlayer

Full-featured music player with playlist management.

### Constructor

```typescript
new MusicPlayer(options?: MusicPlayerOptions)
```

**Options:**
- `volume?: number` - Initial volume (0-1), default: 1
- `rate?: number` - Playback rate, default: 1
- `loop?: boolean` - Loop current track, default: false
- `mode?: PlayMode` - Play mode, default: PlayMode.SEQUENTIAL

### Playlist Management

#### add(music: Music): void
Add a music track to the playlist.

```javascript
const music = new Music('song.mp3', { title: 'Song' });
player.add(music);
```

#### addList(musicList: Music[]): void
Add multiple tracks at once.

```javascript
player.addList([music1, music2, music3]);
```

#### addFromMeting(data: MetingData[]): Promise\<void\>
Add tracks from Meting API format data.

```javascript
await player.addFromMeting(metingApiResponse);
```

#### remove(idx: number): void
Remove track at index.

```javascript
player.remove(0);
```

#### clear(): void
Clear the entire playlist.

```javascript
player.clear();
```

#### get(idx: number): Music | null
Get track at index.

```javascript
const music = player.get(0);
```

#### getAll(): Music[]
Get all tracks in playlist.

```javascript
const allMusic = player.getAll();
```

### Playback Control

#### play(idx?: number): Promise\<void\>
Play music. If index provided, plays that track.

```javascript
await player.play(); // Play current
await player.play(2); // Play track at index 2
```

#### pause(): void
Pause playback.

```javascript
player.pause();
```

#### stop(): void
Stop playback and reset position.

```javascript
player.stop();
```

#### playNext(): Promise\<void\>
Play next track based on play mode.

```javascript
await player.playNext();
```

#### playPrev(): Promise\<void\>
Play previous track based on play mode.

```javascript
await player.playPrev();
```

#### next(): Music | null
Get next track without playing.

```javascript
const nextMusic = player.next();
```

#### prev(): Music | null
Get previous track without playing.

```javascript
const prevMusic = player.prev();
```

### Properties

#### volume: number
Get or set volume (0-1).

```javascript
player.volume = 0.7;
```

#### currentTime: number
Get or set current playback position in seconds.

```javascript
player.currentTime = 60;
```

#### duration: number (readonly)
Get current track duration.

```javascript
console.log(player.duration);
```

#### progress: number
Get or set playback progress (0-1).

```javascript
player.progress = 0.5; // Jump to 50%
```

#### paused: boolean (readonly)
Check if player is paused.

```javascript
if (player.paused) {
  await player.play();
}
```

#### loop: boolean
Get or set loop mode for current track.

```javascript
player.loop = true;
```

#### rate: number
Get or set playback rate.

```javascript
player.rate = 1.25;
```

#### state: PlayState (readonly)
Get current player state.

```javascript
console.log(player.state); // 'playing', 'paused', 'stopped', 'loading', 'error'
```

#### current: Music | null (readonly)
Get currently playing music.

```javascript
const current = player.current;
console.log(current?.meta.title);
```

#### currentIndex: number
Get or set current track index.

```javascript
player.currentIndex = 3;
```

#### length: number (readonly)
Get playlist length.

```javascript
console.log(player.length);
```

#### playMode: PlayMode
Get or set play mode.

```javascript
player.playMode = PlayMode.SHUFFLE;
```

#### lyric: Lyric | null (readonly)
Get current lyric line.

```javascript
const lyric = player.lyric;
console.log(lyric?.text);
```

### Methods

#### getLyrics(): Lyric[]
Get all lyrics of current track.

```javascript
const lyrics = player.getLyrics();
```

#### destroy(): void
Clean up all resources.

```javascript
player.destroy();
```

### Events

- `play` - Playback started
- `pause` - Playback paused
- `stop` - Playback stopped
- `ended` - Track ended
- `timeupdate` - Time updated (provides `{currentTime, duration}`)
- `volumechange` - Volume changed
- `error` - Error occurred
- `musicchange` - Current track changed (provides Music object)
- `playlistchange` - Playlist modified
- `lyricchange` - Current lyric line changed (provides Lyric object)

---

## Types

### PlayMode

```typescript
enum PlayMode {
  LOOP = 'loop',           // Loop entire playlist
  SHUFFLE = 'shuffle',     // Random order
  SINGLE = 'single',       // Repeat single track
  SEQUENTIAL = 'sequential' // Play once through
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

### Metadata

```typescript
interface Metadata {
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  lrc?: string;
  duration?: number;
}
```

### Lyric

```typescript
interface Lyric {
  time: number;  // Time in seconds
  text: string;  // Lyric text
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
