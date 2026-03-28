# WebAudioKit

一个功能强大、易于使用的 Web 音频管理库，支持音效、背景音乐和完整的音乐播放器功能。

## ✨ 特性

- 🎵 **音效管理** - 支持重叠播放的音效系统
- 🎼 **背景音乐** - 带淡入淡出效果的 BGM 管理
- 🎧 **音乐播放器** - 完整的音乐播放功能，支持歌词、元数据
- 📝 **歌词解析** - 自动解析 LRC 格式歌词
- 🔄 **播放模式** - 支持循环、随机、单曲、顺序播放
- 🎚️ **全局控制** - 统一的音量、静音控制
- 📱 **页面可见性** - 自动处理页面隐藏时的播放状态
- 🎯 **TypeScript** - 完整的类型定义
- 🔌 **框架无关** - 支持 Vue、React 等任何框架
- 🎼 **Meting API** - 支持 Meting API 格式

## 📦 安装

```bash
npm install webaudiokit
```

## 🚀 快速开始

```typescript
import { AudioManager } from 'webaudiokit';

// 初始化管理器
const audioManager = AudioManager.getInstance({
  volume: 0.8,
  pauseOnHidden: true
});

// 播放音效
await audioManager.playSoundEffect('/sounds/click.mp3');

// 播放背景音乐
await audioManager.playBGM('/music/background.mp3', {
  loop: true,
  fadeInDuration: 2000
});

// 创建音乐播放列表
const music = new Music('/music/song.mp3', {
  metadata: {
    title: '歌曲名称',
    artist: '艺术家',
    lrc: '[00:00.00]歌词内容'
  }
});

const playlist = audioManager.createMusicPlaylist([music]);
await audioManager.playCurrentMusic();
```

## 📖 核心概念

### 1. AudioManager（音频管理器）

全局单例，管理所有音频实例和配置。

```typescript
const audioManager = AudioManager.getInstance({
  volume: 1,              // 全局音量 (0-1)
  pauseOnHidden: true,    // 页面隐藏时暂停
  muted: false            // 静音状态
});
```

### 2. SoundEffect（音效）

可重叠播放的短音频，播放完自动销毁。

```typescript
// 快捷播放
await audioManager.playSoundEffect('/sounds/click.mp3');

// 创建实例
const sound = audioManager.createSoundEffect('/sounds/explosion.mp3', {
  volume: 0.5,
  playbackRate: 1.2
});
await sound.play();
```

### 3. AudioBGM（背景音乐）

不可重叠的背景音乐，支持淡入淡出。

```typescript
await audioManager.playBGM('/music/background.mp3', {
  loop: true,
  fadeInDuration: 2000,   // 淡入时间（毫秒）
  fadeOutDuration: 1500   // 淡出时间（毫秒）
});

// 切换 BGM
await audioManager.switchBGM('/music/battle.mp3');
```

### 4. Music（音乐）

完整的音乐播放功能，包含元数据和歌词。

```typescript
const music = new Music('/music/song.mp3', {
  metadata: {
    title: '歌曲名称',
    artist: '艺术家',
    album: '专辑',
    cover: '/images/cover.jpg',
    lrc: '[00:00.00]歌词第一行\n[00:05.00]歌词第二行'
  }
});

// 监听歌词变化
music.on('lyricchange', (lyric) => {
  console.log(lyric.text);
});

await music.play();
```

### 5. MusicPlaylist（播放列表）

管理音乐列表和播放模式。

```typescript
import { PlayMode } from 'webaudiokit';

const playlist = audioManager.createMusicPlaylist([music1, music2]);

// 设置播放模式
playlist.playMode = PlayMode.LOOP;      // 列表循环
playlist.playMode = PlayMode.SHUFFLE;   // 随机播放
playlist.playMode = PlayMode.SINGLE;    // 单曲循环
playlist.playMode = PlayMode.SEQUENTIAL; // 顺序播放

// 播放控制
await audioManager.playCurrentMusic();
await audioManager.playNextMusic();
await audioManager.playPreviousMusic();
```

## 🎯 使用场景

### 游戏开发

```typescript
// 点击音效
button.addEventListener('click', () => {
  audioManager.playSoundEffect('/sounds/click.mp3');
});

// 背景音乐
await audioManager.playBGM('/music/game-bg.mp3', { loop: true });

// 战斗音乐切换
await audioManager.switchBGM('/music/battle.mp3', {
  fadeInDuration: 1000,
  fadeOutDuration: 1000
});
```

### 音乐播放器

```typescript
// 从 Meting API 加载
const music = await Music.fromMetingData(metingData);

// 创建播放列表
const playlist = audioManager.createMusicPlaylist([music]);
playlist.playMode = PlayMode.SHUFFLE;

// 监听歌词
music.on('lyricchange', (lyric) => {
  updateLyricDisplay(lyric.text);
});

// 播放控制
await audioManager.playCurrentMusic();
```

### 网页应用

```typescript
// 通知音效
function showNotification() {
  audioManager.playSoundEffect('/sounds/notification.mp3');
}

// 页面背景音乐
await audioManager.playBGM('/music/ambient.mp3', {
  loop: true,
  volume: 0.3
});

// 全局静音控制
muteButton.addEventListener('click', () => {
  const isMuted = audioManager.isMuted();
  audioManager.setMuted(!isMuted);
});
```

## 📚 详细文档

查看 [USAGE.md](./USAGE.md) 获取完整的 API 文档和示例。

## 🎨 框架集成

### Vue 3

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AudioManager } from 'webaudiokit';

const audioManager = AudioManager.getInstance();
const currentLyric = ref('');

onMounted(() => {
  // 初始化音乐播放器
});
</script>
```

### React

```tsx
import { useState, useEffect } from 'react';
import { AudioManager } from 'webaudiokit';

function MusicPlayer() {
  const [audioManager] = useState(() => AudioManager.getInstance());
  
  useEffect(() => {
    // 初始化音乐播放器
  }, []);
  
  return <div>...</div>;
}
```

## 🔧 API 概览

### AudioManager

- `getInstance(config?)` - 获取单例实例
- `setVolume(volume)` - 设置全局音量
- `setMuted(muted)` - 设置静音状态
- `playSoundEffect(src, options?)` - 播放音效
- `playBGM(src, options?)` - 播放背景音乐
- `switchBGM(src, options?)` - 切换背景音乐
- `createMusicPlaylist(musics)` - 创建播放列表
- `playCurrentMusic()` - 播放当前音乐
- `playNextMusic()` - 播放下一首
- `playPreviousMusic()` - 播放上一首

### BaseAudio（基类）

- `play()` - 播放
- `pause()` - 暂停
- `stop()` - 停止
- `volume` - 音量属性
- `currentTime` - 当前时间
- `duration` - 总时长
- `on(event, listener)` - 添加事件监听
- `off(event, listener)` - 移除事件监听

### Music

- `getCurrentLyric()` - 获取当前歌词
- `getAllLyrics()` - 获取所有歌词
- `getMetadata()` - 获取元数据
- `updateMetadata(metadata)` - 更新元数据
- `fromMetingData(data)` - 从 Meting 数据创建（静态方法）

### MusicPlaylist

- `add(music)` - 添加音乐
- `remove(index)` - 移除音乐
- `next()` - 下一首
- `previous()` - 上一首
- `playMode` - 播放模式

## 🎵 支持的事件

- `play` - 开始播放
- `pause` - 暂停
- `stop` - 停止
- `ended` - 播放结束
- `timeupdate` - 时间更新
- `volumechange` - 音量变化
- `error` - 错误
- `loaded` - 加载完成
- `lyricchange` - 歌词变化（仅 Music）

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系

- GitHub: [Roy-Jin/WebAudioKit](https://github.com/Roy-Jin/WebAudioKit)
- Issues: [GitHub Issues](https://github.com/Roy-Jin/WebAudioKit/issues)
