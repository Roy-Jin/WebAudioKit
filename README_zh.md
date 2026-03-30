# WebAudioKit

[![npm version](https://img.shields.io/npm/v/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)
[![license](https://img.shields.io/npm/l/webaudiokit.svg)](https://github.com/Roy-Jin/WebAudioKit/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/webaudiokit.svg)](https://www.npmjs.com/package/webaudiokit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/webaudiokit.svg)](https://bundlephobia.com/package/webaudiokit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[English](README.md) | [中文](README_zh.md)

一个功能强大、轻量级的 JavaScript 网页音频处理库，全面支持背景音乐、音效和高级音乐播放功能。

## ✨ 特性

- 🎵 **背景音乐 (BGM)** - 无缝循环背景音频，支持淡入淡出效果
- 🔊 **音效 (SFX)** - 重叠播放音效，支持实例管理
- 🎶 **音乐播放器** - 功能完整的播放器，支持播放列表、歌词和多种播放模式
- 📱 **移动端优化** - 处理页面可见性变化和移动端音频限制
- 🎚️ **高级控制** - 音量、播放速率、淡入淡出等控制
- 📝 **歌词支持** - LRC 格式解析和实时同步
- 🔄 **播放模式** - 顺序、循环、随机和单曲循环模式
- 🚀 **性能优化** - 懒加载、预加载和高效资源管理
- 📦 **TypeScript** - 完整的 TypeScript 支持和类型定义
- 🌐 **通用性** - 支持所有现代浏览器的 Web Audio API

## 📦 安装

```bash
# npm
npm install webaudiokit

# yarn
yarn add webaudiokit

# pnpm
pnpm add webaudiokit
```

### CDN 使用

```html
<!-- ES 模块 -->
<script type="module">
  import { BGM, SFX, MusicPlayer } from 'https://unpkg.com/webaudiokit@latest/dist/index.js';
</script>

<!-- UMD (全局变量) -->
<script src="https://unpkg.com/webaudiokit@latest/dist/index.global.js"></script>
<script>
  const { BGM, SFX, MusicPlayer } = WebAudioKit;
</script>
```

## 🚀 快速开始

### 背景音乐 (BGM)

适用于环境音乐、游戏配乐和氛围音频：

```javascript
import { BGM } from 'webaudiokit';

const bgm = new BGM({
  volume: 0.7,
  loop: true,
  fadeIn: 1000,  // 1秒淡入
  fadeOut: 800,  // 0.8秒淡出
  stopOnHidden: true  // 标签页隐藏时自动暂停
});

// 加载并播放背景音乐
await bgm.load('ambient', 'music/ambient.mp3');
await bgm.load('battle', 'music/battle.mp3');

// 播放并平滑过渡
await bgm.play('ambient');

// 切换到不同音轨，带淡入淡出效果
await bgm.play('battle');
```

### 音效 (SFX)

适用于 UI 音效、游戏效果和重叠音频：

```javascript
import { SFX } from 'webaudiokit';

const sfx = new SFX({
  volume: 0.8,
  stopOnHidden: false
});

// 加载音效
await sfx.load('click', 'sounds/click.wav');
await sfx.load('explosion', 'sounds/explosion.mp3');

// 播放音效（可重叠）
await sfx.play('click');
await sfx.play('click'); // 与第一个同时播放
await sfx.play('explosion', { volume: 0.5 }); // 自定义音量

// 停止特定音效的所有实例
sfx.stop('click');

// 停止所有活跃的音效
sfx.stopAll();
```

### 音乐播放器

完整的音乐播放器，支持播放列表管理和高级功能：

```javascript
import { MusicPlayer, Music, PlayMode } from 'webaudiokit';

const player = new MusicPlayer({
  volume: 0.8,
  mode: PlayMode.SHUFFLE,
  fadeIn: 500,
  fadeOut: 500,
  stopOnHidden: false
});

// 创建音乐曲目
const song1 = new Music('songs/song1.mp3', {
  title: '精彩歌曲',
  artist: '优秀艺术家',
  album: '最佳专辑',
  cover: 'covers/song1.jpg'
});

const song2 = new Music('songs/song2.mp3', {
  title: '另一首热门',
  artist: '酷乐队',
  album: '新发行',
  cover: 'covers/song2.jpg'
}, 'lyrics/song2.lrc'); // LRC 歌词文件

// 添加到播放列表
player.add(song1);
player.add(song2);

// 或从 Meting API 数据添加
await player.addFromMeting(metingApiResponse);

// 播放控制
await player.play();        // 播放当前曲目
await player.play(0);       // 按索引播放特定曲目
await player.playNext();    // 下一首
await player.playPrev();    // 上一首
player.pause();
player.stop();

// 播放器状态
console.log(player.state);        // 'playing', 'paused', 'stopped' 等
console.log(player.currentTime);  // 当前播放位置
console.log(player.duration);     // 曲目时长
console.log(player.progress);     // 播放进度 (0-1)

// 事件处理
player.on('play', () => console.log('开始播放'));
player.on('pause', () => console.log('已暂停'));
player.on('musicchange', (music) => console.log('正在播放:', music.meta.title));
player.on('lyricchange', (lyric) => console.log('歌词:', lyric?.text));
```

## 🎯 核心类

### BGM (背景音乐)
- **用途**: 单轨背景音频，支持平滑过渡
- **特性**: 淡入淡出、循环播放、音量控制、页面可见性处理
- **使用场景**: 游戏音乐、环境音效、网站背景音频

### SFX (音效)  
- **用途**: 短音效，支持重叠播放
- **特性**: 多个同时播放、实例管理、每次播放自定义音量
- **使用场景**: UI 反馈、游戏效果、通知音效

### Music (音乐)
- **用途**: 单个音乐曲目，包含元数据
- **特性**: 元数据支持、歌词解析、懒加载
- **使用场景**: 音乐库项目、播放列表条目

### MusicPlayer (音乐播放器)
- **用途**: 完整的音乐播放器，支持播放列表管理
- **特性**: 多种播放模式、事件系统、进度跟踪、歌词同步
- **使用场景**: 音乐应用、音频播放器、流媒体界面

## 📖 文档

- **[API 参考](API_zh.md)** - 完整的 API 文档，包含所有方法和选项
- **[使用指南](USAGE_zh.md)** - 详细示例和最佳实践
- **[English Docs](README.md)** - 完整英文文档

## 🌐 浏览器支持

WebAudioKit 支持所有具有 Web Audio API 的现代浏览器：

| 浏览器  | 版本 |
|---------|------|
| Chrome  | 14+  |
| Firefox | 25+  |
| Safari  | 6+   |
| Edge    | 12+  |

## 🤝 贡献

欢迎贡献！请阅读我们的[贡献指南](CONTRIBUTING.md)了解详情。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 链接

- **[GitHub 仓库](https://github.com/Roy-Jin/WebAudioKit)** - 源代码和开发
- **[文档站点](https://WebAudioKit.pages.dev)** - 在线文档和示例
- **[npm 包](https://www.npmjs.com/package/webaudiokit)** - 包注册表
- **[报告问题](https://github.com/Roy-Jin/WebAudioKit/issues)** - 错误报告和功能请求

---

由 [Roy-Jin](https://github.com/Roy-Jin) 用 ❤️ 制作