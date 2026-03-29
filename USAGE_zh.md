# 使用指南

WebAudioKit 详细示例和使用模式。

## 目录

- [BGM 示例](#bgm-示例)
- [SFX 示例](#sfx-示例)
- [Music 示例](#music-示例)
- [MusicPlayer 示例](#musicplayer-示例)
- [高级模式](#高级模式)

---

## BGM 示例

### 基础用法

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.8,
  loop: true,
  fadeIn: 1000,
  fadeOut: 1000
});

// 加载并播放
await bgm.load('music/background.mp3');
await bgm.play();

// 控制播放
bgm.pause();
await bgm.play();
bgm.stop();
```

### 平滑过渡

```javascript
// 在不同 BGM 曲目之间切换
const bgm = new BGM({ fadeIn: 2000, fadeOut: 2000 });

await bgm.load('music/menu.mp3');
await bgm.play();

// 稍后切换到游戏音乐
await bgm.switch('music/gameplay.mp3');
```

### 事件处理

```javascript
const bgm = new BGM();

bgm.on('play', () => {
  console.log('BGM 开始播放');
});

bgm.on('ended', () => {
  console.log('BGM 播放结束');
});

bgm.on('error', (error) => {
  console.error('BGM 错误:', error);
});

await bgm.load('music/background.mp3');
await bgm.play();
```

---

## SFX 示例

### 基础音效

```javascript
import { SFX } from 'webaudiokit';

const clickSound = new SFX({ volume: 0.5 });
await clickSound.load('sounds/click.mp3');

// 按钮点击时播放
button.addEventListener('click', async () => {
  await clickSound.play();
});
```

### 重叠播放

```javascript
const gunSound = new SFX();
await gunSound.load('sounds/gun.mp3');

// 可以同时播放多次
await gunSound.play();
await gunSound.play();
await gunSound.play();

console.log(gunSound.activeCount); // 3
```


### 多个音效

```javascript
// 为不同声音创建多个 SFX 实例
const sounds = {
  click: new SFX(),
  hover: new SFX(),
  success: new SFX(),
  error: new SFX()
};

// 加载所有声音
await Promise.all([
  sounds.click.load('sounds/click.mp3'),
  sounds.hover.load('sounds/hover.mp3'),
  sounds.success.load('sounds/success.mp3'),
  sounds.error.load('sounds/error.mp3')
]);

// 使用它们
await sounds.click.play();
await sounds.success.play();
```

---

## Music 示例

### 创建带元数据的音乐

```javascript
import { Music } from 'webaudiokit';

const music = new Music('songs/song.mp3', {
  title: '美丽的歌曲',
  artist: '艺术家名称',
  album: '专辑名称',
  cover: 'covers/album.jpg'
});

console.log(music.meta.title); // '美丽的歌曲'
```

### 使用歌词

```javascript
const lrcContent = `
[00:00.00]第一行歌词
[00:05.50]第二行歌词
[00:10.00]第三行歌词
`;

const music = new Music('song.mp3', {
  title: '带歌词的歌曲',
  lrc: lrcContent
});

// 获取所有歌词
const lyrics = music.getLyrics();
console.log(lyrics);
// [
//   { time: 0, text: '第一行歌词' },
//   { time: 5.5, text: '第二行歌词' },
//   { time: 10, text: '第三行歌词' }
// ]

// 获取特定时间的歌词
const lyric = music.getLyricAt(6);
console.log(lyric?.text); // '第二行歌词'
```

---

## MusicPlayer 示例

### 基础播放列表

```javascript
import { MusicPlayer, Music } from 'webaudiokit';

const player = new MusicPlayer({ volume: 0.8 });

// 添加歌曲
const song1 = new Music('songs/song1.mp3', { title: '歌曲 1' });
const song2 = new Music('songs/song2.mp3', { title: '歌曲 2' });
const song3 = new Music('songs/song3.mp3', { title: '歌曲 3' });

player.addList([song1, song2, song3]);

// 播放
await player.play(); // 播放第一首
await player.playNext(); // 播放第二首
await player.playPrev(); // 返回第一首
```

### 播放模式

```javascript
import { MusicPlayer, PlayMode } from 'webaudiokit';

const player = new MusicPlayer();

// 顺序播放（默认）- 播放一次
player.playMode = PlayMode.SEQUENTIAL;

// 循环播放 - 重复播放列表
player.playMode = PlayMode.LOOP;

// 随机播放 - 随机顺序
player.playMode = PlayMode.SHUFFLE;

// 单曲循环 - 重复当前曲目
player.playMode = PlayMode.SINGLE;
```


### 事件驱动的 UI 更新

```javascript
const player = new MusicPlayer();

// 音乐改变时更新 UI
player.on('musicchange', (music) => {
  document.getElementById('title').textContent = music.meta.title;
  document.getElementById('artist').textContent = music.meta.artist;
  document.getElementById('cover').src = music.meta.cover;
});

// 更新进度条
player.on('timeupdate', ({ currentTime, duration }) => {
  const progress = (currentTime / duration) * 100;
  document.getElementById('progress').style.width = `${progress}%`;
});

// 显示歌词
player.on('lyricchange', (lyric) => {
  if (lyric) {
    document.getElementById('lyric').textContent = lyric.text;
  }
});

// 处理播放列表变化
player.on('playlistchange', () => {
  console.log(`播放列表现在有 ${player.length} 首歌`);
});
```

### 跳转和进度

```javascript
const player = new MusicPlayer();

// 跳转到特定时间
player.currentTime = 60; // 跳转到 1 分钟

// 跳转到百分比位置
player.progress = 0.5; // 跳转到 50%

// 获取当前位置
console.log(player.currentTime); // 例如：45.2
console.log(player.progress); // 例如：0.3 (30%)
console.log(player.duration); // 例如：180 (3 分钟)
```

### 从 Meting API 加载

```javascript
// 假设你有 Meting API 数据
const metingData = [
  {
    id: '123',
    name: '歌曲名称',
    artist: '艺术家',
    album: '专辑',
    pic: 'https://example.com/cover.jpg',
    url: 'https://example.com/song.mp3',
    lrc: 'https://example.com/lyrics.lrc'
  }
];

const player = new MusicPlayer();
await player.addFromMeting(metingData);
await player.play();
```

---

## 高级模式

### 游戏音频管理器

```javascript
import { BGM, SFX } from 'webaudiokit';

class GameAudio {
  constructor() {
    this.bgm = new BGM({ fadeIn: 1000, fadeOut: 1000 });
    this.sfx = {
      jump: new SFX(),
      coin: new SFX(),
      hit: new SFX(),
      gameOver: new SFX()
    };
  }

  async init() {
    await this.bgm.load('audio/game-music.mp3');
    await Promise.all([
      this.sfx.jump.load('audio/jump.mp3'),
      this.sfx.coin.load('audio/coin.mp3'),
      this.sfx.hit.load('audio/hit.mp3'),
      this.sfx.gameOver.load('audio/game-over.mp3')
    ]);
  }

  startGame() {
    this.bgm.play();
  }

  pauseGame() {
    this.bgm.pause();
  }

  playSound(name) {
    this.sfx[name]?.play();
  }

  setMasterVolume(volume) {
    this.bgm.volume = volume;
    Object.values(this.sfx).forEach(sfx => {
      sfx.volume = volume;
    });
  }
}

// 使用
const audio = new GameAudio();
await audio.init();
audio.startGame();
audio.playSound('jump');
```


### 带 UI 的音乐播放器

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

class MusicPlayerUI {
  constructor() {
    this.player = new MusicPlayer();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 播放事件
    this.player.on('play', () => {
      document.getElementById('playBtn').textContent = '暂停';
    });

    this.player.on('pause', () => {
      document.getElementById('playBtn').textContent = '播放';
    });

    // 音乐信息更新
    this.player.on('musicchange', (music) => {
      this.updateMusicInfo(music);
    });

    // 进度更新
    this.player.on('timeupdate', ({ currentTime, duration }) => {
      this.updateProgress(currentTime, duration);
    });

    // 歌词显示
    this.player.on('lyricchange', (lyric) => {
      this.updateLyric(lyric);
    });
  }

  updateMusicInfo(music) {
    document.getElementById('title').textContent = music.meta.title || '未知';
    document.getElementById('artist').textContent = music.meta.artist || '未知';
    if (music.meta.cover) {
      document.getElementById('cover').src = music.meta.cover;
    }
  }

  updateProgress(currentTime, duration) {
    const percent = (currentTime / duration) * 100;
    document.getElementById('progress').style.width = `${percent}%`;
    document.getElementById('time').textContent = 
      `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
  }

  updateLyric(lyric) {
    const lyricEl = document.getElementById('lyric');
    lyricEl.textContent = lyric ? lyric.text : '';
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async addSongs(songs) {
    const musicList = songs.map(song => 
      new Music(song.url, song.metadata)
    );
    this.player.addList(musicList);
  }

  async play() {
    if (this.player.paused) {
      await this.player.play();
    } else {
      this.player.pause();
    }
  }

  async next() {
    await this.player.playNext();
  }

  async prev() {
    await this.player.playPrev();
  }

  setVolume(volume) {
    this.player.volume = volume;
  }

  setPlayMode(mode) {
    this.player.playMode = mode;
  }
}

// 使用
const ui = new MusicPlayerUI();
await ui.addSongs([
  { url: 'song1.mp3', metadata: { title: '歌曲 1', artist: '艺术家 1' } },
  { url: 'song2.mp3', metadata: { title: '歌曲 2', artist: '艺术家 2' } }
]);
await ui.play();
```

### 预加载策略

```javascript
// 在应用启动时预加载所有音频资源
async function preloadAudio() {
  const bgm = new BGM();
  const sfx = new SFX();

  try {
    await Promise.all([
      bgm.load('music/background.mp3'),
      sfx.load('sounds/click.mp3')
    ]);
    console.log('音频预加载成功');
    return { bgm, sfx };
  } catch (error) {
    console.error('音频预加载失败:', error);
    throw error;
  }
}

// 在应用初始化时使用
const audio = await preloadAudio();
```

### 错误处理

```javascript
const player = new MusicPlayer();

player.on('error', (error) => {
  console.error('播放错误:', error);
  // 向用户显示错误消息
  showNotification('音频播放失败');
});

try {
  await player.play();
} catch (error) {
  console.error('启动播放失败:', error);
  // 适当处理错误
}
```

### 资源清理

```javascript
// 在组件卸载或页面卸载时清理
function cleanup() {
  bgm.destroy();
  sfx.destroy();
  player.destroy();
}

// 在 React 中
useEffect(() => {
  return () => cleanup();
}, []);

// 在原生 JS 中
window.addEventListener('beforeunload', cleanup);
```
