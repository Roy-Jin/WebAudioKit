# Usage Guide

[![npm version](https://img.shields.io/npm/v/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)

[English](USAGE.md) | [中文](USAGE_zh.md)

Comprehensive usage guide with practical examples for WebAudioKit.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [BGM Examples](#bgm-examples)
- [SFX Examples](#sfx-examples)
- [Music Player Examples](#music-player-examples)
- [Advanced Patterns](#advanced-patterns)
- [Integration Examples](#integration-examples)
- [Performance Tips](#performance-tips)
- [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### Basic Installation

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

## BGM Examples

### Basic Background Music

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.6,
  loop: true,
  fadeIn: 1000,
  fadeOut: 800
});

// Load multiple tracks
await bgm.load('menu', 'audio/menu-music.mp3');
await bgm.load('game', 'audio/game-music.mp3');
await bgm.load('victory', 'audio/victory-music.mp3');

// Play with smooth transitions
await bgm.play('menu');
```
### Game State Music Management

```javascript
class GameAudioManager {
  constructor() {
    this.bgm = new BGM({
      volume: 0.7,
      fadeIn: 1500,
      fadeOut: 1000,
      stopOnHidden: true
    });
    
    this.loadGameMusic();
  }
  
  async loadGameMusic() {
    await Promise.all([
      this.bgm.load('menu', 'audio/menu.mp3'),
      this.bgm.load('gameplay', 'audio/gameplay.mp3'),
      this.bgm.load('boss', 'audio/boss-battle.mp3'),
      this.bgm.load('victory', 'audio/victory.mp3')
    ]);
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
}

const gameAudio = new GameAudioManager();
```

### Dynamic Volume Control

```javascript
const bgm = new BGM({ volume: 0.8 });

// Smooth volume transitions
function fadeVolume(targetVolume, duration = 1000) {
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
fadeVolume(0.3); // Fade to 30% volume
```

---

## SFX Examples

### UI Sound Effects

```javascript
import { SFX } from 'webaudiokit';

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
      this.sfx.load('error', 'audio/ui/error.wav'),
      this.sfx.load('notification', 'audio/ui/notification.wav')
    ]);
  }
  
  playClick() { this.sfx.play('click'); }
  playHover() { this.sfx.play('hover', { volume: 0.4 }); }
  playSuccess() { this.sfx.play('success'); }
  playError() { this.sfx.play('error'); }
  playNotification() { this.sfx.play('notification'); }
}

// Usage with DOM events
const ui = new UISounds();

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseenter', () => ui.playHover());
  btn.addEventListener('click', () => ui.playClick());
});
```
### Game Sound Effects

```javascript
class GameSFX {
  constructor() {
    this.sfx = new SFX({ 
      volume: 0.8,
      stopOnHidden: false // Keep playing when tab hidden
    });
    this.loadGameSounds();
  }
  
  async loadGameSounds() {
    const sounds = [
      'jump', 'land', 'collect', 'powerup', 'hurt', 'explosion',
      'laser', 'shield', 'teleport', 'victory'
    ];
    
    await Promise.all(
      sounds.map(sound => 
        this.sfx.load(sound, `audio/game/${sound}.wav`)
      )
    );
  }
  
  // Rapid fire effects
  shootLaser() {
    this.sfx.play('laser', { 
      volume: 0.6,
      rate: 1 + (Math.random() * 0.2 - 0.1) // Slight pitch variation
    });
  }
  
  // Overlapping explosions
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
}
```

### Spatial Audio Effects

```javascript
class SpatialSFX extends SFX {
  constructor(options) {
    super(options);
    this.listenerPosition = { x: 0, y: 0 };
  }
  
  // Play sound with distance-based volume
  playAtPosition(id, position, maxDistance = 100) {
    const distance = Math.sqrt(
      Math.pow(position.x - this.listenerPosition.x, 2) +
      Math.pow(position.y - this.listenerPosition.y, 2)
    );
    
    const volume = Math.max(0, 1 - (distance / maxDistance));
    
    if (volume > 0) {
      this.play(id, { volume });
    }
  }
  
  updateListenerPosition(x, y) {
    this.listenerPosition = { x, y };
  }
}
```

---

## Music Player Examples

### Basic Music Player

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

class MyMusicPlayer {
  constructor() {
    this.player = new MusicPlayer({
      volume: 0.8,
      mode: PlayMode.SHUFFLE,
      fadeIn: 500,
      fadeOut: 500,
      preload: true
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.player.on('musicchange', (music) => {
      this.updateUI(music);
    });
    
    this.player.on('timeupdate', ({ currentTime, duration }) => {
      this.updateProgress(currentTime, duration);
    });
    
    this.player.on('lyricchange', (lyric) => {
      this.displayLyric(lyric);
    });
    
    this.player.on('error', (error) => {
      console.error('Playback error:', error);
      this.showErrorMessage('Failed to play track');
    });
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
  
  updateUI(music) {
    const meta = music.meta;
    document.getElementById('track-title').textContent = meta.title || 'Unknown';
    document.getElementById('track-artist').textContent = meta.artist || 'Unknown';
    
    if (meta.cover) {
      document.getElementById('cover-image').src = meta.cover;
    }
  }
  
  updateProgress(currentTime, duration) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    
    document.getElementById('current-time').textContent = this.formatTime(currentTime);
    document.getElementById('total-time').textContent = this.formatTime(duration);
  }
  
  displayLyric(lyric) {
    const lyricElement = document.getElementById('current-lyric');
    lyricElement.textContent = lyric ? lyric.text : '';
  }
  
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```
### Streaming Music Player

```javascript
class StreamingPlayer {
  constructor() {
    this.player = new MusicPlayer({
      volume: 0.8,
      preload: true,
      stopOnHidden: false
    });
    
    this.currentPlaylist = null;
    this.setupMediaSession();
  }
  
  // Load from streaming service API
  async loadFromAPI(playlistId) {
    try {
      const response = await fetch(`/api/playlist/${playlistId}`);
      const data = await response.json();
      
      await this.player.addFromMeting(data.tracks);
      this.currentPlaylist = data;
      
      return data;
    } catch (error) {
      console.error('Failed to load playlist:', error);
      throw error;
    }
  }
  
  // Media Session API integration
  setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.player.play();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        this.player.pause();
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.player.playPrev();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.player.playNext();
      });
      
      this.player.on('musicchange', (music) => {
        this.updateMediaSession(music);
      });
    }
  }
  
  updateMediaSession(music) {
    if ('mediaSession' in navigator) {
      const meta = music.meta;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title || 'Unknown Track',
        artist: meta.artist || 'Unknown Artist',
        album: meta.album || 'Unknown Album',
        artwork: meta.cover ? [{ src: meta.cover }] : []
      });
    }
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
      tracks: tracks.map(track => new Music(track.url, track.metadata, track.lrcUrl)),
      createdAt: new Date(),
      duration: 0
    };
    
    playlist.duration = playlist.tracks.reduce((total, track) => {
      return total + (track.meta.duration || 0);
    }, 0);
    
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
    
    // If this playlist is currently loaded, add to player
    if (this.currentPlaylistId === playlistId) {
      this.player.add(music);
    }
  }
  
  removeFromPlaylist(playlistId, trackIndex) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error(`Playlist ${playlistId} not found`);
    
    playlist.tracks.splice(trackIndex, 1);
    
    // If this playlist is currently loaded, remove from player
    if (this.currentPlaylistId === playlistId) {
      this.player.remove(trackIndex);
    }
  }
  
  shufflePlaylist(playlistId) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return;
    
    // Fisher-Yates shuffle
    for (let i = playlist.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist.tracks[i], playlist.tracks[j]] = [playlist.tracks[j], playlist.tracks[i]];
    }
    
    // Reload if current
    if (this.currentPlaylistId === playlistId) {
      this.loadPlaylist(playlistId);
    }
  }
}
```

---

## Advanced Patterns

### Audio Context Management

```javascript
class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfx = null;
    this.player = null;
    this.masterVolume = 1;
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    // Wait for user interaction before creating audio
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
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    if (this.bgm) this.bgm.volume = this.bgm.volume * this.masterVolume;
    if (this.player) this.player.volume = this.player.volume * this.masterVolume;
    // SFX volume is applied per-play
  }
  
  async cleanup() {
    if (this.bgm) this.bgm.destroy();
    if (this.sfx) this.sfx.destroy();
    if (this.player) this.player.destroy();
    
    this.isInitialized = false;
  }
}
```
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
    this.nextBGM.volume = 0;
    await this.nextBGM.play(trackId);
    
    // Cross-fade between tracks
    const steps = 50;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      this.currentBGM.volume = 1 - progress;
      this.nextBGM.volume = progress;
      
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    
    // Stop old track and swap references
    this.currentBGM.stop();
    [this.currentBGM, this.nextBGM] = [this.nextBGM, this.currentBGM];
  }
}
```

### Audio Visualization

```javascript
class AudioVisualizer {
  constructor(player) {
    this.player = player;
    this.canvas = document.getElementById('visualizer');
    this.ctx = this.canvas.getContext('2d');
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
    
    this.setupAnalyser();
  }
  
  setupAnalyser() {
    // Note: This requires access to the audio context
    // WebAudioKit doesn't expose this directly, but you can extend it
    this.player.on('play', () => {
      if (!this.analyser) {
        // Create analyser node (requires audio context access)
        // This is a simplified example
        this.startVisualization();
      }
    });
    
    this.player.on('pause', () => {
      this.stopVisualization();
    });
  }
  
  startVisualization() {
    if (this.animationId) return;
    
    const draw = () => {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw waveform or frequency bars
      this.drawBars();
      
      this.animationId = requestAnimationFrame(draw);
    };
    
    draw();
  }
  
  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  drawBars() {
    // Simplified visualization
    const barWidth = this.canvas.width / 64;
    let x = 0;
    
    for (let i = 0; i < 64; i++) {
      const barHeight = Math.random() * this.canvas.height * 0.8;
      
      this.ctx.fillStyle = `hsl(${i * 5}, 70%, 50%)`;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
      
      x += barWidth;
    }
  }
}
```

---

## Integration Examples

### React Integration

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

function MusicPlayerComponent({ playlist }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  useEffect(() => {
    // Initialize player
    playerRef.current = new MusicPlayer({
      volume,
      mode: PlayMode.SHUFFLE,
      fadeIn: 300,
      fadeOut: 300
    });
    
    const player = playerRef.current;
    
    // Event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('stop', () => setIsPlaying(false));
    
    player.on('musicchange', (music) => {
      setCurrentTrack(music);
    });
    
    player.on('timeupdate', ({ currentTime, duration }) => {
      setProgress(duration > 0 ? currentTime / duration : 0);
    });
    
    // Cleanup
    return () => {
      player.destroy();
    };
  }, []);
  
  useEffect(() => {
    if (playerRef.current && playlist) {
      const musicList = playlist.map(track => 
        new Music(track.url, track.metadata, track.lrcUrl)
      );
      
      playerRef.current.clear();
      playerRef.current.addList(musicList);
    }
  }, [playlist]);
  
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);
  
  const togglePlay = async () => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };
  
  return (
    <div className="music-player">
      <div className="track-info">
        <h3>{currentTrack?.meta.title || 'No track'}</h3>
        <p>{currentTrack?.meta.artist || 'Unknown artist'}</p>
      </div>
      
      <div className="controls">
        <button onClick={() => playerRef.current?.playPrev()}>⏮</button>
        <button onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => playerRef.current?.playNext()}>⏭</button>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

### Vue.js Integration

```vue
<template>
  <div class="audio-manager">
    <div class="bgm-controls">
      <h3>Background Music</h3>
      <button @click="playBGM('ambient')">Ambient</button>
      <button @click="playBGM('action')">Action</button>
      <button @click="pauseBGM">Pause</button>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        v-model="bgmVolume"
        @input="updateBGMVolume"
      />
    </div>
    
    <div class="sfx-controls">
      <h3>Sound Effects</h3>
      <button @click="playSFX('click')">Click</button>
      <button @click="playSFX('explosion')">Explosion</button>
      <p>Active: {{ sfxCount }}</p>
    </div>
  </div>
</template>

<script>
import { BGM, SFX } from 'webaudiokit';

export default {
  name: 'AudioManager',
  
  data() {
    return {
      bgm: null,
      sfx: null,
      bgmVolume: 0.7,
      sfxCount: 0
    };
  },
  
  async mounted() {
    // Initialize audio
    this.bgm = new BGM({ 
      volume: this.bgmVolume,
      fadeIn: 1000,
      fadeOut: 800
    });
    
    this.sfx = new SFX({ volume: 0.8 });
    
    // Load assets
    await Promise.all([
      this.bgm.load('ambient', '/audio/ambient.mp3'),
      this.bgm.load('action', '/audio/action.mp3'),
      this.sfx.load('click', '/audio/click.wav'),
      this.sfx.load('explosion', '/audio/explosion.wav')
    ]);
    
    // Update SFX count periodically
    this.sfxInterval = setInterval(() => {
      this.sfxCount = this.sfx.activeCount;
    }, 100);
  },
  
  beforeUnmount() {
    if (this.bgm) this.bgm.destroy();
    if (this.sfx) this.sfx.destroy();
    if (this.sfxInterval) clearInterval(this.sfxInterval);
  },
  
  methods: {
    async playBGM(track) {
      try {
        await this.bgm.play(track);
      } catch (error) {
        console.error('BGM playback failed:', error);
      }
    },
    
    pauseBGM() {
      this.bgm.pause();
    },
    
    updateBGMVolume() {
      this.bgm.volume = this.bgmVolume;
    },
    
    async playSFX(sound) {
      try {
        await this.sfx.play(sound);
      } catch (error) {
        console.error('SFX playback failed:', error);
      }
    }
  }
};
</script>
```
---

## Performance Tips

### 1. Lazy Loading Strategy

```javascript
class OptimizedAudioManager {
  constructor() {
    this.bgm = new BGM({ preload: false }); // Don't preload everything
    this.sfx = new SFX({ preload: false });
    this.loadedAssets = new Set();
  }
  
  async loadOnDemand(type, id, src) {
    const key = `${type}:${id}`;
    if (this.loadedAssets.has(key)) return;
    
    if (type === 'bgm') {
      await this.bgm.load(id, src);
    } else if (type === 'sfx') {
      await this.sfx.load(id, src);
    }
    
    this.loadedAssets.add(key);
  }
  
  async playBGM(id, src) {
    await this.loadOnDemand('bgm', id, src);
    return this.bgm.play(id);
  }
  
  async playSFX(id, src) {
    await this.loadOnDemand('sfx', id, src);
    return this.sfx.play(id);
  }
}
```

### 2. Resource Pooling

```javascript
class AudioPool {
  constructor(maxSize = 10) {
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  getAudio(src) {
    // Try to reuse existing audio element
    let audio = this.pool.find(a => a.src.endsWith(src) && a.paused);
    
    if (!audio) {
      audio = new Audio(src);
      if (this.pool.length < this.maxSize) {
        this.pool.push(audio);
      }
    }
    
    return audio;
  }
  
  cleanup() {
    this.pool.forEach(audio => {
      audio.src = '';
      audio.load();
    });
    this.pool = [];
  }
}
```

### 3. Memory Management

```javascript
class MemoryEfficientPlayer {
  constructor() {
    this.player = new MusicPlayer({ preload: true });
    this.maxCacheSize = 50; // Maximum tracks to keep in memory
    this.trackCache = new Map();
  }
  
  async addTrack(music) {
    // Remove oldest tracks if cache is full
    if (this.trackCache.size >= this.maxCacheSize) {
      const oldestKey = this.trackCache.keys().next().value;
      this.trackCache.delete(oldestKey);
    }
    
    this.trackCache.set(music.url, music);
    this.player.add(music);
  }
  
  clearCache() {
    this.trackCache.clear();
    this.player.clear();
  }
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Audio Won't Play on Mobile

```javascript
// Solution: Wait for user interaction
class MobileAudioFix {
  constructor() {
    this.isUnlocked = false;
    this.pendingActions = [];
  }
  
  async initialize() {
    if (this.isUnlocked) return;
    
    return new Promise(resolve => {
      const unlock = async () => {
        // Create and play silent audio to unlock
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        
        try {
          await audio.play();
          this.isUnlocked = true;
          
          // Execute pending actions
          this.pendingActions.forEach(action => action());
          this.pendingActions = [];
          
          resolve();
        } catch (e) {
          // Still locked, keep trying
        }
        
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('click', unlock);
      };
      
      document.addEventListener('touchstart', unlock);
      document.addEventListener('click', unlock);
    });
  }
  
  async safePlay(audioInstance, method, ...args) {
    if (this.isUnlocked) {
      return audioInstance[method](...args);
    } else {
      return new Promise(resolve => {
        this.pendingActions.push(() => {
          audioInstance[method](...args).then(resolve);
        });
      });
    }
  }
}
```

#### 2. CORS Issues with Audio Files

```javascript
// Solution: Proper server configuration or proxy
class CORSAudioLoader {
  constructor() {
    this.proxyUrl = '/api/audio-proxy/';
  }
  
  getAudioUrl(originalUrl) {
    // Check if URL is from same origin
    try {
      const url = new URL(originalUrl);
      if (url.origin === window.location.origin) {
        return originalUrl;
      }
    } catch (e) {
      // Relative URL, should be fine
      return originalUrl;
    }
    
    // Use proxy for cross-origin requests
    return this.proxyUrl + encodeURIComponent(originalUrl);
  }
  
  async loadAudio(src) {
    const proxiedUrl = this.getAudioUrl(src);
    const audio = new Audio(proxiedUrl);
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.addEventListener('error', reject);
      audio.load();
    });
  }
}
```

#### 3. Memory Leaks Prevention

```javascript
class LeakPreventionManager {
  constructor() {
    this.instances = new Set();
    this.eventListeners = new Map();
  }
  
  createBGM(options) {
    const bgm = new BGM(options);
    this.instances.add(bgm);
    return bgm;
  }
  
  createSFX(options) {
    const sfx = new SFX(options);
    this.instances.add(sfx);
    return sfx;
  }
  
  createMusicPlayer(options) {
    const player = new MusicPlayer(options);
    this.instances.add(player);
    return player;
  }
  
  addEventListener(instance, event, listener) {
    if (!this.eventListeners.has(instance)) {
      this.eventListeners.set(instance, []);
    }
    
    this.eventListeners.get(instance).push({ event, listener });
    instance.on(event, listener);
  }
  
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, instance) => {
      listeners.forEach(({ event, listener }) => {
        instance.off(event, listener);
      });
    });
    
    // Destroy all instances
    this.instances.forEach(instance => {
      if (instance.destroy) {
        instance.destroy();
      }
    });
    
    this.instances.clear();
    this.eventListeners.clear();
  }
}

// Usage in SPA frameworks
window.addEventListener('beforeunload', () => {
  audioManager.cleanup();
});
```

#### 4. Autoplay Policy Handling

```javascript
class AutoplayHandler {
  static async handleAutoplay(audioInstance, playMethod, ...args) {
    try {
      await audioInstance[playMethod](...args);
      return { success: true };
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        return { 
          success: false, 
          reason: 'autoplay-blocked',
          message: 'Autoplay blocked. User interaction required.'
        };
      }
      throw error;
    }
  }
  
  static showAutoplayPrompt() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8); display: flex;
      align-items: center; justify-content: center;
      z-index: 10000; color: white; font-family: sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3>Enable Audio</h3>
        <p>Click to enable audio playback</p>
        <button style="padding: 10px 20px; font-size: 16px;">
          Enable Audio
        </button>
      </div>
    `;
    
    return new Promise(resolve => {
      overlay.querySelector('button').onclick = () => {
        document.body.removeChild(overlay);
        resolve();
      };
      
      document.body.appendChild(overlay);
    });
  }
}
```

---

## Best Practices Summary

1. **Always handle user interaction requirements** - Modern browsers require user interaction before audio playback
2. **Use appropriate fade times** - 300-1000ms works well for most transitions
3. **Implement proper error handling** - Network issues and codec problems are common
4. **Clean up resources** - Call `destroy()` methods when components unmount
5. **Consider mobile limitations** - Lower quality audio and fewer simultaneous sounds
6. **Preload strategically** - Balance UX and bandwidth usage
7. **Handle page visibility** - Pause/resume audio when tab becomes hidden/visible
8. **Use event listeners wisely** - Remove listeners to prevent memory leaks
9. **Test across browsers** - Audio support varies between browsers and devices
10. **Provide fallbacks** - Always have a plan when audio fails to load or play