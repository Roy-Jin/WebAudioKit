# API 参考文档

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[English](API.md) | [中文](API_zh.md)

WebAudioKit 库的完整 API 文档。

## 目录

- [BGM 类](#bgm-类)
- [SFX 类](#sfx-类)
- [Music 类](#music-类)
- [MusicPlayer 类](#musicplayer-类)
- [类型和枚举](#类型和枚举)
- [事件](#事件)

---

## BGM 类

背景音乐管理器，支持淡入淡出效果和平滑过渡。

### 构造函数

```typescript
new BGM(options?: BGMOptions)
```

#### BGMOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `volume` | `number` | `1` | 默认音量 (0-1) |
| `rate` | `number` | `1` | 播放速率 |
| `loop` | `boolean` | `true` | 启用循环播放 |
| `fade` | `boolean` | `false` | 启用默认淡入淡出 (1000ms) |
| `fadeIn` | `number` | `0` | 淡入时长 (毫秒) |
| `fadeOut` | `number` | `0` | 淡出时长 (毫秒) |
| `stopOnHidden` | `boolean` | `false` | 页面隐藏时自动暂停 |
| `preload` | `boolean` | `false` | 预加载音频文件 |

### 方法

#### `load(id: string, src: string): Promise<void>`
使用给定 ID 加载音频文件。

```javascript
await bgm.load('menu', 'music/menu.mp3');
```

#### `play(id: string): Promise<void>`
播放指定 ID 的音频文件。如果正在播放其他音频，会自动淡出当前音频。

```javascript
await bgm.play('menu');
```

#### `pause(): void`
暂停当前播放。

#### `resume(): Promise<void>`
恢复暂停的播放，带淡入效果。

#### `stop(): void`
停止播放并重置位置。

#### `destroy(): void`
清理资源并移除事件监听器。

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `volume` | `number` | 当前音量 (0-1) |
| `rate` | `number` | 当前播放速率 |
| `loop` | `boolean` | 是否启用循环 |
| `currentTime` | `number` | 当前播放位置 (秒) |
| `duration` | `number` | 总时长 (秒) |
| `paused` | `boolean` | 是否暂停 |
| `playing` | `string \| null` | 当前播放的音轨 ID |

### 事件

```javascript
bgm.on('play', () => console.log('开始播放'));
bgm.on('pause', () => console.log('已暂停'));
bgm.on('stop', () => console.log('已停止'));
bgm.on('ended', () => console.log('播放结束'));
bgm.on('timeupdate', (data) => console.log(data.currentTime));
bgm.on('volumechange', (volume) => console.log(volume));
bgm.on('error', (error) => console.error(error));
```

---

## SFX 类

音效管理器，支持重叠播放。

### 构造函数

```typescript
new SFX(options?: SFXOptions)
```

#### SFXOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `volume` | `number` | `1` | 默认音量 (0-1) |
| `rate` | `number` | `1` | 默认播放速率 |
| `stopOnHidden` | `boolean` | `false` | 页面隐藏时停止所有音效 |
| `preload` | `boolean` | `false` | 预加载音频文件 |

### 方法

#### `load(id: string, src: string): Promise<void>`
使用给定 ID 加载音效。

```javascript
await sfx.load('click', 'sounds/click.wav');
```

#### `play(id: string, options?: SFXOptions & { src?: string }): Promise<void>`
播放音效。每次调用创建新实例，允许重叠播放。

```javascript
await sfx.play('click');
await sfx.play('click', { volume: 0.5 }); // 自定义音量
await sfx.play('newSound', { src: 'sounds/new.wav' }); // 直接指定源文件
```

#### `stop(id: string): void`
停止特定音效的所有实例。

#### `stopAll(): void`
停止所有活跃的音效实例。

#### `destroy(): void`
清理所有资源。

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `activeCount` | `number` | 当前播放的实例数量 |

---

## Music 类

表示单个音乐曲目，包含元数据和歌词。

### 构造函数

```typescript
new Music(src: string, metadata?: Metadata, lrcUrl?: string | null)
```

#### Metadata

| 属性 | 类型 | 描述 |
|------|------|------|
| `title` | `string` | 曲目标题 |
| `artist` | `string` | 艺术家名称 |
| `album` | `string` | 专辑名称 |
| `cover` | `string` | 封面图片 URL |
| `lrc` | `string` | LRC 歌词文本 |
| `duration` | `number` | 曲目时长 (秒) |

### 方法

#### `loadLyrics(): Promise<void>`
从 LRC URL 加载歌词（懒加载）。

#### `getLyrics(): Lyric[]`
获取解析后的歌词数组。

#### `getLyricAt(time: number): Lyric | null`
获取指定时间位置的歌词。

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `url` | `string` | 音频文件 URL |
| `meta` | `Metadata` | 曲目元数据 |
| `hasLyrics` | `boolean` | 是否有歌词 |
| `lyricsReady` | `boolean` | 歌词是否已加载 |

### 静态方法

#### `Music.parseLyrics(text: string): Lyric[]`
解析 LRC 格式歌词文本。

---

## MusicPlayer 类

功能完整的音乐播放器，支持播放列表管理。

### 构造函数

```typescript
new MusicPlayer(options?: MusicPlayerOptions)
```

#### MusicPlayerOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `volume` | `number` | `1` | 默认音量 (0-1) |
| `rate` | `number` | `1` | 播放速率 |
| `loop` | `boolean` | `false` | 启用曲目循环 |
| `mode` | `PlayMode` | `SEQUENTIAL` | 播放模式 |
| `fade` | `boolean` | `false` | 启用默认淡入淡出 (1000ms) |
| `fadeIn` | `number` | `0` | 淡入时长 (毫秒) |
| `fadeOut` | `number` | `0` | 淡出时长 (毫秒) |
| `stopOnHidden` | `boolean` | `false` | 页面隐藏时自动暂停 |
| `preload` | `boolean` | `true` | 预加载下一首 |

### 播放列表管理

#### `add(music: Music): void`
添加音乐曲目到播放列表。

#### `addList(musicList: Music[]): void`
添加多个曲目到播放列表。

#### `addFromMeting(data: MetingData[]): Promise<void>`
从 Meting API 响应添加曲目。

#### `remove(idx: number): void`
移除指定索引的曲目。

#### `clear(): void`
清空整个播放列表。

### 播放控制

#### `play(idx?: number): Promise<void>`
开始播放。如果提供索引，播放该曲目。

#### `pause(): void`
暂停播放。

#### `stop(): void`
停止播放并重置位置。

#### `playNext(): Promise<void>`
根据播放模式播放下一首。

#### `playPrev(): Promise<void>`
根据播放模式播放上一首。

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `volume` | `number` | 当前音量 (0-1) |
| `rate` | `number` | 当前播放速率 |
| `loop` | `boolean` | 曲目循环启用 |
| `currentTime` | `number` | 当前位置 (秒) |
| `duration` | `number` | 当前曲目时长 |
| `paused` | `boolean` | 是否暂停 |
| `state` | `PlayState` | 当前播放器状态 |
| `progress` | `number` | 播放进度 (0-1) |
| `current` | `Music \| null` | 当前加载的曲目 |
| `length` | `number` | 播放列表长度 |
| `currentIndex` | `number` | 当前曲目索引 |
| `playMode` | `PlayMode` | 当前播放模式 |
| `lyric` | `Lyric \| null` | 当前歌词行 |

### 播放列表访问

#### `get(idx: number): Music | null`
获取指定索引的曲目。

#### `getAll(): Music[]`
获取整个播放列表的副本。

#### `getLyrics(): Lyric[]`
获取当前曲目的歌词。

### 事件

```javascript
player.on('play', () => console.log('播放中'));
player.on('pause', () => console.log('已暂停'));
player.on('stop', () => console.log('已停止'));
player.on('ended', () => console.log('曲目结束'));
player.on('musicchange', (music) => console.log('曲目切换:', music));
player.on('timeupdate', (data) => console.log(data.currentTime, data.duration));
player.on('lyricchange', (lyric) => console.log('歌词:', lyric?.text));
player.on('lyricsloaded', () => console.log('歌词已加载'));
player.on('playlistchange', () => console.log('播放列表更新'));
player.on('volumechange', (volume) => console.log('音量:', volume));
player.on('error', (error) => console.error(error));
```

---

## 类型和枚举

### PlayMode

```typescript
enum PlayMode {
  LOOP = 'loop',           // 循环播放列表
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

### Lyric

```typescript
interface Lyric {
  time: number;  // 时间戳 (秒)
  text: string;  // 歌词文本
}
```

### SFXInstance

```typescript
interface SFXInstance {
  audio: HTMLAudioElement;
  id: string;
  stop(): void;
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

### EventType

```typescript
type EventType = 
  | 'play'           // 播放
  | 'pause'          // 暂停
  | 'stop'           // 停止
  | 'ended'          // 结束
  | 'timeupdate'     // 时间更新
  | 'volumechange'   // 音量变化
  | 'error'          // 错误
  | 'loaded'         // 已加载
  | 'lyricchange'    // 歌词变化
  | 'lyricsloaded'   // 歌词加载完成
  | 'musicchange'    // 音乐变化
  | 'playlistchange'; // 播放列表变化
```

---

## 事件

所有类都支持使用 `on()` 和 `off()` 方法进行事件监听：

```typescript
// 添加事件监听器
instance.on(event: EventType, listener: EventListener): void

// 移除事件监听器
instance.off(event: EventType, listener: EventListener): void

// 事件监听器函数
type EventListener = (data?: any) => void
```

### 通用事件

- **`play`** - 播放开始
- **`pause`** - 播放暂停
- **`stop`** - 播放停止
- **`ended`** - 曲目/音频结束
- **`timeupdate`** - 播放位置更新
- **`volumechange`** - 音量改变
- **`error`** - 发生错误

### MusicPlayer 特有事件

- **`musicchange`** - 当前曲目改变
- **`lyricchange`** - 当前歌词行改变
- **`lyricsloaded`** - 歌词加载完成
- **`playlistchange`** - 播放列表修改

---

## 错误处理

所有异步方法都可能抛出错误。始终使用 try-catch：

```javascript
try {
  await player.play();
} catch (error) {
  console.error('播放失败:', error);
}

// 或通过事件处理
player.on('error', (error) => {
  console.error('播放器错误:', error);
});
```

## 最佳实践

1. **始终处理错误** - 使用 try-catch 或错误事件
2. **清理资源** - 完成后调用 `destroy()`
3. **明智预加载** - 启用预加载以获得更好的用户体验，但考虑带宽
4. **处理页面可见性** - 使用 `stopOnHidden` 获得更好的移动端体验
5. **淡入淡出效果** - 使用淡入淡出实现平滑过渡
6. **事件监听器** - 组件卸载时移除监听器