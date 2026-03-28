# WebAudioKit 使用指南

## 安装

```bash
npm install webaudiokit
```

## 快速开始

### 1. 初始化音频管理器

```typescript
import { AudioManager } from 'webaudiokit';

// 获取单例实例
const audioManager = AudioManager.getInstance({
  volume: 0.8,              // 全局音量
  pauseOnHidden: true,      // 页面隐藏时暂停
  muted: false              // 是否静音
});
```

### 2. 播放音效（SoundEffect）

音效可以重叠播放，播放完自动销毁。

```typescript
// 方式1：快捷播放
await audioManager.playSoundEffect('/sounds/click.mp3', {
  volume: 1,
  playbackRate: 1
});

// 方式2：创建后播放
const sound = audioManager.createSoundEffect('/sounds/explosion.mp3', {
  volume: 0.5
});
await sound.play();

// 方式3：静态方法一次性播放
import { SoundEffect } from 'webaudiokit';
await SoundEffect.playOnce('/sounds/notification.mp3');
```

### 3. 播放背景音乐（AudioBGM）

背景音乐不可重叠，支持淡入淡出效果。

```typescript
// 播放BGM
await audioManager.playBGM('/music/background.mp3', {
  volume: 0.6,
  loop: true,
  fadeInDuration: 2000,    // 2秒淡入
  fadeOutDuration: 1500    // 1.5秒淡出
});

// 切换BGM（会自动淡出当前BGM）
await audioManager.switchBGM('/music/battle.mp3', {
  volume: 0.7,
  loop: true,
  fadeInDuration: 1000
});

// 停止BGM
audioManager.stopBGM();

// 获取当前BGM
const currentBGM = audioManager.getCurrentBGM();
if (currentBGM) {
  currentBGM.pause();
  currentBGM.volume = 0.5;
}
```

### 4. 播放音乐（Music）

音乐具有完整的元数据、歌词解析等功能。

```typescript
import { Music, PlayMode } from 'webaudiokit';

// 创建音乐实例
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
});

// 播放音乐
await music.play();

// 获取当前歌词
const currentLyric = music.getCurrentLyric();
console.log(currentLyric?.text);

// 获取所有歌词
const allLyrics = music.getAllLyrics();

// 获取元数据
const metadata = music.getMetadata();
console.log(metadata.title, metadata.artist);
```

### 5. 使用播放列表（MusicPlaylist）

```typescript
import { Music, MusicPlaylist, PlayMode } from 'webaudiokit';

// 创建音乐列表
const music1 = new Music('/music/song1.mp3', {
  metadata: { title: '歌曲1', artist: '艺术家1' }
});
const music2 = new Music('/music/song2.mp3', {
  metadata: { title: '歌曲2', artist: '艺术家2' }
});

// 创建播放列表
const playlist = audioManager.createMusicPlaylist([music1, music2]);

// 设置播放模式
playlist.playMode = PlayMode.LOOP;      // 列表循环
// playlist.playMode = PlayMode.SHUFFLE;   // 随机播放
// playlist.playMode = PlayMode.SINGLE;    // 单曲循环
// playlist.playMode = PlayMode.SEQUENTIAL; // 顺序播放

// 播放当前音乐
await audioManager.playCurrentMusic();

// 下一首
await audioManager.playNextMusic();

// 上一首
await audioManager.playPreviousMusic();

// 添加音乐到列表
const music3 = new Music('/music/song3.mp3');
playlist.add(music3);

// 移除音乐
playlist.remove(0);

// 获取当前音乐
const currentMusic = playlist.getCurrentMusic();
```

### 6. 从 Meting API 加载音乐

```typescript
import { Music } from 'webaudiokit';

// Meting API 返回的数据格式
const metingData = {
  id: '123456',
  name: '歌曲名称',
  artist: '艺术家',
  album: '专辑',
  pic: 'https://example.com/cover.jpg',
  url: 'https://example.com/song.mp3',
  lrc: 'https://example.com/lyric.lrc'
};

// 从 Meting 数据创建音乐
const music = await Music.fromMetingData(metingData, {
  volume: 0.8
});

await music.play();
```

### 7. 全局控制

```typescript
// 设置全局音量
audioManager.setVolume(0.5);

// 获取全局音量
const volume = audioManager.getVolume();

// 静音/取消静音
audioManager.setMuted(true);
audioManager.setMuted(false);

// 检查是否静音
const isMuted = audioManager.isMuted();

// 停止所有音效
audioManager.stopAllSoundEffects();

// 更新配置
audioManager.updateConfig({
  volume: 0.7,
  pauseOnHidden: false
});
```

### 8. 事件监听

```typescript
const music = new Music('/music/song.mp3');

// 播放事件
music.on('play', () => {
  console.log('开始播放');
});

// 暂停事件
music.on('pause', () => {
  console.log('暂停播放');
});

// 停止事件
music.on('stop', () => {
  console.log('停止播放');
});

// 播放结束
music.on('ended', () => {
  console.log('播放结束');
});

// 时间更新
music.on('timeupdate', (data) => {
  console.log('当前时间:', data.currentTime);
  console.log('总时长:', data.duration);
});

// 音量变化
music.on('volumechange', (volume) => {
  console.log('音量:', volume);
});

// 错误
music.on('error', (error) => {
  console.error('播放错误:', error);
});

// 歌词变化
music.on('lyricchange', (lyric) => {
  console.log('当前歌词:', lyric.text);
});

// 移除事件监听
const handler = () => console.log('播放');
music.on('play', handler);
music.off('play', handler);
```

## Vue 3 示例

```vue
<template>
  <div class="music-player">
    <div class="info">
      <img :src="currentMusic?.getMetadata().cover" alt="封面" />
      <div>
        <h3>{{ currentMusic?.getMetadata().title }}</h3>
        <p>{{ currentMusic?.getMetadata().artist }}</p>
      </div>
    </div>
    
    <div class="lyric">{{ currentLyric }}</div>
    
    <div class="controls">
      <button @click="previous">上一首</button>
      <button @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</button>
      <button @click="next">下一首</button>
    </div>
    
    <div class="progress">
      <input 
        type="range" 
        :value="progress" 
        @input="seek"
        min="0" 
        max="100" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AudioManager, Music, PlayMode } from 'webaudiokit';

const audioManager = AudioManager.getInstance();
const currentMusic = ref<Music | null>(null);
const currentLyric = ref('');
const isPlaying = ref(false);
const progress = ref(0);

onMounted(async () => {
  // 创建播放列表
  const music1 = new Music('/music/song1.mp3', {
    metadata: {
      title: '歌曲1',
      artist: '艺术家1',
      cover: '/images/cover1.jpg'
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
      progress.value = (data.currentTime / data.duration) * 100;
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

onUnmounted(() => {
  audioManager.destroy();
});
</script>
```

## React 示例

```tsx
import React, { useState, useEffect } from 'react';
import { AudioManager, Music, PlayMode } from 'webaudiokit';

const MusicPlayer: React.FC = () => {
  const [audioManager] = useState(() => AudioManager.getInstance());
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  const [currentLyric, setCurrentLyric] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 初始化播放列表
    const music1 = new Music('/music/song1.mp3', {
      metadata: {
        title: '歌曲1',
        artist: '艺术家1',
        cover: '/images/cover1.jpg'
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
        setProgress((data.currentTime / data.duration) * 100);
      });
    }

    return () => {
      audioManager.destroy();
    };
  }, []);

  const togglePlay = async () => {
    if (!currentMusic) return;
    
    if (currentMusic.paused) {
      await currentMusic.play();
    } else {
      currentMusic.pause();
    }
  };

  const next = async () => {
    await audioManager.playNextMusic();
    setCurrentMusic(audioManager.getMusicPlaylist()?.getCurrentMusic() || null);
  };

  const previous = async () => {
    await audioManager.playPreviousMusic();
    setCurrentMusic(audioManager.getMusicPlaylist()?.getCurrentMusic() || null);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentMusic) return;
    currentMusic.progress = Number(e.target.value) / 100;
  };

  const metadata = currentMusic?.getMetadata();

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
        <button onClick={previous}>上一首</button>
        <button onClick={togglePlay}>{isPlaying ? '暂停' : '播放'}</button>
        <button onClick={next}>下一首</button>
      </div>
      
      <div className="progress">
        <input 
          type="range" 
          value={progress} 
          onChange={seek}
          min="0" 
          max="100" 
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
```

## API 文档

详细的 API 文档请参考 TypeScript 类型定义文件。

## 许可证

MIT
