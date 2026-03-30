<div align="center">

# WebAudioKit

[![npm version](https://img.shields.io/npm/v/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)
[![license](https://img.shields.io/npm/l/webaudiokit.svg)](https://github.com/Roy-Jin/WebAudioKit/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/webaudiokit.svg)](https://bundlephobia.com/package/webaudiokit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A powerful, lightweight JavaScript library for web audio manipulation with comprehensive support for background music, sound effects, and advanced music playback features.

[English](README.md) | [中文](README_zh.md)

</div>

## ✨ Features

- 🎵 **Background Music (BGM)** - Seamless looping background audio with fade effects
- 🔊 **Sound Effects (SFX)** - Overlapping sound effects with instance management  
- 🎶 **Music Player** - Full-featured player with playlist, lyrics, and multiple play modes
- 📱 **Mobile Optimized** - Handles page visibility changes and mobile audio constraints
- 🎚️ **Advanced Controls** - Volume, playback rate, fade in/out, and more
- 📝 **Lyrics Support** - LRC format parsing with real-time synchronization
- 🔄 **Play Modes** - Sequential, loop, shuffle, and single repeat modes
- 🚀 **Performance** - Lazy loading, preloading, and efficient resource management
- 📦 **TypeScript** - Full TypeScript support with comprehensive type definitions
- 🌐 **Universal** - Works in all modern browsers with Web Audio API support

## 📦 Installation

```bash
# npm
npm install webaudiokit

# yarn
yarn add webaudiokit

# pnpm
pnpm add webaudiokit
```

### CDN Usage

```html
<!-- ES Module -->
<script type="module">
  import { BGM, SFX, MusicPlayer } from 'https://unpkg.com/webaudiokit@latest/dist/index.js';
</script>

<!-- UMD (Global) -->
<script src="https://unpkg.com/webaudiokit@latest/dist/index.global.js"></script>
<script>
  const { BGM, SFX, MusicPlayer } = WebAudioKit;
</script>
```

## 🚀 Quick Start

### Background Music (BGM)

Perfect for ambient music, game soundtracks, and atmospheric audio:

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.7,
  loop: true,
  fadeIn: 1000,  // 1 second fade in
  fadeOut: 800,  // 0.8 second fade out
  stopOnHidden: true  // Auto-pause when tab is hidden
});

// Load and play background music
await bgm.load('ambient', 'music/ambient.mp3');
await bgm.load('battle', 'music/battle.mp3');

// Play with smooth transition
await bgm.play('ambient');

// Switch to different track with fade effect
await bgm.play('battle');
```

### Sound Effects (SFX)

Ideal for UI sounds, game effects, and overlapping audio:

```javascript
import { SFX } from 'webaudiokit';

const sfx = new SFX({
  volume: 0.8,
  stopOnHidden: false
});

// Load sound effects
await sfx.load('click', 'sounds/click.wav');
await sfx.load('explosion', 'sounds/explosion.mp3');

// Play effects (can overlap)
await sfx.play('click');
await sfx.play('click'); // Plays simultaneously with first
await sfx.play('explosion', { volume: 0.5 }); // Custom volume

// Stop all instances of a specific sound
sfx.stop('click');

// Stop all active sound effects
sfx.stopAll();
```

### Music Player

Complete music player with playlist management and advanced features:

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

const player = new MusicPlayer({
  volume: 0.8,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500,
  stopOnHidden: false
});

// Create music tracks
const song1 = new Music('songs/song1.mp3', {
  title: 'Awesome Song',
  artist: 'Great Artist',
  album: 'Best Album',
  cover: 'covers/song1.jpg'
});

const song2 = new Music('songs/song2.mp3', {
  title: 'Another Hit',
  artist: 'Cool Band',
  album: 'New Release',
  cover: 'covers/song2.jpg'
}, 'lyrics/song2.lrc'); // LRC lyrics file

// Add to playlist
player.add(song1);
player.add(song2);

// Or add from Meting API data
await player.addFromMeting(metingApiResponse);

// Playback controls
await player.play();        // Play current track
await player.play(0);       // Play specific track by index
await player.playNext();    // Next track
await player.playPrev();    // Previous track
player.pause();
player.stop();

// Player state
console.log(player.state);        // 'playing', 'paused', 'stopped', etc.
console.log(player.currentTime);  // Current playback position
console.log(player.duration);     // Track duration
console.log(player.progress);     // Playback progress (0-1)

// Event handling
player.on('play', () => console.log('Started playing'));
player.on('pause', () => console.log('Paused'));
player.on('musicchange', (music) => console.log('Now playing:', music.meta.title));
player.on('lyricchange', (lyric) => console.log('Lyric:', lyric?.text));
```

## 🎯 Core Classes

### BGM (Background Music)
- **Purpose**: Single-track background audio with smooth transitions
- **Features**: Fade in/out, looping, volume control, page visibility handling
- **Use Cases**: Game music, ambient sounds, website background audio

### SFX (Sound Effects)  
- **Purpose**: Short, overlapping sound effects
- **Features**: Multiple simultaneous playback, instance management, custom volume per play
- **Use Cases**: UI feedback, game effects, notification sounds

### Music
- **Purpose**: Individual music track with metadata
- **Features**: Metadata support, lyrics parsing, lazy loading
- **Use Cases**: Music library items, playlist entries

### MusicPlayer
- **Purpose**: Complete music player with playlist management
- **Features**: Multiple play modes, event system, progress tracking, lyrics sync
- **Use Cases**: Music applications, audio players, streaming interfaces

## 📖 Documentation

- **[API Reference](API.md)** - Complete API documentation with all methods and options
- **[Usage Guide](USAGE.md)** - Detailed examples and best practices  
- **[中文文档](README_zh.md)** - Complete Chinese documentation

## 🌐 Browser Support

WebAudioKit works in all modern browsers with Web Audio API support:

| Browser | Version |
|---------|---------|
| Chrome  | 14+     |
| Firefox | 25+     |
| Safari  | 6+      |
| Edge    | 12+     |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[GitHub Repository](https://github.com/Roy-Jin/WebAudioKit)** - Source code and development
- **[Documentation Site](https://WebAudioKit.pages.dev)** - Live documentation and examples
- **[npm Package](https://www.npmjs.com/package/webaudiokit)** - Package registry
- **[Report Issues](https://github.com/Roy-Jin/WebAudioKit/issues)** - Bug reports and feature requests

---

Made with ❤️ by [Roy-Jin](https://github.com/Roy-Jin)