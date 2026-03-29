# API 参考文档

WebAudioKit 完整 API 文档。

## 目录

- [BGM](#bgm)
- [SFX](#sfx)
- [Music](#music)
- [MusicPlayer](#musicplayer)
- [类型定义](#类型定义)

---

## BGM

背景音乐管理器，支持淡入淡出效果。不支持重叠播放。

### 构造函数

```typescript
new BGM(options?: BGMOptions)
```

**配置选项：**
- `volume?: number` - 初始音量 (0-1)，默认：1
- `rate?: number` - 播放速率，默认：1
- `loop?: boolean` - 循环播放，默认：true
- `fadeIn?: number` - 淡入时长（毫秒），默认：0
- `fadeOut?: number` - 淡出时长（毫秒），默认：0

### 方法

#### load(src: string): Promise\<void\>
预加载 BGM 资源。

```javascript
await bgm.load('music/background.mp3');
```

#### play(): Promise\<void\>
播放已加载的 BGM。如果配置了淡入效果会自动应用。

```javascript
await bgm.play();
```

#### pause(): void
暂停播放。

```javascript
bgm.pause();
```

#### stop(): void
停止播放并重置到开头。如果配置了淡出效果会自动应用。

```javascript
bgm.stop();
```

#### switch(src: string): Promise\<void\>
切换到新的 BGM 源，带淡入淡出过渡。

```javascript
await bgm.switch('music/new-background.mp3');
```

#### destroy(): void
清理资源并移除所有事件监听器。

```javascript
bgm.destroy();
```

### 属性

#### volume: number
获取或设置音量 (0-1)。

```javascript
bgm.volume = 0.5;
console.log(bgm.volume); // 0.5
```

#### currentTime: number
获取或设置当前播放位置（秒）。

```javascript
bgm.currentTime = 30; // 跳转到 30 秒
```

#### duration: number (只读)
获取总时长（秒）。

```javascript
console.log(bgm.duration);
```

#### paused: boolean (只读)
检查 BGM 是否暂停。

```javascript
if (bgm.paused) {
  await bgm.play();
}
```

#### loop: boolean
获取或设置循环模式。

```javascript
bgm.loop = false;
```

#### rate: number
获取或设置播放速率。

```javascript
bgm.rate = 1.5; // 1.5 倍速
```

#### loaded: boolean (只读)
检查 BGM 是否已加载。

```javascript
if (bgm.loaded) {
  await bgm.play();
}
```

### 事件

#### on(event: EventType, listener: EventListener): void
添加事件监听器。

```javascript
bgm.on('play', () => console.log('BGM 开始播放'));
bgm.on('ended', () => console.log('BGM 播放结束'));
```

#### off(event: EventType, listener: EventListener): void
移除事件监听器。

**可用事件：**
- `play` - 开始播放
- `pause` - 暂停播放
- `stop` - 停止播放
- `ended` - 自然播放结束
- `timeupdate` - 时间更新（提供 `{currentTime, duration}`）
- `volumechange` - 音量改变
- `error` - 发生错误
- `loaded` - 资源加载完成

---

## SFX

音效管理器，支持重叠播放。

### 构造函数

```typescript
new SFX(options?: SFXOptions)
```

**配置选项：**
- `volume?: number` - 初始音量 (0-1)，默认：1
- `rate?: number` - 播放速率，默认：1

### 方法

#### load(src: string): Promise\<void\>
预加载音效资源。

```javascript
await sfx.load('sounds/click.mp3');
```

#### play(): Promise\<void\>
播放音效。每次创建新实例，允许重叠播放。

```javascript
await sfx.play();
await sfx.play(); // 可以同时播放
```

#### stopAll(): void
停止所有正在播放的音效实例。

```javascript
sfx.stopAll();
```

#### destroy(): void
清理所有资源并移除事件监听器。

```javascript
sfx.destroy();
```

### 属性

#### volume: number
获取或设置音量 (0-1)。影响所有活动实例和未来实例。

```javascript
sfx.volume = 0.8;
```

#### rate: number
获取或设置播放速率。影响所有活动实例和未来实例。

```javascript
sfx.rate = 1.2;
```

#### activeCount: number (只读)
获取当前正在播放的实例数量。

```javascript
console.log(sfx.activeCount); // 3
```

#### loaded: boolean (只读)
检查音效是否已加载。

```javascript
if (sfx.loaded) {
  await sfx.play();
}
```

### 事件

与 BGM 相同的事件系统：
- `play` - 实例开始播放
- `ended` - 实例播放结束
- `stop` - 所有实例停止
- `volumechange` - 音量改变
- `error` - 发生错误
- `loaded` - 资源加载完成

---

## Music

表示单个音乐曲目，支持元数据和歌词。

### 构造函数

```typescript
new Music(src: string, metadata?: Metadata)
```

```javascript
const music = new Music('songs/song.mp3', {
  title: '歌曲标题',
  artist: '艺术家',
  album: '专辑名称',
  cover: 'covers/cover.jpg',
  lrc: '[00:00.00]歌词第一行\n[00:05.00]歌词第二行'
});
```

### 属性

#### url: string (只读)
获取音频源 URL。

```javascript
console.log(music.url);
```

#### meta: Metadata
获取或设置元数据。设置新元数据会与现有数据合并。

```javascript
music.meta = { artist: '新艺术家' };
console.log(music.meta);
```

### 方法

#### getLyrics(): Lyric[]
获取所有解析后的歌词。

```javascript
const lyrics = music.getLyrics();
// [{ time: 0, text: '歌词第一行' }, ...]
```

#### getLyricAt(time: number): Lyric | null
获取指定时间的歌词。

```javascript
const lyric = music.getLyricAt(5.5);
console.log(lyric?.text);
```

### 事件

- `lyricsloaded` - 歌词解析成功

---

## MusicPlayer

功能完整的音乐播放器，支持播放列表管理。

### 构造函数

```typescript
new MusicPlayer(options?: MusicPlayerOptions)
```

**配置选项：**
- `volume?: number` - 初始音量 (0-1)，默认：1
- `rate?: number` - 播放速率，默认：1
- `loop?: boolean` - 循环当前曲目，默认：false
- `mode?: PlayMode` - 播放模式，默认：PlayMode.SEQUENTIAL

### 播放列表管理

#### add(music: Music): void
添加音乐到播放列表。

```javascript
const music = new Music('song.mp3', { title: '歌曲' });
player.add(music);
```

#### addList(musicList: Music[]): void
批量添加多个曲目。

```javascript
player.addList([music1, music2, music3]);
```

#### addFromMeting(data: MetingData[]): Promise\<void\>
从 Meting API 格式数据添加曲目。

```javascript
await player.addFromMeting(metingApiResponse);
```

#### remove(idx: number): void
移除指定索引的曲目。

```javascript
player.remove(0);
```

#### clear(): void
清空整个播放列表。

```javascript
player.clear();
```

#### get(idx: number): Music | null
获取指定索引的曲目。

```javascript
const music = player.get(0);
```

#### getAll(): Music[]
获取播放列表中的所有曲目。

```javascript
const allMusic = player.getAll();
```

### 播放控制

#### play(idx?: number): Promise\<void\>
播放音乐。如果提供索引，播放该曲目。

```javascript
await player.play(); // 播放当前曲目
await player.play(2); // 播放索引为 2 的曲目
```

#### pause(): void
暂停播放。

```javascript
player.pause();
```

#### stop(): void
停止播放并重置位置。

```javascript
player.stop();
```

#### playNext(): Promise\<void\>
根据播放模式播放下一首。

```javascript
await player.playNext();
```

#### playPrev(): Promise\<void\>
根据播放模式播放上一首。

```javascript
await player.playPrev();
```

#### next(): Music | null
获取下一首曲目但不播放。

```javascript
const nextMusic = player.next();
```

#### prev(): Music | null
获取上一首曲目但不播放。

```javascript
const prevMusic = player.prev();
```

### 属性

#### volume: number
获取或设置音量 (0-1)。

```javascript
player.volume = 0.7;
```

#### currentTime: number
获取或设置当前播放位置（秒）。

```javascript
player.currentTime = 60;
```

#### duration: number (只读)
获取当前曲目时长。

```javascript
console.log(player.duration);
```

#### progress: number
获取或设置播放进度 (0-1)。

```javascript
player.progress = 0.5; // 跳转到 50%
```

#### paused: boolean (只读)
检查播放器是否暂停。

```javascript
if (player.paused) {
  await player.play();
}
```

#### loop: boolean
获取或设置当前曲目的循环模式。

```javascript
player.loop = true;
```

#### rate: number
获取或设置播放速率。

```javascript
player.rate = 1.25;
```

#### state: PlayState (只读)
获取当前播放器状态。

```javascript
console.log(player.state); // 'playing', 'paused', 'stopped', 'loading', 'error'
```

#### current: Music | null (只读)
获取当前播放的音乐。

```javascript
const current = player.current;
console.log(current?.meta.title);
```

#### currentIndex: number
获取或设置当前曲目索引。

```javascript
player.currentIndex = 3;
```

#### length: number (只读)
获取播放列表长度。

```javascript
console.log(player.length);
```

#### playMode: PlayMode
获取或设置播放模式。

```javascript
player.playMode = PlayMode.SHUFFLE;
```

#### lyric: Lyric | null (只读)
获取当前歌词行。

```javascript
const lyric = player.lyric;
console.log(lyric?.text);
```

### 方法

#### getLyrics(): Lyric[]
获取当前曲目的所有歌词。

```javascript
const lyrics = player.getLyrics();
```

#### destroy(): void
清理所有资源。

```javascript
player.destroy();
```

### 事件

- `play` - 开始播放
- `pause` - 暂停播放
- `stop` - 停止播放
- `ended` - 曲目播放结束
- `timeupdate` - 时间更新（提供 `{currentTime, duration}`）
- `volumechange` - 音量改变
- `error` - 发生错误
- `musicchange` - 当前曲目改变（提供 Music 对象）
- `playlistchange` - 播放列表修改
- `lyricchange` - 当前歌词行改变（提供 Lyric 对象）

---

## 类型定义

### PlayMode

```typescript
enum PlayMode {
  LOOP = 'loop',           // 循环播放整个列表
  SHUFFLE = 'shuffle',     // 随机顺序
  SINGLE = 'single',       // 单曲循环
  SEQUENTIAL = 'sequential' // 顺序播放一次
}
```

### PlayState

```typescript
enum PlayState {
  PLAYING = 'playing',   // 播放中
  PAUSED = 'paused',     // 已暂停
  STOPPED = 'stopped',   // 已停止
  LOADING = 'loading',   // 加载中
  ERROR = 'error'        // 错误
}
```

### Metadata

```typescript
interface Metadata {
  title?: string;      // 标题
  artist?: string;     // 艺术家
  album?: string;      // 专辑
  cover?: string;      // 封面图片 URL
  lrc?: string;        // LRC 格式歌词
  duration?: number;   // 时长（秒）
}
```

### Lyric

```typescript
interface Lyric {
  time: number;  // 时间（秒）
  text: string;  // 歌词文本
}
```

### MetingData

```typescript
interface MetingData {
  id: string | number;
  name: string;
  title?: string;
  artist: string;
  author?: string;
  album: string;
  pic: string;
  cover?: string;
  url: string;
  lrc: string;
  lyric?: string;
}
```
