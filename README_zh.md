# WebAudioKit

一个轻量级、现代化的 JavaScript 网页音频管理库，支持背景音乐（BGM）、音效（SFX）和带播放列表的音乐播放器。

## 特性

- 🎵 **BGM** - 支持淡入淡出效果的背景音乐
- 🔊 **SFX** - 支持重叠播放的音效系统
- 🎼 **Music** - 带元数据和歌词的单曲管理
- 📻 **MusicPlayer** - 功能完整的音乐播放器，支持播放列表管理
- 🎯 **TypeScript** - 完整的类型定义
- 🪶 **轻量级** - 最小化依赖
- 🎨 **现代化 API** - 简洁直观的接口

## 安装

```bash
npm install webaudiokit
```

## 快速开始

```javascript
import { BGM, SFX, MusicPlayer, Music } from 'webaudiokit';

// 背景音乐
const bgm = new BGM({ fadeIn: 1000, fadeOut: 1000 });
await bgm.load('music/background.mp3');
await bgm.play();

// 音效
const sfx = new SFX();
await sfx.load('sounds/click.mp3');
await sfx.play(); // 可以同时播放多次

// 音乐播放器
const player = new MusicPlayer();
const music1 = new Music('songs/song1.mp3', {
  title: '歌曲标题',
  artist: '艺术家'
});
player.add(music1);
await player.play();
```

## 核心类

### BGM
背景音乐管理器，支持淡入淡出效果。专为单轨播放和平滑过渡设计。

### SFX
音效管理器，支持重叠播放。适用于 UI 音效和游戏音效。

### Music
表示单个音乐曲目，支持元数据和歌词。

### MusicPlayer
完整的音乐播放器，支持播放列表管理、多种播放模式和事件系统。

## 文档

- [API 参考](./API_zh.md) - 完整的 API 文档
- [使用指南](./USAGE_zh.md) - 详细的使用示例
- [English Documentation](./README.md) - 英文文档

## 浏览器支持

支持所有实现了 Web Audio API 的现代浏览器：
- Chrome/Edge 14+
- Firefox 25+
- Safari 6+

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 链接

- [GitHub 仓库](https://github.com/Roy-Jin/WebAudioKit)
- [文档网站](https://WebAudioKit.pages.dev)
- [问题反馈](https://github.com/Roy-Jin/WebAudioKit/issues)
