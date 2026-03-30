# 使用指南

[![npm version](https://img.shields.io/badge/npm-webaudiokit-blue.svg)](https://www.npmjs.com/package/webaudiokit)

[English](USAGE.md) | [中文](USAGE_zh.md)

WebAudioKit 的全面使用指南和实用示例。

## 目录

- [安装和设置](#安装和设置)
- [快速开始](#快速开始)
- [配置管理](#配置管理)
- [BGM 示例](#bgm-示例)
- [SFX 示例](#sfx-示例)
- [音乐播放器示例](#音乐播放器示例)
- [高级模式](#高级模式)
- [框架集成](#框架集成)
- [最佳实践](#最佳实践)

---

## 安装和设置

### NPM 安装

```bash
npm install webaudiokit
```

### ES 模块

```javascript
import { BGM, SFX, MusicPlayer, Music, PlayMode } from 'webaudiokit';
```

### CommonJS

```javascript
const { BGM, SFX, MusicPlayer, Music, PlayMode } = require('webaudiokit');
```

### CDN 使用

```html
<script type="module">
  import { BGM, SFX, MusicPlayer } from 'https://unpkg.com/webaudiokit@latest/dist/index.js';
</script>
```

---

## 快速开始

### 背景音乐 (BGM)

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.7,
  loop: true,
  fadeIn: 1000,
  fadeOut: 800
});

// 加载并播放
await bgm.load('menu', 'audio/menu.mp3');
await bgm.play('menu');

// 控制播放
bgm.pause();
await bgm.resume();
bgm.stop();
```

### 音效 (SFX)

```javascript
import { SFX } from 'webaudiokit';

const sfx = new SFX({ volume: 0.8 });

// 加载并播放
await sfx.load('click', 'audio/click.wav');
await sfx.play('click');

// 使用自定义选项播放
await sfx.play('click', { volume: 0.5, rate: 1.2 });

// 无需预加载直接播放
await sfx.play('newSound', { src: 'audio/new.wav' });
```

### 音乐播放器

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

const player = new MusicPlayer({
  volume: 0.8,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500
});

// 添加曲目
const music = new Music('song.mp3', {
  title: '我的歌曲',
  artist: '艺术家名称',
  cover: 'cover.jpg'
}, 'lyrics.lrc');

player.add(music);

// 控制播放
await player.play();
player.pause();
await player.playNext();
await player.playPrev();
```

---

## 配置管理

### 基于 Proxy 的配置

所有类现在都支持使用 Proxy 进行直接属性修改：

```javascript
const bgm = new BGM({ volume: 0.7, loop: true });

// ✅ 直接修改属性（新功能！）
bgm.config.enable = false;  // 立即停止播放
bgm.config.volume = 0.5;    // 立即应用到音频
bgm.config.stopOnHidden = true;  // 自动设置监听器

// ✅ 对象赋值（仍然有效）
bgm.config = {
  volume: 0.6,
  fadeIn: 1500,
  stopOnHidden: true
};

// ✅ 获取当前配置
const currentConfig = bgm.config;
console.log(currentConfig.volume); // 0.6
```

### 启用/禁用控制

```javascript
const bgm = new BGM();
const sfx = new SFX();
const player = new MusicPlayer();

// 开始播放
await bgm.play('menu');
await player.play();

// 禁用 - 停止播放并阻止所有方法
bgm.config.enable = false;      // 停止 BGM
sfx.config.enable = false;      // 停止所有音效实例
player.config.enable = false;   // 停止音乐

// 重新启用
bgm.config.enable = true;
await bgm.play('menu');  // 再次工作
```

### 设置面板示例

```javascript
class AudioSettings {
  constructor() {
    this.bgm = new BGM();
    this.sfx = new SFX();
    this.player = new MusicPlayer();
    this.loadSettings();
  }
  
  // 应用用户设置
  applySettings(settings) {
    // BGM 设置
    this.bgm.config = {
      enable: settings.bgmEnabled,
      volume: settings.bgmVolume,
      stopOnHidden: settings.pauseWhenHidden
    };
    
    // SFX 设置
    this.sfx.config = {
      enable: settings.sfxEnabled,
      volume: settings.sfxVolume
    };
    
    // 音乐播放器设置
    this.player.config = {
      enable: settings.musicEnabled,
      volume: settings.musicVolume,
      mode: settings.playMode,
      fadeIn: settings.enableFade ? 500 : 0,
      fadeOut: settings.enableFade ? 500 : 0
    };
  }
  
  // 保存到 localStorage
  saveSettings() {
    localStorage.setItem('audio-settings', JSON.stringify({
      bgm: this.bgm.config,
      sfx: this.sfx.config,
      player: this.player.config
    }));
  }
  
  // 从 localStorage 加载
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

## BGM 示例

### 游戏状态音乐

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
  
  // 动态音量控制
  setVolume(volume) {
    this.bgm.config.volume = volume;
  }
  
  // 切换静音
  toggleMute() {
    this.bgm.config.enable = !this.bgm.config.enable;
  }
}
```

### 动态音量淡入淡出

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

// 使用方法
const bgm = new BGM({ volume: 0.8 });
await bgm.play('ambient');

// 对话开始时淡入到 30%
smoothVolumeTransition(bgm, 0.3, 1000);

// 对话结束时淡出到 80%
smoothVolumeTransition(bgm, 0.8, 1000);
```

---

## SFX 示例

### UI 音效

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

// 附加到 DOM 事件
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

### 游戏音效

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
  
  // 快速连发带音调变化
  shootLaser() {
    this.sfx.play('laser', { 
      volume: 0.6,
      rate: 1 + (Math.random() * 0.2 - 0.1)
    });
  }
  
  // 分层爆炸效果
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
  
  // 基于距离的音量
  playAtDistance(soundId, distance, maxDistance = 100) {
    const volume = Math.max(0, 1 - (distance / maxDistance));
    if (volume > 0) {
      this.sfx.play(soundId, { volume });
    }
  }
}
```

---

## 音乐播放器示例

### 带 UI 的基础播放器

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
      console.error('播放错误:', error);
      this.showError('播放曲目失败');
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
    document.getElementById('track-title').textContent = meta.title || '未知';
    document.getElementById('track-artist').textContent = meta.artist || '未知';
    
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

### 播放列表管理

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
    if (!playlist) throw new Error(`播放列表 ${id} 未找到`);
    
    this.player.clear();
    this.player.addList(playlist.tracks);
    this.currentPlaylistId = id;
    
    return playlist;
  }
  
  addToPlaylist(playlistId, track) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error(`播放列表 ${playlistId} 未找到`);
    
    const music = new Music(track.url, track.metadata, track.lrcUrl);
    playlist.tracks.push(music);
    
    if (this.currentPlaylistId === playlistId) {
      this.player.add(music);
    }
  }
  
  removeFromPlaylist(playlistId, trackIndex) {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) throw new Error(`播放列表 ${playlistId} 未找到`);
    
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

## 高级模式

### 交叉淡入淡出过渡

```javascript
class CrossFadeManager {
  constructor() {
    this.bgmA = new BGM({ volume: 0 });
    this.bgmB = new BGM({ volume: 0 });
    this.currentBGM = this.bgmA;
    this.nextBGM = this.bgmB;
  }
  
  async crossFade(trackId, duration = 2000) {
    // 以 0 音量开始下一首
    this.nextBGM.config.volume = 0;
    await this.nextBGM.play(trackId);
    
    // 交叉淡入淡出
    const steps = 50;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      this.currentBGM.config.volume = 1 - progress;
      this.nextBGM.config.volume = progress;
      
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    
    // 停止旧音轨并交换
    this.currentBGM.stop();
    [this.currentBGM, this.nextBGM] = [this.nextBGM, this.currentBGM];
  }
}
```

### 音频上下文管理

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
    
    // 等待用户交互
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

## 框架集成

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

// 使用方法
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
      <h3>{currentTrack?.meta.title || '无曲目'}</h3>
      <button onClick={togglePlay}>{isPlaying ? '暂停' : '播放'}</button>
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

## 最佳实践

### 1. 始终处理用户交互

现代浏览器在播放音频前需要用户交互：

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
        // 创建静音音频以解锁
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        
        try {
          await audio.play();
          this.isUnlocked = true;
          this.audioManager = new AudioManager();
          resolve();
        } catch (e) {
          // 仍然锁定
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

### 2. 清理资源

```javascript
class Component {
  constructor() {
    this.bgm = new BGM();
    this.sfx = new SFX();
    this.player = new MusicPlayer();
  }
  
  destroy() {
    // 组件卸载时始终清理
    this.bgm.destroy();
    this.sfx.destroy();
    this.player.destroy();
  }
}
```

### 3. 优雅地处理错误

```javascript
async function playWithErrorHandling(player) {
  try {
    await player.play();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showMessage('请与页面交互以启用音频');
    } else if (error.name === 'NotSupportedError') {
      showMessage('不支持的音频格式');
    } else {
      showMessage('播放失败: ' + error.message);
    }
  }
}
```

### 4. 明智地使用配置

```javascript
// ✅ 好：单个更改使用直接属性修改
player.config.volume = 0.5;
player.config.enable = false;

// ✅ 好：多个更改使用对象赋值
player.config = {
  volume: 0.5,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500
};

// ❌ 避免：多次单独赋值
player.config = { volume: 0.5 };
player.config = { mode: PlayMode.SHUFFLE };
player.config = { fadeIn: 500 };
```

### 5. 针对移动端优化

```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const player = new MusicPlayer({
  volume: 0.8,
  preload: !isMobile,  // 移动端禁用预加载以节省带宽
  stopOnHidden: isMobile,  // 移动端标签页隐藏时暂停
  fadeIn: isMobile ? 200 : 500,  // 移动端使用更短的淡入淡出
  fadeOut: isMobile ? 200 : 500
});
```

### 6. 实现懒加载

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

### 7. 监控性能

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

## 故障排除

### 音频无法播放

1. 检查用户是否与页面交互过
2. 验证音频文件格式是否受支持
3. 检查浏览器控制台错误
4. 确保 `enable` 设置为 `true`

### 内存使用过高

1. 启用懒加载 (`preload: false`)
2. 定期清理未使用的播放列表
3. 限制并发音效实例数量
4. 完成后调用 `destroy()`

### 播放卡顿

1. 减少淡入淡出时长
2. 为下一首启用预加载
3. 使用较低质量的音频文件
4. 减少并发音频实例数量

---

更多示例和 API 详情，请参阅 [API_zh.md](API_zh.md)。
