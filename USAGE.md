# Usage Guide

[![npm version](https://img.shields.io/badge/npm-webaudiokit-blue.svg)](https://www.npmjs.com/package/webaudiokit)

[English](USAGE.md) | [中文](USAGE_zh.md)

Comprehensive usage guide with practical examples for WebAudioKit.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Quick Start](#quick-start)
- [Configuration Management](#configuration-management)
- [BGM Examples](#bgm-examples)
- [SFX Examples](#sfx-examples)
- [Music Player Examples](#music-player-examples)
- [Advanced Patterns](#advanced-patterns)
- [Framework Integration](#framework-integration)
- [Best Practices](#best-practices)

---

## Installation & Setup

### NPM Installation

```bash
npm install webaudiokit
```

### ES Modules

```javascript
import { BGM, SFX, MusicPlayer, Music, PlayMode } from 'webaudiokit';
```

### CommonJS

```javascript
const { BGM, SFX, MusicPlayer, Music, PlayMode } = require('webaudiokit');
```

### CDN Usage

```html
<script type="module">
  import { BGM, SFX, MusicPlayer } from 'https://unpkg.com/webaudiokit@latest/dist/index.js';
</script>
```

---

## Quick Start

### Background Music (BGM)

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.7,
  loop: true,
  fadeIn: 1000,
  fadeOut: 800
});

// Load and play
await bgm.load('menu', 'audio/menu.mp3');
await bgm.play('menu');

// Control playback
bgm.pause();
await bgm.resume();
bgm.stop();
```

### Sound Effects (SFX)

```javascript
import { SFX } from 'webaudiokit';

const sfx = new SFX({ volume: 0.8 });

// Load and play
await sfx.load('click', 'audio/click.wav');
await sfx.play('click');

// Play with custom options
await sfx.play('click', { volume: 0.5, rate: 1.2 });

// Play without preloading
await sfx.play('newSound', { src: 'audio/new.wav' });
```

### Music Player

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

const player = new MusicPlayer({
  volume: 0.8,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500
});

// Add tracks
const music = new Music('song.mp3', {
  title: 'My Song',
  artist: 'Artist Name',
  cover: 'cover.jpg'
}, 'lyrics.lrc');

player.add(music);

// Control playback
await player.play();
player.pause();
await player.playNext();
await player.playPrev();
```

---

## Configuration Management

### Proxy-Based Configuration

All classes now support direct property modification using Proxy:

```javascript
const bgm = new BGM({ volume: 0.7, loop: true });

// ✅ Direct property modification (NEW!)
bgm.config.enable = false;  // Stops playback immediately
bgm.config.volume = 0.5;    // Applied to audio immediately
bgm.config.stopOnHidden = true;  // Listener setup automatically

// ✅ Object assignment (still works)
bgm.config = {
  volume: 0.6,
  fadeIn: 1500,
  stopOnHidden: true
};

// ✅ Get current config
const currentConfig = bgm.config;
console.log(currentConfig.volume); // 0.6
```

### Enable/Disable Control

```javascript
const bgm = new BGM();
const sfx = new SFX();
const player = new MusicPlayer();

// Start playing
await bgm.play('menu');
await player.play();

// Disable - stops playback and blocks all methods
bgm.config.enable = false;      // Stops BGM
sfx.config.enable = false;      // Stops all SFX instances
player.config.enable = false;   // Stops music

// Re-enable
bgm.config.enable = true;
await bgm.play('menu');  // Works again
```

### Settings Panel Example

```javascript
class AudioSettings {
  constructor() {
    this.bgm = new BGM();
    this.sfx = new SFX();
    this.player = new MusicPlayer();
    this.loadSettings();
  }
  
  // Apply user settings
  applySettings(settings) {
    // BGM settings
    this.bgm.config = {
      enable: settings.bgmEnabled,
      volume: settings.bgmVolume,
      stopOnHidden: settings.pauseWhenHidden
    };
    
    // SFX settings
    this.sfx.config = {
      enable: settings.sfxEnabled,
      volume: settings.sfxVolume
    };
    
    // Music player settings
    this.player.config = {
      enable: settings.musicEnabled,
      volume: settings.musicVolume,
      mode: settings.playMode,
      fadeIn: settings.enableFade ? 500 : 0,
      fadeOut: settings.enableFade ? 500 : 0
    };
  }
  
  // Save to localStorage
  saveSettings() {
    localStorage.setItem('audio-settings', JSON.stringify({
      bgm: this.bgm.config,
      sfx: this.sfx.config,
      player: this.player.config
    }));
  }
  
  // Load from localStorage
  loadSettings() {
    const saved = localStorage.getItem('audio-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.bgm.config = settings.bgm;
      this.sfx.config = settings.sfx;
      this.player.config = settings.player;
    }
  }
}
```

---

## BGM Examples

### Game State Music

```javascript
class GameAudioManager {
  constructor() {
    this.bgm = new BGM({
      volume: 0.7,
      fadeIn: 1500,
      fadeOut: 1000,
      stopOnHidden: true
    });
    
    this.loadMusic();
  }
  
  async loadMusic() {
    await Promise.all([
      this.bgm.load('menu', 'audio/menu.mp3'),
      this.bgm.load('gameplay', 'audio/gameplay.mp3'),
      this.bgm.load('boss', 'audio/boss-battle.mp3'),
      this.bgm.load('victory', 'audio/victory.mp3')
    ]);
  }
  
  async switchToMenu() {
    await this.bgm.play('menu');
  }
  
  async switchToGameplay() {
    await this.bgm.play('gameplay');
  }
  
  async switchToBoss() {
    await this.bgm.play('boss');
  }
  
  async showVictory() {
    await this.bgm.play('victory');
  }
  
  // Dynamic volume control
  setVolume(volume) {
    this.bgm.config.volume = volume;
  }
  
  // Toggle mute
  toggleMute() {
    this.bgm.config.enable = !this.bgm.config.enable;
  }
}
```

### Dynamic Volume Fade

```javascript
function smoothVolumeTransition(bgm, targetVolume, duration = 1000) {
  const startVolume = bgm.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = 50;
  const stepTime = duration / steps;
  const stepSize = volumeDiff / steps;
  
  let currentStep = 0;
  const interval = setInterval(() => {
    currentStep++;
    bgm.volume = startVolume + (stepSize * currentStep);
    
    if (currentStep >= steps) {
      bgm.volume = targetVolume;
      clearInterval(interval);
    }
  }, stepTime);
}

// Usage
const bgm = new BGM({ volume: 0.8 });
await bgm.play('ambient');

// Fade to 30% when dialog starts
smoothVolumeTransition(bgm, 0.3, 1000);

// Fade back to 80% when dialog ends
smoothVolumeTransition(bgm, 0.8, 1000);
```

---

## SFX Examples

### UI Sound Effects

```javascript
class UISounds {
  constructor() {
    this.sfx = new SFX({ volume: 0.7 });
    this.loadSounds();
  }
  
  async loadSounds() {
    await Promise.all([
      this.sfx.load('click', 'audio/ui/click.wav'),
      this.sfx.load('hover', 'audio/ui/hover.wav'),
      this.sfx.load('success', 'audio/ui/success.wav'),
      this.sfx.load('error', 'audio/ui/error.wav')
    ]);
  }
  
  playClick() {
    this.sfx.play('click');
  }
  
  playHover() {
    this.sfx.play('hover', { volume: 0.4 });
  }
  
  playSuccess() {
    this.sfx.play('success');
  }
  
  playError() {
    this.sfx.play('error');
  }
}

// Attach to DOM events
const ui = new UISounds();

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseenter', () => ui.playHover());
  btn.addEventListener('click', () => ui.playClick());
});

document.getElementById('submit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await submitForm();
    ui.playSuccess();
  } catch (error) {
    ui.playError();
  }
});
```

### Game Sound Effects

```javascript
class GameSFX {
  constructor() {
    this.sfx = new SFX({ 
      volume: 0.8,
      stopOnHidden: false
    });
    this.loadSounds();
  }
  
  async loadSounds() {
    const sounds = ['jump', 'land', 'collect', 'hurt', 'explosion', 'laser'];
    await Promise.all(
      sounds.map(sound => this.sfx.load(sound, `audio/game/${sound}.wav`))
    );
  }
  
  // Rapid fire with pitch variation
  shootLaser() {
    this.sfx.play('laser', { 
      volume: 0.6,
      rate: 1 + (Math.random() * 0.2 - 0.1)
    });
  }
  
  // Layered explosion effect
  explode(intensity = 1) {
    const count = Math.ceil(intensity * 3);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.sfx.play('explosion', {
          volume: 0.7 * intensity,
          rate: 0.8 + (Math.random() * 0.4)
        });
      }, i * 100);
    }
  }
  
  // Distance-based volume
  playAtDistance(soundId, distance, maxDistance = 100) {
    const volume = Math.max(0, 1 - (distance / maxDistance));
    if (volume > 0) {
      this.sfx.play(soundId, { volume });
    }
  }
}
```

---

## Music Player Examples

### Basic Player with UI

```javascript
class MusicPlayerUI {
  constructor() {
    this.player = new MusicPlayer({
      volume: 0.8,
      mode: PlayMode.SHUFFLE,
      fadeIn: 500,
      fadeOut: 500,
      preload: true
    });
    
    this.setupEventListeners();
    this.setupUI();
  }
  
  setupEventListeners() {
    this.player.on('musicchange', (music) => {
      this.updateTrackInfo(music);
    });
    
    this.player.on('timeupdate', ({ currentTime, duration }) => {
      this.updateProgress(currentTime, duration);
    });
    
    this.player.on('lyricchange', (lyric) => {
      this.displayLyric(lyric);
    });
    
    this.player.on('play', () => {
      document.getElementById('play-btn').textContent = '⏸';
    });
    
    this.player.on('pause', () => {
      document.getElementById('play-btn').textContent = '▶';
    });
    
    this.player.on('error', (error) => {
      console.error('Playback error:', error);
      this.showError('Failed to play track');
    });
  }
  
  setupUI() {
    document.getElementById('play-btn').onclick = () => this.togglePlay();
    document.getElementById('prev-btn').onclick = () => this.player.playPrev();
    document.getElementById('next-btn').onclick = () => this.player.playNext();
    
    document.getElementById('volume-slider').oninput = (e) => {
      this.player.config.volume = parseFloat(e.target.value);
    };
    
    document.getElementById('progress-bar').onclick = (e) => {
      const rect = e.target.getBoundingClientRect();
      const progress = (e.clientX - rect.left) / rect.width;
      this.player.progress = progress;
    };
  }
  
  async loadPlaylist(tracks) {
    const musicList = tracks.map(track => 
      new Music(track.url, {
        title: track.title,
        artist: track.artist,
        album: track.album,
        cover: track.cover
      }, track.lrcUrl)
    );
    
    this.player.addList(musicList);
  }
  
  async togglePlay() {
    if (this.player.paused) {
      await this.player.play();
    } else {
      this.player.pause();
    }
  }
  
  updateTrackInfo(music) {
    const meta = music.meta;
    document.getElementById('track-title').textContent = meta.title || 'Unknown';
    document.getElementById('track-artist').textContent = meta.artist || 'Unknown';
    
    if (meta.cover) {
      document.getElementById('cover-image').src = meta.cover;
    }
  }
  
  updateProgress(currentTime, duration) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    document.getElementById('current-time').textContent = this.formatTime(currentTime);
    document.getElementById('total-time').textContent = this.formatTime(duration);
  }
  
  displayLyric(lyric) {
    document.getElementById('current-lyric').textContent = lyric ? lyric.text : '';
  }
  
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 3000);
  }
}
```

### Playlist Management

```javascript
class PlaylistManager {
  constructor() {
    this.player = new MusicPlayer();
    this.playlists = new Map();
    this.currentPlaylistId = null;
  }
  
  createPlaylist(id, name, tracks = []) {
    const playlist = {
      id,
      name,
      tracks: tracks.map(t => new Music(t.url, t.metadata, t.lrcUrl)),
      createdAt: new Date()
    };
    
    this.playlists.set(id, playlist);
    return playlist;
  }
  
  async loadPlaylist(id) {
    const playlist = this.playlists.get(id);
    if (!playlist) throw new Error(`Playlist ${id} not found`);
    
    this.player.clear();
    this.player.addList(playlist.tracks);
    this.currentPlaylistId = id;
    
    return playlist;
  }
  
  addToPlaylist(playlistId, track) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error(`Playlist ${playlistId} not found`);
    
    const music = new Music(track.url, track.metadata, track.lrcUrl);
    playlist.tracks.push(music);
    
    if (this.currentPlaylistId === playlistId) {
      this.player.add(music);
    }
  }
  
  removeFromPlaylist(playlistId, trackIndex) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error(`Playlist ${playlistId} not found`);
    
    playlist.tracks.splice(trackIndex, 1);
    
    if (this.currentPlaylistId === playlistId) {
      this.player.remove(trackIndex);
    }
  }
  
  getAllPlaylists() {
    return Array.from(this.playlists.values());
  }
}
```

---

## Advanced Patterns

### Cross-Fade Transitions

```javascript
class CrossFadeManager {
  constructor() {
    this.bgmA = new BGM({ volume: 0 });
    this.bgmB = new BGM({ volume: 0 });
    this.currentBGM = this.bgmA;
    this.nextBGM = this.bgmB;
  }
  
  async crossFade(trackId, duration = 2000) {
    // Start next track at 0 volume
    this.nextBGM.config.volume = 0;
    await this.nextBGM.play(trackId);
    
    // Cross-fade
    const steps = 50;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      this.currentBGM.config.volume = 1 - progress;
      this.nextBGM.config.volume = progress;
      
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    
    // Stop old track and swap
    this.currentBGM.stop();
    [this.currentBGM, this.nextBGM] = [this.nextBGM, this.currentBGM];
  }
}
```

### Audio Context Management

```javascript
class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfx = null;
    this.player = null;
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    // Wait for user interaction
    await this.waitForUserInteraction();
    
    this.bgm = new BGM({ volume: 0.7 });
    this.sfx = new SFX({ volume: 0.8 });
    this.player = new MusicPlayer({ volume: 0.8 });
    
    this.isInitialized = true;
  }
  
  waitForUserInteraction() {
    return new Promise(resolve => {
      const handler = () => {
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
        resolve();
      };
      
      document.addEventListener('click', handler);
      document.addEventListener('keydown', handler);
    });
  }
  
  cleanup() {
    if (this.bgm) this.bgm.destroy();
    if (this.sfx) this.sfx.destroy();
    if (this.player) this.player.destroy();
    
    this.isInitialized = false;
  }
}
```

---

## Framework Integration

### React Hook

```jsx
import { useEffect, useRef, useState } from 'react';
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

function useMusicPlayer(options = {}) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    playerRef.current = new MusicPlayer({
      volume: 0.8,
      mode: PlayMode.SHUFFLE,
      ...options
    });
    
    const player = playerRef.current;
    
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('stop', () => setIsPlaying(false));
    player.on('musicchange', setCurrentTrack);
    player.on('timeupdate', ({ currentTime, duration }) => {
      setProgress(duration > 0 ? currentTime / duration : 0);
    });
    
    return () => player.destroy();
  }, []);
  
  const togglePlay = async () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      await playerRef.current.play();
    }
  };
  
  return {
    player: playerRef.current,
    isPlaying,
    currentTrack,
    progress,
    togglePlay
  };
}

// Usage
function MusicPlayerComponent({ playlist }) {
  const { player, isPlaying, currentTrack, progress, togglePlay } = useMusicPlayer();
  
  useEffect(() => {
    if (player && playlist) {
      const musicList = playlist.map(t => new Music(t.url, t.metadata, t.lrcUrl));
      player.clear();
      player.addList(musicList);
    }
  }, [player, playlist]);
  
  return (
    <div>
      <h3>{currentTrack?.meta.title || 'No track'}</h3>
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <div className="progress-bar">
        <div style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
```

### Vue Composable

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

export function useMusicPlayer(options = {}) {
  const player = ref(null);
  const isPlaying = ref(false);
  const currentTrack = ref(null);
  const progress = ref(0);
  
  onMounted(() => {
    player.value = new MusicPlayer({
      volume: 0.8,
      mode: PlayMode.SHUFFLE,
      ...options
    });
    
    player.value.on('play', () => isPlaying.value = true);
    player.value.on('pause', () => isPlaying.value = false);
    player.value.on('stop', () => isPlaying.value = false);
    player.value.on('musicchange', (music) => currentTrack.value = music);
    player.value.on('timeupdate', ({ currentTime, duration }) => {
      progress.value = duration > 0 ? currentTime / duration : 0;
    });
  });
  
  onUnmounted(() => {
    if (player.value) {
      player.value.destroy();
    }
  });
  
  const togglePlay = async () => {
    if (!player.value) return;
    
    if (isPlaying.value) {
      player.value.pause();
    } else {
      await player.value.play();
    }
  };
  
  return {
    player,
    isPlaying,
    currentTrack,
    progress,
    togglePlay
  };
}
```

---

## Best Practices

### 1. Always Handle User Interaction

Modern browsers require user interaction before playing audio:

```javascript
class AudioInitializer {
  constructor() {
    this.isUnlocked = false;
    this.audioManager = null;
  }
  
  async initialize() {
    if (this.isUnlocked) return;
    
    return new Promise(resolve => {
      const unlock = async () => {
        // Create silent audio to unlock
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        
        try {
          await audio.play();
          this.isUnlocked = true;
          this.audioManager = new AudioManager();
          resolve();
        } catch (e) {
          // Still locked
        }
        
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      
      document.addEventListener('click', unlock);
      document.addEventListener('touchstart', unlock);
    });
  }
}
```

### 2. Clean Up Resources

```javascript
class Component {
  constructor() {
    this.bgm = new BGM();
    this.sfx = new SFX();
    this.player = new MusicPlayer();
  }
  
  destroy() {
    // Always clean up when component unmounts
    this.bgm.destroy();
    this.sfx.destroy();
    this.player.destroy();
  }
}
```

### 3. Handle Errors Gracefully

```javascript
async function playWithErrorHandling(player) {
  try {
    await player.play();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showMessage('Please interact with the page to enable audio');
    } else if (error.name === 'NotSupportedError') {
      showMessage('Audio format not supported');
    } else {
      showMessage('Playback failed: ' + error.message);
    }
  }
}
```

### 4. Use Configuration Wisely

```javascript
// ✅ Good: Use direct property modification for single changes
player.config.volume = 0.5;
player.config.enable = false;

// ✅ Good: Use object assignment for multiple changes
player.config = {
  volume: 0.5,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500
};

// ❌ Avoid: Multiple separate assignments
player.config = { volume: 0.5 };
player.config = { mode: PlayMode.SHUFFLE };
player.config = { fadeIn: 500 };
```

### 5. Optimize for Mobile

```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const player = new MusicPlayer({
  volume: 0.8,
  preload: !isMobile,  // Disable preload on mobile to save bandwidth
  stopOnHidden: isMobile,  // Pause when tab hidden on mobile
  fadeIn: isMobile ? 200 : 500,  // Shorter fades on mobile
  fadeOut: isMobile ? 200 : 500
});
```

### 6. Implement Lazy Loading

```javascript
class LazyAudioLoader {
  constructor() {
    this.bgm = new BGM({ preload: false });
    this.loadedTracks = new Set();
  }
  
  async playTrack(id, src) {
    if (!this.loadedTracks.has(id)) {
      await this.bgm.load(id, src);
      this.loadedTracks.add(id);
    }
    
    await this.bgm.play(id);
  }
}
```

### 7. Monitor Performance

```javascript
class AudioPerformanceMonitor {
  constructor(player) {
    this.player = player;
    this.metrics = {
      loadTime: 0,
      playCount: 0,
      errorCount: 0
    };
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    const startTime = performance.now();
    
    this.player.on('play', () => {
      this.metrics.playCount++;
      this.metrics.loadTime = performance.now() - startTime;
    });
    
    this.player.on('error', () => {
      this.metrics.errorCount++;
    });
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

---

## Troubleshooting

### Audio Won't Play

1. Check if user has interacted with the page
2. Verify audio file format is supported
3. Check browser console for errors
4. Ensure `enable` is set to `true`

### High Memory Usage

1. Enable lazy loading (`preload: false`)
2. Clear unused playlists regularly
3. Limit concurrent SFX instances
4. Call `destroy()` when done

### Choppy Playback

1. Reduce fade duration
2. Enable preloading for next track
3. Use lower quality audio files
4. Reduce concurrent audio instances

---

For more examples and API details, see [API.md](API.md).
