# WebAudioKit

A lightweight, modern JavaScript library for web audio management with support for background music (BGM), sound effects (SFX), and music playback with playlists.

## Features

- 🎵 **BGM** - Background music with fade in/out effects
- 🔊 **SFX** - Sound effects with overlapping playback support
- 🎼 **Music** - Individual music tracks with metadata and lyrics
- 📻 **MusicPlayer** - Full-featured music player with playlist management
- 🎯 **TypeScript** - Full type definitions included
- 🪶 **Lightweight** - Minimal dependencies
- 🎨 **Modern API** - Clean, intuitive interface

## Installation

```bash
npm install webaudiokit
```

## Quick Start

```javascript
import { BGM, SFX, MusicPlayer, Music } from 'webaudiokit';

// Background Music
const bgm = new BGM({ fadeIn: 1000, fadeOut: 1000 });
await bgm.load('music/background.mp3');
await bgm.play();

// Sound Effects
const sfx = new SFX();
await sfx.load('sounds/click.mp3');
await sfx.play(); // Can play multiple times simultaneously

// Music Player
const player = new MusicPlayer();
const music1 = new Music('songs/song1.mp3', {
  title: 'Song Title',
  artist: 'Artist Name'
});
player.add(music1);
await player.play();
```

## Core Classes

### BGM
Background music manager with fade effects. Designed for single-track playback with smooth transitions.

### SFX
Sound effects manager supporting overlapping playback. Perfect for UI sounds and game effects.

### Music
Represents a single music track with metadata and lyrics support.

### MusicPlayer
Complete music player with playlist management, multiple play modes, and event system.

## Documentation

- [API Reference](./API.md) - Complete API documentation
- [Usage Guide](./USAGE.md) - Detailed usage examples
- [中文文档](./README_zh.md) - Chinese documentation

## Browser Support

Works in all modern browsers that support the Web Audio API:
- Chrome/Edge 14+
- Firefox 25+
- Safari 6+

## License

MIT License - see [LICENSE](./LICENSE) for details

## Links

- [GitHub Repository](https://github.com/Roy-Jin/WebAudioKit)
- [Documentation Site](https://WebAudioKit.pages.dev)
- [Report Issues](https://github.com/Roy-Jin/WebAudioKit/issues)
