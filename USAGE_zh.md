# 使用指南

[![npm version](https://img.shields.io/npm/v/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)

[English](USAGE.md) | [中文](USAGE_zh.md)

WebAudioKit 的全面使用指南和实用示例。

## 目录

- [安装和设置](#安装和设置)
- [BGM 示例](#bgm-示例)
- [SFX 示例](#sfx-示例)
- [音乐播放器示例](#音乐播放器示例)
- [高级模式](#高级模式)
- [集成示例](#集成示例)
- [性能优化](#性能优化)
- [故障排除](#故障排除)

---

## 安装和设置

### 基本安装

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

## BGM 示例

### 基础背景音乐

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.6,
  loop: true,
  fadeIn: 1000,
  fadeOut: 800
});

// 加载多个音轨
await bgm.load('menu', 'audio/menu-music.mp3');
await bgm.load('game', 'audio/game-music.mp3');
await bgm.load('victory', 'audio/victory-music.mp3');

// 播放并平滑过渡
await bgm.play('menu');
```
### 游戏状态音乐管理

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

### 动态音量控制

```javascript
const bgm = new BGM({ volume: 0.8 });

// 平滑音量过渡
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

// 使用方法
fadeVolume(0.3); // 淡入到 30% 音量
```

---

## SFX 示例

### UI 音效

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

// 与 DOM 事件结合使用
const ui = new UISounds();

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseenter', () => ui.playHover());
  btn.addEventListener('click', () => ui.playClick());
});
```

### 游戏音效

```javascript
class GameSFX {
  constructor() {
    this.sfx = new SFX({ 
      volume: 0.8,
      stopOnHidden: false // 标签页隐藏时继续播放
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
  
  // 快速连发效果
  shootLaser() {
    this.sfx.play('laser', { 
      volume: 0.6,
      rate: 1 + (Math.random() * 0.2 - 0.1) // 轻微音调变化
    });
  }
  
  // 重叠爆炸效果
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

---

## 音乐播放器示例

### 基础音乐播放器

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
      console.error('播放错误:', error);
      this.showErrorMessage('播放曲目失败');
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
    document.getElementById('track-title').textContent = meta.title || '未知';
    document.getElementById('track-artist').textContent = meta.artist || '未知';
    
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

### 流媒体音乐播放器

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
  
  // 从流媒体服务 API 加载
  async loadFromAPI(playlistId) {
    try {
      const response = await fetch(`/api/playlist/${playlistId}`);
      const data = await response.json();
      
      await this.player.addFromMeting(data.tracks);
      this.currentPlaylist = data;
      
      return data;
    } catch (error) {
      console.error('加载播放列表失败:', error);
      throw error;
    }
  }
  
  // Media Session API 集成
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
        title: meta.title || '未知曲目',
        artist: meta.artist || '未知艺术家',
        album: meta.album || '未知专辑',
        artwork: meta.cover ? [{ src: meta.cover }] : []
      });
    }
  }
}
```
---

## 高级模式

### 启用/禁用控制

```javascript
// 使用 enable 属性控制音频播放
const bgm = new BGM({ enable: true });
const sfx = new SFX({ enable: true });
const player = new MusicPlayer({ enable: true });

// 动态禁用/启用
function toggleAudio(enabled) {
  bgm.enable = enabled;
  sfx.enable = enabled;
  player.enable = enabled;
}

// 在设置菜单中使用
class AudioSettings {
  constructor() {
    this.bgm = new BGM();
    this.sfx = new SFX();
    this.player = new MusicPlayer();
  }
  
  setBGMEnabled(enabled) {
    this.bgm.enable = enabled;
    localStorage.setItem('bgm-enabled', enabled);
  }
  
  setSFXEnabled(enabled) {
    this.sfx.enable = enabled;
    localStorage.setItem('sfx-enabled', enabled);
  }
  
  setMusicEnabled(enabled) {
    this.player.enable = enabled;
    localStorage.setItem('music-enabled', enabled);
  }
  
  loadSettings() {
    this.bgm.enable = localStorage.getItem('bgm-enabled') !== 'false';
    this.sfx.enable = localStorage.getItem('sfx-enabled') !== 'false';
    this.player.enable = localStorage.getItem('music-enabled') !== 'false';
  }
}
```

### 动态配置更新

```javascript
// 使用 config getter/setter 动态修改配置
const player = new MusicPlayer({
  volume: 0.8,
  mode: PlayMode.SEQUENTIAL,
  fadeIn: 500
});

// 获取当前配置
const currentConfig = player.config;
console.log(currentConfig); // { volume: 0.8, mode: 'sequential', ... }

// 更新部分配置（合并方式）
player.config = {
  volume: 0.5,
  mode: PlayMode.SHUFFLE,
  fadeOut: 1000,
  stopOnHidden: true  // 动态启用页面隐藏暂停
};

// BGM 配置更新
const bgm = new BGM({ volume: 0.7, loop: true });

// 运行时修改配置
bgm.config = {
  volume: 0.5,
  fadeIn: 1500,
  fadeOut: 1000,
  stopOnHidden: true  // 动态启用页面隐藏暂停
};

// SFX 配置更新
const sfx = new SFX({ volume: 0.8 });

sfx.config = {
  volume: 0.6,
  rate: 1.2,
  stopOnHidden: false  // 动态禁用页面隐藏停止
};

// 实际应用：用户设置面板
class UserSettings {
  constructor(player) {
    this.player = player;
  }
  
  applySettings(settings) {
    this.player.config = {
      volume: settings.musicVolume,
      mode: settings.playMode,
      fadeIn: settings.enableFade ? 500 : 0,
      fadeOut: settings.enableFade ? 500 : 0,
      enable: settings.musicEnabled,
      stopOnHidden: settings.pauseWhenHidden
    };
  }
  
  saveSettings() {
    const config = this.player.config;
    localStorage.setItem('player-settings', JSON.stringify(config));
  }
  
  loadSettings() {
    const saved = localStorage.getItem('player-settings');
    if (saved) {
      this.player.config = JSON.parse(saved);
    }
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
    this.masterVolume = 1;
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    // 等待用户交互后再创建音频
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
    // SFX 音量在每次播放时应用
  }
  
  async cleanup() {
    if (this.bgm) this.bgm.destroy();
    if (this.sfx) this.sfx.destroy();
    if (this.player) this.player.destroy();
    
    this.isInitialized = false;
  }
}
```

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
    this.nextBGM.volume = 0;
    await this.nextBGM.play(trackId);
    
    // 在音轨之间交叉淡入淡出
    const steps = 50;
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      this.currentBGM.volume = 1 - progress;
      this.nextBGM.volume = progress;
      
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
    
    // 停止旧音轨并交换引用
    this.currentBGM.stop();
    [this.currentBGM, this.nextBGM] = [this.nextBGM, this.currentBGM];
  }
}
```

---

## 集成示例

### React 集成

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
    // 初始化播放器
    playerRef.current = new MusicPlayer({
      volume,
      mode: PlayMode.SHUFFLE,
      fadeIn: 300,
      fadeOut: 300
    });
    
    const player = playerRef.current;
    
    // 事件监听器
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('stop', () => setIsPlaying(false));
    
    player.on('musicchange', (music) => {
      setCurrentTrack(music);
    });
    
    player.on('timeupdate', ({ currentTime, duration }) => {
      setProgress(duration > 0 ? currentTime / duration : 0);
    });
    
    // 清理
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
      console.error('播放错误:', error);
    }
  };
  
  return (
    <div className="music-player">
      <div className="track-info">
        <h3>{currentTrack?.meta.title || '无曲目'}</h3>
        <p>{currentTrack?.meta.artist || '未知艺术家'}</p>
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

---

## 性能优化

### 1. 懒加载策略

```javascript
class OptimizedAudioManager {
  constructor() {
    this.bgm = new BGM({ preload: false }); // 不预加载所有内容
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

### 2. 内存管理

```javascript
class MemoryEfficientPlayer {
  constructor() {
    this.player = new MusicPlayer({ preload: true });
    this.maxCacheSize = 50; // 内存中保留的最大曲目数
    this.trackCache = new Map();
  }
  
  async addTrack(music) {
    // 如果缓存已满，移除最旧的曲目
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

## 故障排除

### 常见问题和解决方案

#### 1. 移动端音频无法播放

```javascript
// 解决方案：等待用户交互
class MobileAudioFix {
  constructor() {
    this.isUnlocked = false;
    this.pendingActions = [];
  }
  
  async initialize() {
    if (this.isUnlocked) return;
    
    return new Promise(resolve => {
      const unlock = async () => {
        // 创建并播放静音音频以解锁
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        
        try {
          await audio.play();
          this.isUnlocked = true;
          
          // 执行待处理的操作
          this.pendingActions.forEach(action => action());
          this.pendingActions = [];
          
          resolve();
        } catch (e) {
          // 仍然锁定，继续尝试
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

#### 2. 自动播放策略处理

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
          message: '自动播放被阻止。需要用户交互。'
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
        <h3>启用音频</h3>
        <p>点击以启用音频播放</p>
        <button style="padding: 10px 20px; font-size: 16px;">
          启用音频
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

## 最佳实践总结

1. **始终处理用户交互要求** - 现代浏览器需要用户交互才能播放音频
2. **使用适当的淡入淡出时间** - 300-1000ms 适用于大多数过渡
3. **实现适当的错误处理** - 网络问题和编解码器问题很常见
4. **清理资源** - 组件卸载时调用 `destroy()` 方法
5. **考虑移动端限制** - 较低质量的音频和较少的同时播放音效
6. **策略性预加载** - 平衡用户体验和带宽使用
7. **处理页面可见性** - 标签页隐藏/显示时暂停/恢复音频
8. **明智使用事件监听器** - 移除监听器以防止内存泄漏
9. **跨浏览器测试** - 不同浏览器和设备的音频支持有所不同
10. **提供后备方案** - 音频加载或播放失败时始终有备用计划