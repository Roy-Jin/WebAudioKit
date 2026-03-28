(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.WebAudioKit = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * BaseAudio - 音频基类
     * 所有音频类型的基础类
     */
    class BaseAudio {
        constructor(src) {
            this._volume = 1;
            this.eventListeners = new Map();
            this.audio = new Audio(src);
            this.setupEventListeners();
        }
        /**
         * 设置基础事件监听
         */
        setupEventListeners() {
            this.audio.addEventListener('play', () => this.emit('play'));
            this.audio.addEventListener('pause', () => this.emit('pause'));
            this.audio.addEventListener('ended', () => this.emit('ended'));
            this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', {
                currentTime: this.audio.currentTime,
                duration: this.audio.duration
            }));
            this.audio.addEventListener('error', (e) => this.emit('error', e));
            this.audio.addEventListener('loadeddata', () => this.emit('loaded'));
        }
        /**
         * 播放
         */
        play() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.audio.play();
                }
                catch (error) {
                    this.emit('error', error);
                    throw error;
                }
            });
        }
        /**
         * 暂停
         */
        pause() {
            this.audio.pause();
        }
        /**
         * 停止
         */
        stop() {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.emit('stop');
        }
        /**
         * 获取/设置音量
         */
        get volume() {
            return this._volume;
        }
        set volume(value) {
            this._volume = Math.max(0, Math.min(1, value));
            this.audio.volume = this._volume;
            this.emit('volumechange', this._volume);
        }
        /**
         * 获取/设置当前播放时间
         */
        get currentTime() {
            return this.audio.currentTime;
        }
        set currentTime(value) {
            this.audio.currentTime = value;
        }
        /**
         * 获取音频时长
         */
        get duration() {
            return this.audio.duration || 0;
        }
        /**
         * 获取播放状态
         */
        get paused() {
            return this.audio.paused;
        }
        /**
         * 获取/设置循环
         */
        get loop() {
            return this.audio.loop;
        }
        set loop(value) {
            this.audio.loop = value;
        }
        /**
         * 获取/设置播放速率
         */
        get playbackRate() {
            return this.audio.playbackRate;
        }
        set playbackRate(value) {
            this.audio.playbackRate = value;
        }
        /**
         * 添加事件监听器
         */
        on(event, listener) {
            if (!this.eventListeners.has(event)) {
                this.eventListeners.set(event, new Set());
            }
            this.eventListeners.get(event).add(listener);
        }
        /**
         * 移除事件监听器
         */
        off(event, listener) {
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                listeners.delete(listener);
            }
        }
        /**
         * 触发事件
         */
        emit(event, data) {
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                listeners.forEach(listener => listener(data));
            }
        }
        /**
         * 销毁
         */
        destroy() {
            this.stop();
            this.audio.src = '';
            this.audio.load();
            this.eventListeners.clear();
        }
    }

    /**
     * SoundEffect - 音效类
     * 可重叠播放的音频效果，播放完自动销毁
     */
    class SoundEffect extends BaseAudio {
        constructor(src, options = {}) {
            super(src);
            this.autoDestroy = true;
            // 应用配置
            if (options.volume !== undefined) {
                this.volume = options.volume;
            }
            if (options.playbackRate !== undefined) {
                this.playbackRate = options.playbackRate;
            }
            if (options.loop !== undefined) {
                this.loop = options.loop;
                this.autoDestroy = !options.loop; // 循环播放时不自动销毁
            }
            // 播放结束后自动销毁
            this.audio.addEventListener('ended', () => {
                if (this.autoDestroy) {
                    this.destroy();
                }
            });
        }
        /**
         * 创建并播放音效（静态方法）
         */
        static playOnce(src_1) {
            return __awaiter(this, arguments, void 0, function* (src, options = {}) {
                const sound = new SoundEffect(src, options);
                yield sound.play();
                return sound;
            });
        }
        /**
         * 克隆音效实例（用于重叠播放）
         */
        clone() {
            const cloned = new SoundEffect(this.audio.src, {
                volume: this.volume,
                playbackRate: this.playbackRate,
                loop: this.loop
            });
            return cloned;
        }
    }

    /**
     * AudioBGM - 背景音乐类
     * 不可重叠，只可切换，支持淡入淡出效果
     */
    class AudioBGM extends BaseAudio {
        constructor(src, options = {}) {
            var _a;
            super(src);
            this.fadeInDuration = 0;
            this.fadeOutDuration = 0;
            this.fadeInterval = null;
            this.targetVolume = 1;
            // 应用配置
            this.targetVolume = (_a = options.volume) !== null && _a !== void 0 ? _a : 1;
            this.volume = this.targetVolume;
            if (options.playbackRate !== undefined) {
                this.playbackRate = options.playbackRate;
            }
            if (options.loop !== undefined) {
                this.loop = options.loop;
            }
            if (options.fadeInDuration !== undefined) {
                this.fadeInDuration = options.fadeInDuration;
            }
            if (options.fadeOutDuration !== undefined) {
                this.fadeOutDuration = options.fadeOutDuration;
            }
        }
        /**
         * 播放（支持淡入）
         */
        play() {
            const _super = Object.create(null, {
                play: { get: () => super.play }
            });
            return __awaiter(this, void 0, void 0, function* () {
                if (this.fadeInDuration > 0) {
                    yield this.fadeIn();
                }
                else {
                    yield _super.play.call(this);
                }
            });
        }
        /**
         * 停止（支持淡出）
         */
        stop() {
            if (this.fadeOutDuration > 0) {
                this.fadeOut().then(() => super.stop());
            }
            else {
                super.stop();
            }
        }
        /**
         * 淡入效果
         */
        fadeIn() {
            const _super = Object.create(null, {
                play: { get: () => super.play }
            });
            return __awaiter(this, void 0, void 0, function* () {
                this.clearFade();
                const startVolume = 0;
                this.audio.volume = startVolume;
                yield _super.play.call(this);
                return new Promise((resolve) => {
                    const step = (this.targetVolume - startVolume) / (this.fadeInDuration / 50);
                    let currentVolume = startVolume;
                    this.fadeInterval = window.setInterval(() => {
                        currentVolume += step;
                        if (currentVolume >= this.targetVolume) {
                            this.audio.volume = this.targetVolume;
                            this.clearFade();
                            resolve();
                        }
                        else {
                            this.audio.volume = currentVolume;
                        }
                    }, 50);
                });
            });
        }
        /**
         * 淡出效果
         */
        fadeOut() {
            return __awaiter(this, void 0, void 0, function* () {
                this.clearFade();
                const startVolume = this.audio.volume;
                return new Promise((resolve) => {
                    const step = startVolume / (this.fadeOutDuration / 50);
                    let currentVolume = startVolume;
                    this.fadeInterval = window.setInterval(() => {
                        currentVolume -= step;
                        if (currentVolume <= 0) {
                            this.audio.volume = 0;
                            this.clearFade();
                            resolve();
                        }
                        else {
                            this.audio.volume = currentVolume;
                        }
                    }, 50);
                });
            });
        }
        /**
         * 清除淡入淡出定时器
         */
        clearFade() {
            if (this.fadeInterval !== null) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
        }
        /**
         * 切换到新的BGM
         */
        switchTo(newBGM) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.fadeOutDuration > 0) {
                    yield this.fadeOut();
                }
                this.stop();
                yield newBGM.play();
            });
        }
        /**
         * 销毁
         */
        destroy() {
            this.clearFade();
            super.destroy();
        }
    }

    /**
     * WebAudioKit - Type Definitions
     * 类型定义
     */
    /**
     * 播放模式
     */
    exports.PlayMode = void 0;
    (function (PlayMode) {
        /** 列表循环 */
        PlayMode["LOOP"] = "loop";
        /** 随机播放 */
        PlayMode["SHUFFLE"] = "shuffle";
        /** 单曲循环 */
        PlayMode["SINGLE"] = "single";
        /** 顺序播放 */
        PlayMode["SEQUENTIAL"] = "sequential";
    })(exports.PlayMode || (exports.PlayMode = {}));
    /**
     * 播放状态
     */
    exports.PlayState = void 0;
    (function (PlayState) {
        /** 播放中 */
        PlayState["PLAYING"] = "playing";
        /** 暂停 */
        PlayState["PAUSED"] = "paused";
        /** 停止 */
        PlayState["STOPPED"] = "stopped";
        /** 加载中 */
        PlayState["LOADING"] = "loading";
        /** 错误 */
        PlayState["ERROR"] = "error";
    })(exports.PlayState || (exports.PlayState = {}));

    /**
     * MusicPlaylist - 音乐播放列表
     * 管理音乐列表和播放模式
     */
    class MusicPlaylist {
        constructor(musics = []) {
            this.playlist = [];
            this.currentIndex = -1;
            this._playMode = exports.PlayMode.SEQUENTIAL;
            this.shuffleIndices = [];
            this.playlist = musics;
            if (musics.length > 0) {
                this.currentIndex = 0;
            }
        }
        /**
         * 添加音乐
         */
        add(music) {
            this.playlist.push(music);
            if (this.currentIndex === -1) {
                this.currentIndex = 0;
            }
            this.updateShuffleIndices();
        }
        /**
         * 移除音乐
         */
        remove(index) {
            if (index >= 0 && index < this.playlist.length) {
                this.playlist.splice(index, 1);
                if (this.currentIndex >= this.playlist.length) {
                    this.currentIndex = this.playlist.length - 1;
                }
                this.updateShuffleIndices();
            }
        }
        /**
         * 清空播放列表
         */
        clear() {
            this.playlist = [];
            this.currentIndex = -1;
            this.shuffleIndices = [];
        }
        /**
         * 获取当前音乐
         */
        getCurrentMusic() {
            if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
                return this.playlist[this.currentIndex];
            }
            return null;
        }
        /**
         * 获取指定索引的音乐
         */
        getMusic(index) {
            if (index >= 0 && index < this.playlist.length) {
                return this.playlist[index];
            }
            return null;
        }
        /**
         * 获取所有音乐
         */
        getAllMusic() {
            return [...this.playlist];
        }
        /**
         * 获取播放列表长度
         */
        get length() {
            return this.playlist.length;
        }
        /**
         * 获取当前索引
         */
        get index() {
            return this.currentIndex;
        }
        /**
         * 设置当前索引
         */
        set index(value) {
            if (value >= 0 && value < this.playlist.length) {
                this.currentIndex = value;
            }
        }
        /**
         * 获取/设置播放模式
         */
        get playMode() {
            return this._playMode;
        }
        set playMode(mode) {
            this._playMode = mode;
            if (mode === exports.PlayMode.SHUFFLE) {
                this.updateShuffleIndices();
            }
        }
        /**
         * 下一首
         */
        next() {
            if (this.playlist.length === 0)
                return null;
            switch (this._playMode) {
                case exports.PlayMode.SINGLE:
                    // 单曲循环，返回当前歌曲
                    return this.getCurrentMusic();
                case exports.PlayMode.SHUFFLE:
                    // 随机播放
                    const currentShuffleIndex = this.shuffleIndices.indexOf(this.currentIndex);
                    const nextShuffleIndex = (currentShuffleIndex + 1) % this.shuffleIndices.length;
                    this.currentIndex = this.shuffleIndices[nextShuffleIndex];
                    break;
                case exports.PlayMode.LOOP:
                    // 列表循环
                    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
                    break;
                case exports.PlayMode.SEQUENTIAL:
                    // 顺序播放
                    if (this.currentIndex < this.playlist.length - 1) {
                        this.currentIndex++;
                    }
                    else {
                        return null; // 播放完毕
                    }
                    break;
            }
            return this.getCurrentMusic();
        }
        /**
         * 上一首
         */
        previous() {
            if (this.playlist.length === 0)
                return null;
            switch (this._playMode) {
                case exports.PlayMode.SINGLE:
                    // 单曲循环，返回当前歌曲
                    return this.getCurrentMusic();
                case exports.PlayMode.SHUFFLE:
                    // 随机播放
                    const currentShuffleIndex = this.shuffleIndices.indexOf(this.currentIndex);
                    const prevShuffleIndex = currentShuffleIndex === 0
                        ? this.shuffleIndices.length - 1
                        : currentShuffleIndex - 1;
                    this.currentIndex = this.shuffleIndices[prevShuffleIndex];
                    break;
                case exports.PlayMode.LOOP:
                    // 列表循环
                    this.currentIndex = this.currentIndex === 0
                        ? this.playlist.length - 1
                        : this.currentIndex - 1;
                    break;
                case exports.PlayMode.SEQUENTIAL:
                    // 顺序播放
                    if (this.currentIndex > 0) {
                        this.currentIndex--;
                    }
                    else {
                        return null;
                    }
                    break;
            }
            return this.getCurrentMusic();
        }
        /**
         * 更新随机播放索引
         */
        updateShuffleIndices() {
            this.shuffleIndices = Array.from({ length: this.playlist.length }, (_, i) => i);
            // Fisher-Yates 洗牌算法
            for (let i = this.shuffleIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.shuffleIndices[i], this.shuffleIndices[j]] =
                    [this.shuffleIndices[j], this.shuffleIndices[i]];
            }
        }
    }

    /**
     * AudioManager - 音频管理器
     * 管理所有音频实例和全局配置
     */
    class AudioManager {
        constructor(config = {}) {
            this.config = {
                volume: 1,
                pauseOnHidden: true,
                muted: false
            };
            this.soundEffects = new Set();
            this.currentBGM = null;
            this.musicPlaylist = null;
            this.visibilityChangeHandler = null;
            this.updateConfig(config);
            this.setupVisibilityHandler();
        }
        /**
         * 获取单例实例
         */
        static getInstance(config) {
            if (!AudioManager.instance) {
                AudioManager.instance = new AudioManager(config);
            }
            return AudioManager.instance;
        }
        /**
         * 更新配置
         */
        updateConfig(config) {
            this.config = Object.assign(Object.assign({}, this.config), config);
            // 应用全局音量
            if (config.volume !== undefined) {
                this.applyGlobalVolume();
            }
            // 应用静音状态
            if (config.muted !== undefined) {
                this.applyMutedState();
            }
        }
        /**
         * 获取配置
         */
        getConfig() {
            return Object.assign({}, this.config);
        }
        /**
         * 设置全局音量
         */
        setVolume(volume) {
            this.config.volume = Math.max(0, Math.min(1, volume));
            this.applyGlobalVolume();
        }
        /**
         * 获取全局音量
         */
        getVolume() {
            return this.config.volume;
        }
        /**
         * 设置静音
         */
        setMuted(muted) {
            this.config.muted = muted;
            this.applyMutedState();
        }
        /**
         * 获取静音状态
         */
        isMuted() {
            return this.config.muted;
        }
        /**
         * 应用全局音量
         */
        applyGlobalVolume() {
            // 应用到所有音效
            this.soundEffects.forEach(sound => {
                sound.volume = this.config.volume;
            });
            // 应用到BGM
            if (this.currentBGM) {
                this.currentBGM.volume = this.config.volume;
            }
            // 应用到音乐播放列表
            if (this.musicPlaylist) {
                const currentMusic = this.musicPlaylist.getCurrentMusic();
                if (currentMusic) {
                    currentMusic.volume = this.config.volume;
                }
            }
        }
        /**
         * 应用静音状态
         */
        applyMutedState() {
            const volume = this.config.muted ? 0 : this.config.volume;
            this.soundEffects.forEach(sound => {
                sound.volume = volume;
            });
            if (this.currentBGM) {
                this.currentBGM.volume = volume;
            }
            if (this.musicPlaylist) {
                const currentMusic = this.musicPlaylist.getCurrentMusic();
                if (currentMusic) {
                    currentMusic.volume = volume;
                }
            }
        }
        /**
         * 创建音效
         */
        createSoundEffect(src, options = {}) {
            var _a;
            const sound = new SoundEffect(src, Object.assign(Object.assign({}, options), { volume: (_a = options.volume) !== null && _a !== void 0 ? _a : this.config.volume }));
            this.soundEffects.add(sound);
            // 音效结束后从集合中移除
            sound.on('ended', () => {
                this.soundEffects.delete(sound);
            });
            return sound;
        }
        /**
         * 播放音效（快捷方法）
         */
        playSoundEffect(src_1) {
            return __awaiter(this, arguments, void 0, function* (src, options = {}) {
                const sound = this.createSoundEffect(src, options);
                yield sound.play();
                return sound;
            });
        }
        /**
         * 停止所有音效
         */
        stopAllSoundEffects() {
            this.soundEffects.forEach(sound => sound.stop());
            this.soundEffects.clear();
        }
        /**
         * 创建BGM
         */
        createBGM(src, options = {}) {
            var _a;
            const bgm = new AudioBGM(src, Object.assign(Object.assign({}, options), { volume: (_a = options.volume) !== null && _a !== void 0 ? _a : this.config.volume }));
            return bgm;
        }
        /**
         * 播放BGM
         */
        playBGM(src_1) {
            return __awaiter(this, arguments, void 0, function* (src, options = {}) {
                // 停止当前BGM
                if (this.currentBGM) {
                    this.currentBGM.stop();
                }
                const bgm = this.createBGM(src, options);
                this.currentBGM = bgm;
                yield bgm.play();
                return bgm;
            });
        }
        /**
         * 切换BGM
         */
        switchBGM(src_1) {
            return __awaiter(this, arguments, void 0, function* (src, options = {}) {
                const newBGM = this.createBGM(src, options);
                if (this.currentBGM) {
                    yield this.currentBGM.switchTo(newBGM);
                }
                else {
                    yield newBGM.play();
                }
                this.currentBGM = newBGM;
                return newBGM;
            });
        }
        /**
         * 停止BGM
         */
        stopBGM() {
            if (this.currentBGM) {
                this.currentBGM.stop();
                this.currentBGM = null;
            }
        }
        /**
         * 获取当前BGM
         */
        getCurrentBGM() {
            return this.currentBGM;
        }
        /**
         * 创建音乐播放列表
         */
        createMusicPlaylist(musics = []) {
            this.musicPlaylist = new MusicPlaylist(musics);
            return this.musicPlaylist;
        }
        /**
         * 获取音乐播放列表
         */
        getMusicPlaylist() {
            return this.musicPlaylist;
        }
        /**
         * 播放音乐播放列表中的当前音乐
         */
        playCurrentMusic() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.musicPlaylist)
                    return;
                const music = this.musicPlaylist.getCurrentMusic();
                if (music) {
                    music.volume = this.config.muted ? 0 : this.config.volume;
                    yield music.play();
                }
            });
        }
        /**
         * 播放下一首音乐
         */
        playNextMusic() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.musicPlaylist)
                    return;
                const currentMusic = this.musicPlaylist.getCurrentMusic();
                if (currentMusic) {
                    currentMusic.stop();
                }
                const nextMusic = this.musicPlaylist.next();
                if (nextMusic) {
                    nextMusic.volume = this.config.muted ? 0 : this.config.volume;
                    yield nextMusic.play();
                }
            });
        }
        /**
         * 播放上一首音乐
         */
        playPreviousMusic() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.musicPlaylist)
                    return;
                const currentMusic = this.musicPlaylist.getCurrentMusic();
                if (currentMusic) {
                    currentMusic.stop();
                }
                const prevMusic = this.musicPlaylist.previous();
                if (prevMusic) {
                    prevMusic.volume = this.config.muted ? 0 : this.config.volume;
                    yield prevMusic.play();
                }
            });
        }
        /**
         * 设置音乐播放模式
         */
        setMusicPlayMode(mode) {
            if (this.musicPlaylist) {
                this.musicPlaylist.playMode = mode;
            }
        }
        /**
         * 设置页面可见性处理
         */
        setupVisibilityHandler() {
            this.visibilityChangeHandler = () => {
                if (!this.config.pauseOnHidden)
                    return;
                if (document.hidden) {
                    // 页面隐藏时暂停所有音频
                    this.soundEffects.forEach(sound => {
                        if (!sound.paused) {
                            sound.pause();
                            sound._wasPlayingBeforeHidden = true;
                        }
                    });
                    if (this.currentBGM && !this.currentBGM.paused) {
                        this.currentBGM.pause();
                        this.currentBGM._wasPlayingBeforeHidden = true;
                    }
                    if (this.musicPlaylist) {
                        const music = this.musicPlaylist.getCurrentMusic();
                        if (music && !music.paused) {
                            music.pause();
                            music._wasPlayingBeforeHidden = true;
                        }
                    }
                }
                else {
                    // 页面显示时恢复播放
                    this.soundEffects.forEach(sound => {
                        if (sound._wasPlayingBeforeHidden) {
                            sound.play();
                            delete sound._wasPlayingBeforeHidden;
                        }
                    });
                    if (this.currentBGM && this.currentBGM._wasPlayingBeforeHidden) {
                        this.currentBGM.play();
                        delete this.currentBGM._wasPlayingBeforeHidden;
                    }
                    if (this.musicPlaylist) {
                        const music = this.musicPlaylist.getCurrentMusic();
                        if (music && music._wasPlayingBeforeHidden) {
                            music.play();
                            delete music._wasPlayingBeforeHidden;
                        }
                    }
                }
            };
            document.addEventListener('visibilitychange', this.visibilityChangeHandler);
        }
        /**
         * 销毁管理器
         */
        destroy() {
            // 停止所有音效
            this.stopAllSoundEffects();
            // 停止BGM
            this.stopBGM();
            // 停止音乐
            if (this.musicPlaylist) {
                const music = this.musicPlaylist.getCurrentMusic();
                if (music) {
                    music.stop();
                }
            }
            // 移除事件监听
            if (this.visibilityChangeHandler) {
                document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
            }
            AudioManager.instance = null;
        }
    }
    AudioManager.instance = null;

    // match `[12:30.1][12:30.2]`
    const SQUARE_TAGS_REGEXP = /^(?:\s*\[[^\]]+\])+/;
    // match `ti: The Title`
    const INFO_REGEXP = /^\s*(\w+)\s*:(.*)$/;
    // match `512:34.1`
    const TIME_REGEXP = /^\s*(\d+)\s*:\s*(\d+(\s*[.:]\s*\d+)?)\s*$/;
    // match `<12:30.1> word` (A2 extension) | `[12:30.1] word` (Foobar2000)
    const ENHANCED_TAG_WORD_REGEXP = /[<[](\d+:\d+(?:\.\d+)?)[>\]]([^[<]*)/;
    var LineType;
    (function (LineType) {
        LineType["INVALID"] = "INVALID";
        LineType["INFO"] = "INFO";
        LineType["TIME"] = "TIME";
    })(LineType || (LineType = {}));
    function parseSquareTags(line) {
        line = line.trim();
        const matches = SQUARE_TAGS_REGEXP.exec(line);
        if (matches === null)
            return null;
        const tag = matches[0];
        const content = line.slice(tag.length);
        return {
            tags: tag.slice(1, -1).split(/\]\s*\[/),
            rawContent: content,
        };
    }
    function parseTimestamp(str) {
        var _a, _b;
        const matches = TIME_REGEXP.exec(str);
        if (!matches)
            return null;
        const minuteStr = (_a = matches[1]) !== null && _a !== void 0 ? _a : '0';
        const secondStr = (_b = matches[2]) !== null && _b !== void 0 ? _b : '0';
        const minutes = parseFloat(minuteStr);
        const seconds = parseFloat(secondStr.replace(/\s+/g, '').replace(':', '.'));
        return minutes * 60 + seconds;
    }
    function parseEnhancedWords(timestamps, rawContent) {
        const wordTimestamps = [];
        let stripContent = '';
        let stripIndex = 0;
        const pushContent = (timestamp, wordContent) => {
            if (!wordContent.trim())
                return;
            if (stripContent.endsWith(' ') && wordContent.startsWith(' ')) {
                wordContent = wordContent.trimStart();
            }
            stripContent += wordContent;
            wordTimestamps.push({
                timestamp,
                content: wordContent,
            });
        };
        const firstTimestamp = timestamps[timestamps.length - 1];
        if (!firstTimestamp)
            return null;
        const firstMatches = ENHANCED_TAG_WORD_REGEXP.exec(rawContent);
        const firstContent = firstMatches
            ? rawContent.slice(0, firstMatches.index)
            : rawContent;
        pushContent(firstTimestamp, firstContent);
        if (firstMatches)
            while (stripIndex < rawContent.length) {
                const wordMatches = ENHANCED_TAG_WORD_REGEXP.exec(rawContent.slice(stripIndex));
                if (!wordMatches)
                    break;
                stripIndex += wordMatches.index + wordMatches[0].length;
                const timestamp = parseTimestamp(wordMatches[1]);
                if (timestamp === null)
                    continue;
                const wordContent = wordMatches[2];
                pushContent(timestamp, wordContent);
            }
        return {
            type: LineType.TIME,
            timestamps,
            content: stripContent.trim(),
            rawContent,
            wordTimestamps,
        };
    }
    function parseTime(tags, rawContent, { enhanced = true } = {}) {
        const timestamps = tags
            .map((tag) => parseTimestamp(tag))
            .filter((it) => it !== null);
        rawContent = rawContent.trim();
        if (enhanced) {
            const parsedWords = parseEnhancedWords(timestamps, rawContent);
            if (parsedWords)
                return parsedWords;
        }
        return {
            type: LineType.TIME,
            timestamps,
            rawContent,
            content: rawContent,
        };
    }
    function parseInfo(tag) {
        var _a, _b;
        const matches = INFO_REGEXP.exec(tag);
        if (!matches)
            return null;
        const key = (_a = matches[1]) !== null && _a !== void 0 ? _a : '';
        const value = (_b = matches[2]) !== null && _b !== void 0 ? _b : '';
        return {
            type: LineType.INFO,
            key: key.trim(),
            value: value.trim(),
        };
    }
    const parseLineInner = (line, options) => {
        const parsedTags = parseSquareTags(line);
        if (!parsedTags)
            return null;
        const { tags, rawContent } = parsedTags;
        const firstTag = tags[0];
        if (!firstTag)
            return null;
        if (TIME_REGEXP.test(firstTag)) {
            return parseTime(tags, rawContent, options);
        }
        else {
            return parseInfo(firstTag);
        }
    };
    /**
     * line parse lrc of timestamp
     * @example
     * const lp = parseLine('[ti: Song title]')
     * lp.type === LineParser.TYPE.INFO
     * lp.key === 'ti'
     * lp.value === 'Song title'
     *
     * const lp = parseLine('[10:10.10]hello')
     * lp.type === LineParser.TYPE.TIME
     * lp.timestamps === [10*60+10.10]
     * lp.content === 'hello'
     *
     * const lp = parseLine('[10:10.10] <10:10.12> hello <10:11.02> world')
     * lp.type === LineParser.TYPE.TIME
     * lp.timestamps === [10*60+10.10]
     * lp.content === 'hello world'
     * lp.wordTimestamps === [
     *  { timestamp: 10*60+10.12, content: 'hello' },
     *  { timestamp: 10*60+11.02, content: 'world' }
     * ]
     */
    function parseLine(line, options) {
        const result = parseLineInner(line, options);
        return result
            ? result
            : {
                type: LineType.INVALID,
            };
    }

    function padStartZero2(num) {
        return num.toString().padStart(2, '0');
    }
    /**
     * get lrc time string
     * @example
     * Lrc.timestampToString(143.54)
     * // return '02:23.54':
     * @param timestamp second timestamp
     */
    function timestampToString(timestamp) {
        const minutes = Math.floor(timestamp / 60);
        const secondsFraction = timestamp % 60;
        const seconds = Math.floor(secondsFraction);
        const fraction = Math.round((secondsFraction - seconds) * 100);
        return `${padStartZero2(minutes)}:${padStartZero2(seconds)}.${fraction.toString().padEnd(2, '0')}`;
    }
    class Lrc {
        constructor() {
            this.info = {};
            this.lyrics = [];
            this.plain = '';
        }
        /**
         * parse lrc text and return a Lrc object
         */
        static parse(text, options) {
            const lyrics = [];
            const info = {};
            let plain = '';
            const lines = text.split(/\r\n|[\n\r]/g).map((line) => {
                return parseLine(line, options);
            });
            for (const line of lines) {
                switch (line.type) {
                    case LineType.INFO:
                        info[line.key] = line.value;
                        break;
                    case LineType.TIME:
                        for (const timestamp of line.timestamps) {
                            lyrics.push({
                                timestamp,
                                wordTimestamps: line.wordTimestamps,
                                rawContent: line.rawContent,
                                content: line.content,
                            });
                            plain += `${line.content}\n`;
                        }
                        break;
                }
            }
            const lrc = new this();
            lrc.lyrics = lyrics;
            lrc.info = info;
            lrc.plain = plain;
            return lrc;
        }
        offset(offsetTime) {
            for (const lyric of this.lyrics) {
                lyric.timestamp += offsetTime;
                if (lyric.timestamp < 0) {
                    lyric.timestamp = 0;
                }
            }
        }
        clone() {
            function clonePlainObject(obj) {
                return JSON.parse(JSON.stringify(obj));
            }
            const lrc = new Lrc();
            lrc.info = clonePlainObject(this.info);
            lrc.lyrics = clonePlainObject(this.lyrics);
            return lrc;
        }
        /**
         * get lrc text
         * @param opts.combine lyrics combine by same content
         * @param opts.sort lyrics sort by timestamp
         * @param opts.lineFormat newline format
         */
        toString({ combine = true, lineFormat = '\r\n', sort = true, } = {}) {
            const lines = [];
            // generate info
            for (const [key, value] of Object.entries(this.info)) {
                lines.push(`[${key}:${value}]`);
            }
            if (combine) {
                const lyricsMap = new Map();
                const lyricsList = [];
                // uniqueness
                for (const lyric of this.lyrics) {
                    const existLyric = lyricsMap.get(lyric.rawContent);
                    if (existLyric) {
                        existLyric[0].push(lyric.timestamp);
                    }
                    else {
                        lyricsMap.set(lyric.rawContent, [
                            [lyric.timestamp],
                            lyric.rawContent,
                        ]);
                    }
                }
                // sorted
                for (const [content, value] of lyricsMap.entries()) {
                    lyricsList.push({
                        timestamps: value[0],
                        rawContent: value[1],
                        content,
                    });
                }
                if (sort) {
                    lyricsList.sort((a, b) => { var _a, _b; return ((_a = a.timestamps[0]) !== null && _a !== void 0 ? _a : 0) - ((_b = b.timestamps[0]) !== null && _b !== void 0 ? _b : 0); });
                }
                // generate lyrics
                for (const lyric of lyricsList) {
                    lines.push(`[${lyric.timestamps
                    .map((timestamp) => timestampToString(timestamp))
                    .join('][')}]${lyric.rawContent || ''}`);
                }
            }
            else {
                for (const lyric of this.lyrics) {
                    lines.push(`[${timestampToString(lyric.timestamp)}]${lyric.content || ''}`);
                }
            }
            return lines.join(lineFormat);
        }
    }

    /**
     * Music - 音乐类
     * 具有完整元数据、歌词解析、播放列表等功能的音乐播放器
     */
    class Music extends BaseAudio {
        constructor(src, options = {}) {
            super(src);
            this.lyrics = [];
            this.currentLyricIndex = -1;
            this._state = exports.PlayState.STOPPED;
            this.metadata = options.metadata || {};
            // 应用配置
            if (options.volume !== undefined) {
                this.volume = options.volume;
            }
            if (options.playbackRate !== undefined) {
                this.playbackRate = options.playbackRate;
            }
            if (options.loop !== undefined) {
                this.loop = options.loop;
            }
            // 解析歌词
            if (this.metadata.lrc) {
                this.parseLyrics(this.metadata.lrc);
            }
            // 监听时间更新以同步歌词
            this.on('timeupdate', () => this.updateCurrentLyric());
            this.on('play', () => this._state = exports.PlayState.PLAYING);
            this.on('pause', () => this._state = exports.PlayState.PAUSED);
            this.on('stop', () => this._state = exports.PlayState.STOPPED);
            this.on('error', () => this._state = exports.PlayState.ERROR);
        }
        /**
         * 从Meting API数据创建音乐实例
         */
        static fromMetingData(data_1) {
            return __awaiter(this, arguments, void 0, function* (data, options = {}) {
                const metadata = {
                    title: data.name,
                    artist: data.artist,
                    album: data.album,
                    cover: data.pic
                };
                // 如果有歌词URL，获取歌词
                if (data.lrc) {
                    try {
                        const response = yield fetch(data.lrc);
                        metadata.lrc = yield response.text();
                    }
                    catch (error) {
                        console.warn('Failed to fetch lyrics:', error);
                    }
                }
                return new Music(data.url, Object.assign(Object.assign({}, options), { metadata }));
            });
        }
        /**
         * 解析LRC歌词
         */
        parseLyrics(lrcText) {
            try {
                const lrc = Lrc.parse(lrcText);
                this.lyrics = lrc.lyrics.map(line => ({
                    time: line.timestamp / 1000, // 转换为秒
                    text: line.content
                }));
            }
            catch (error) {
                console.warn('Failed to parse lyrics:', error);
                this.lyrics = [];
            }
        }
        /**
         * 更新当前歌词
         */
        updateCurrentLyric() {
            if (this.lyrics.length === 0)
                return;
            const currentTime = this.currentTime;
            let newIndex = -1;
            for (let i = 0; i < this.lyrics.length; i++) {
                if (currentTime >= this.lyrics[i].time) {
                    newIndex = i;
                }
                else {
                    break;
                }
            }
            if (newIndex !== this.currentLyricIndex) {
                this.currentLyricIndex = newIndex;
                this.emit('lyricchange', this.getCurrentLyric());
            }
        }
        /**
         * 获取当前歌词
         */
        getCurrentLyric() {
            if (this.currentLyricIndex >= 0 && this.currentLyricIndex < this.lyrics.length) {
                return this.lyrics[this.currentLyricIndex];
            }
            return null;
        }
        /**
         * 获取所有歌词
         */
        getAllLyrics() {
            return [...this.lyrics];
        }
        /**
         * 获取元数据
         */
        getMetadata() {
            return Object.assign({}, this.metadata);
        }
        /**
         * 更新元数据
         */
        updateMetadata(metadata) {
            this.metadata = Object.assign(Object.assign({}, this.metadata), metadata);
            // 如果更新了歌词，重新解析
            if (metadata.lrc) {
                this.parseLyrics(metadata.lrc);
            }
        }
        /**
         * 获取播放状态
         */
        get state() {
            return this._state;
        }
        /**
         * 获取播放进度（0-1）
         */
        get progress() {
            if (this.duration === 0)
                return 0;
            return this.currentTime / this.duration;
        }
        /**
         * 设置播放进度（0-1）
         */
        set progress(value) {
            this.currentTime = value * this.duration;
        }
    }

    /**
     * WebAudioKit - Main Entry Point
     * 主入口文件
     */
    // 导出核心类

    exports.AudioBGM = AudioBGM;
    exports.AudioManager = AudioManager;
    exports.BaseAudio = BaseAudio;
    exports.Music = Music;
    exports.MusicPlaylist = MusicPlaylist;
    exports.SoundEffect = SoundEffect;
    exports.default = AudioManager;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.global.js.map
