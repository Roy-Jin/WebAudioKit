# WebAudioKit

一个功能强大、易于使用的 Web 音频管理库，专为现代 Web 应用设计。

[English](./README.md) | 简体中文

## ✨ 特性

- 🎵 **音效管理** - 支持重叠播放的音效系统，播放完自动销毁
- 🎼 **背景音乐** - 带淡入淡出效果的 BGM 管理，不可重叠播放
- 🎧 **音乐播放器** - 完整的音乐播放功能，支持歌词、元数据、封面等
- 📝 **歌词解析** - 自动解析 LRC 格式歌词，实时同步显示
- 🔄 **播放模式** - 支持列表循环、随机播放、单曲循环、顺序播放
- 🎚️ **全局控制** - 统一的音量、静音控制，影响所有音频
- 📱 **页面可见性** - 自动处理页面隐藏时的播放状态
- 🎯 **TypeScript** - 完整的类型定义，开发体验极佳
- 🔌 **框架无关** - 支持 Vue、React 等任何前端框架
- 🎼 **Meting API** - 原生支持 Meting API 数据格式

## 📦 安装

```bash
npm install webaudiokit
```

或使用 yarn：

```bash
yarn add webaudiokit
```

或使用 pnpm：

```bash
pnpm add webaudiokit
```

## 🚀 快速开始

```typescript
import { AudioManager, Music, PlayMode } from 'webaudiokit';

// 1. 初始化音频管理器（单例模式）
const audioManager = AudioManager.getInstance({
  volume: 0.8,              // 全局音量
  pauseOnHidden: true,      // 页面隐藏时自动暂停
  muted: false              // 是否静音
});

// 2. 播放音效（可重叠）
await audioManager.playSoundEffect('/sounds/click.mp3');

// 3. 播放背景音乐（不可重叠，支持淡入淡出）
await audioManager.playBGM('/music/background.mp3', {
  loop: true,
  fadeInDuration: 2000,     // 2秒淡入
  fadeOutDuration: 1500     // 1.5秒淡出
});

// 4. 创建音乐实例（支持歌词、元数据）
const music = new Music('/music/song.mp3', {
  metadata: {
    title: '歌曲名称',
    artist: '艺术家',
    album: '专辑名',
    cover: '/images/cover.jpg',
    lrc: '[00:00.00]第一行歌词\n[00:05.00]第二行歌词'
  }
});

// 5. 创建播放列表
const playlist = audioManager.createMusicPlaylist([music]);
playlist.playMode = PlayMode.LOOP; // 设置循环模式

// 6. 播放音乐
await audioManager.playCurrentMusic();
```

## 📖 核心概念

### 架构设计

```
AudioManager (总管理器)
├── SoundEffect (音效) - 可重叠播放
├── AudioBGM (背景音乐) - 不可重叠
└── MusicPlaylist (播放列表)
    └── Music (音乐) - 带元数据和歌词
```

### 1. AudioManager - 音频管理器

全局单例模式，统一管理所有音频实例。

```typescript
const audioManager = AudioManager.getInstance({
  volume: 1,              // 全局音量 (0-1)
  pauseOnHidden: true,    // 页面隐藏时暂停所有音频
  muted: false            // 全局静音
});

// 全局控制
audioManager.setVolume(0.5);        // 设置音量
audioManager.setMuted(true);        // 静音
audioManager.stopAllSoundEffects(); // 停止所有音效
```

### 2. SoundEffect - 音效

短音频效果，可以重叠播放，播放完自动销毁。适用于按钮点击、游戏音效等场景。

```typescript
// 方式1：快捷播放
await audioManager.playSoundEffect('/sounds/click.mp3');

// 方式2：创建后播放（可控制）
const sound = audioManager.createSoundEffect('/sounds/explosion.mp3', {
  volume: 0.5,
  playbackRate: 1.2,  // 播放速率
  loop: false         // 是否循环
});
await sound.play();

// 方式3：静态方法
import { SoundEffect } from 'webaudiokit';
await SoundEffect.playOnce('/sounds/notification.mp3');
```

### 3. AudioBGM - 背景音乐

长音频，不可重叠播放，支持淡入淡出效果。适用于游戏背景音乐、网页氛围音乐等。

```typescript
// 播放 BGM
await audioManager.playBGM('/music/background.mp3', {
  loop: true,
  volume: 0.6,
  fadeInDuration: 2000,   // 淡入时间（毫秒）
  fadeOutDuration: 1500   // 淡出时间（毫秒）
});

// 切换 BGM（自动淡出当前，淡入新的）
await audioManager.switchBGM('/music/battle.mp3', {
  loop: true,
  fadeInDuration: 1000
});

// 停止 BGM
audioManager.stopBGM();

// 获取当前 BGM 实例
const bgm = audioManager.getCurrentBGM();
if (bgm) {
  bgm.pause();
  bgm.volume = 0.5;
}
```

### 4. Music - 音乐

完整的音乐播放功能，包含元数据、歌词解析、播放状态等。

```typescript
const music = new Music('/music/song.mp3', {
  volume: 0.8,
  metadata: {
    title: '歌曲名称',
    artist: '艺术家',
    album: '专辑名',
    cover: '/images/cover.jpg',
    lrc: '[00:00.00]歌词第一行\n[00:05.00]歌词第二行'
  }
});

// 监听歌词变化
music.on('lyricchange', (lyric) => {
  console.log('当前歌词:', lyric.text);
  console.log('时间:', lyric.time);
});

// 监听播放进度
music.on('timeupdate', (data) => {
  console.log(`${data.currentTime} / ${data.duration}`);
});

// 播放控制
await music.play();
music.pause();
music.stop();

// 获取信息
const lyric = music.getCurrentLyric();  // 当前歌词
const lyrics = music.getAllLyrics();    // 所有歌词
const metadata = music.getMetadata();   // 元数据
const progress = music.progress;        // 播放进度 (0-1)
```

### 5. MusicPlaylist - 播放列表

管理音乐列表和播放模式。

```typescript
import { PlayMode } from 'webaudiokit';

// 创建播放列表
const playlist = audioManager.createMusicPlaylist([music1, music2, music3]);

// 设置播放模式
playlist.playMode = PlayMode.LOOP;       // 列表循环
playlist.playMode = PlayMode.SHUFFLE;    // 随机播放
playlist.playMode = PlayMode.SINGLE;     // 单曲循环
playlist.playMode = PlayMode.SEQUENTIAL; // 顺序播放

// 播放控制
await audioManager.playCurrentMusic();   // 播放当前
await audioManager.playNextMusic();      // 下一首
await audioManager.playPreviousMusic();  // 上一首

// 列表操作
playlist.add(newMusic);      // 添加音乐
playlist.remove(0);          // 移除音乐
playlist.index = 2;          // 跳转到指定索引
const current = playlist.getCurrentMusic(); // 获取当前音乐
```

## 🎯 使用场景

### 场景1：游戏开发

```typescript
// 初始化
const audioManager = AudioManager.getInstance();

// UI 音效
button.addEventListener('click', () => {
  audioManager.playSoundEffect('/sounds/click.mp3');
});

// 游戏音效（可重叠）
function fireWeapon() {
  audioManager.playSoundEffect('/sounds/shoot.mp3', { volume: 0.7 });
}

function explosion() {
  audioManager.playSoundEffect('/sounds/explosion.mp3', { volume: 0.9 });
}

// 背景音乐
await audioManager.playBGM('/music/game-bg.mp3', { 
  loop: true,
  volume: 0.4 
});

// 切换到战斗音乐
async function enterBattle() {
  await audioManager.switchBGM('/music/battle.mp3', {
    loop: true,
    fadeInDuration: 1000,
    fadeOutDuration: 1000
  });
}
```

### 场景2：音乐播放器

```typescript
import { Music, PlayMode } from 'webaudiokit';

// 从 Meting API 加载音乐
async function loadMusic(metingData) {
  const music = await Music.fromMetingData(metingData);
  return music;
}

// 创建播放列表
const playlist = audioManager.createMusicPlaylist([]);
playlist.playMode = PlayMode.SHUFFLE;

// 添加音乐
const music = await loadMusic(metingApiData);
playlist.add(music);

// 监听歌词
music.on('lyricchange', (lyric) => {
  updateLyricDisplay(lyric.text);
});

// 监听播放进度
music.on('timeupdate', (data) => {
  updateProgressBar(data.currentTime, data.duration);
});

// 播放控制
await audioManager.playCurrentMusic();
```

### 场景3：网页应用

```typescript
// 通知音效
function showNotification(message) {
  audioManager.playSoundEffect('/sounds/notification.mp3');
  // 显示通知...
}

// 页面背景音乐
await audioManager.playBGM('/music/ambient.mp3', {
  loop: true,
  volume: 0.2,
  fadeInDuration: 3000
});

// 全局静音控制
const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
  const isMuted = audioManager.isMuted();
  audioManager.setMuted(!isMuted);
  muteButton.textContent = isMuted ? '🔊' : '🔇';
});
```

## 🎨 框架集成示例

### Vue 3 完整示例

```vue
<template>
  <div class="music-player">
    <!-- 封面和信息 -->
    <div class="info">
      <img :src="metadata?.cover" alt="封面" />
      <div>
        <h3>{{ metadata?.title }}</h3>
        <p>{{ metadata?.artist }}</p>
      </div>
    </div>
    
    <!-- 歌词显示 -->
    <div class="lyric">{{ currentLyric }}</div>
    
    <!-- 播放控制 -->
    <div class="controls">
      <button @click="previous">⏮️</button>
      <button @click="togglePlay">{{ isPlaying ? '⏸️' : '▶️' }}</button>
      <button @click="next">⏭️</button>
    </div>
    
    <!-- 进度条 -->
    <div class="progress">
      <span>{{ formatTime(currentTime) }}</span>
      <input 
        type="range" 
        :value="progress" 
        @input="seek"
        min="0" 
        max="100" 
      />
      <span>{{ formatTime(duration) }}</span>
    </div>
    
    <!-- 音量控制 -->
    <div class="volume">
      <button @click="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>
      <input 
        type="range" 
        :value="volume * 100" 
        @input="changeVolume"
        min="0" 
        max="100" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AudioManager, Music, PlayMode } from 'webaudiokit';

const audioManager = AudioManager.getInstance();
const currentMusic = ref<Music | null>(null);
const currentLyric = ref('');
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8);
const isMuted = ref(false);

const metadata = computed(() => currentMusic.value?.getMetadata());
const progress = computed(() => 
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
);

onMounted(async () => {
  // 创建音乐列表
  const music1 = new Music('/music/song1.mp3', {
    metadata: {
      title: '歌曲1',
      artist: '艺术家1',
      cover: '/images/cover1.jpg',
      lrc: '[00:00.00]歌词...'
    }
  });
  
  const playlist = audioManager.createMusicPlaylist([music1]);
  playlist.playMode = PlayMode.LOOP;
  
  currentMusic.value = playlist.getCurrentMusic();
  
  // 监听事件
  if (currentMusic.value) {
    currentMusic.value.on('play', () => isPlaying.value = true);
    currentMusic.value.on('pause', () => isPlaying.value = false);
    currentMusic.value.on('lyricchange', (lyric) => {
      currentLyric.value = lyric?.text || '';
    });
    currentMusic.value.on('timeupdate', (data) => {
      currentTime.value = data.currentTime;
      duration.value = data.duration;
    });
  }
});

const togglePlay = async () => {
  if (!currentMusic.value) return;
  
  if (currentMusic.value.paused) {
    await currentMusic.value.play();
  } else {
    currentMusic.value.pause();
  }
};

const next = async () => {
  await audioManager.playNextMusic();
  currentMusic.value = audioManager.getMusicPlaylist()?.getCurrentMusic() || null;
};

const previous = async () => {
  await audioManager.playPreviousMusic();
  currentMusic.value = audioManager.getMusicPlaylist()?.getCurrentMusic() || null;
};

const seek = (e: Event) => {
  if (!currentMusic.value) return;
  const value = (e.target as HTMLInputElement).value;
  currentMusic.value.progress = Number(value) / 100;
};

const changeVolume = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value) / 100;
  volume.value = value;
  audioManager.setVolume(value);
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  audioManager.setMuted(isMuted.value);
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

onUnmounted(() => {
  audioManager.destroy();
});
</script>

<style scoped>
.music-player {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.info img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.lyric {
  text-align: center;
  min-height: 30px;
  margin: 20px 0;
  font-size: 16px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.controls button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.progress, .volume {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

input[type="range"] {
  flex: 1;
}
</style>
```

### React 完整示例

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { AudioManager, Music, PlayMode } from 'webaudiokit';

const MusicPlayer: React.FC = () => {
  const [audioManager] = useState(() => AudioManager.getInstance());
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  const [currentLyric, setCurrentLyric] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const metadata = currentMusic?.getMetadata();

  useEffect(() => {
    // 初始化播放列表
    const music1 = new Music('/music/song1.mp3', {
      metadata: {
        title: '歌曲1',
        artist: '艺术家1',
        cover: '/images/cover1.jpg',
        lrc: '[00:00.00]歌词...'
      }
    });

    const playlist = audioManager.createMusicPlaylist([music1]);
    playlist.playMode = PlayMode.LOOP;

    const music = playlist.getCurrentMusic();
    setCurrentMusic(music);

    // 监听事件
    if (music) {
      music.on('play', () => setIsPlaying(true));
      music.on('pause', () => setIsPlaying(false));
      music.on('lyricchange', (lyric) => {
        setCurrentLyric(lyric?.text || '');
      });
      music.on('timeupdate', (data) => {
        setCurrentTime(data.currentTime);
        setDuration(data.duration);
      });
    }

    return () => {
      audioManager.destroy();
    };
  }, [audioManager]);

  const togglePlay = useCallback(async () => {
    if (!currentMusic) return;
    
    if (currentMusic.paused) {
      await currentMusic.play();
    } else {
      currentMusic.pause();
    }
  }, [currentMusic]);

  const next = useCallback(async () => {
    await audioManager.playNextMusic();
    setCurrentMusic(audioManager.getMusicPlaylist()?.getCurrentMusic() || null);
  }, [audioManager]);

  const previous = useCallback(async () => {
    await audioManager.playPreviousMusic();
    setCurrentMusic(audioManager.getMusicPlaylist()?.getCurrentMusic() || null);
  }, [audioManager]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentMusic) return;
    currentMusic.progress = Number(e.target.value) / 100;
  }, [currentMusic]);

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 100;
    setVolume(value);
    audioManager.setVolume(value);
  }, [audioManager]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      audioManager.setMuted(!prev);
      return !prev;
    });
  }, [audioManager]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-player">
      <div className="info">
        <img src={metadata?.cover} alt="封面" />
        <div>
          <h3>{metadata?.title}</h3>
          <p>{metadata?.artist}</p>
        </div>
      </div>
      
      <div className="lyric">{currentLyric}</div>
      
      <div className="controls">
        <button onClick={previous}>⏮️</button>
        <button onClick={togglePlay}>{isPlaying ? '⏸️' : '▶️'}</button>
        <button onClick={next}>⏭️</button>
      </div>
      
      <div className="progress">
        <span>{formatTime(currentTime)}</span>
        <input 
          type="range" 
          value={progress} 
          onChange={seek}
          min="0" 
          max="100" 
        />
        <span>{formatTime(duration)}</span>
      </div>
      
      <div className="volume">
        <button onClick={toggleMute}>{isMuted ? '🔇' : '🔊'}</button>
        <input 
          type="range" 
          value={volume * 100} 
          onChange={changeVolume}
          min="0" 
          max="100" 
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
```

## 📚 完整 API 文档

详见 [USAGE.md](./USAGE.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: [Roy-Jin/WebAudioKit](https://github.com/Roy-Jin/WebAudioKit)
- Issues: [GitHub Issues](https://github.com/Roy-Jin/WebAudioKit/issues)
