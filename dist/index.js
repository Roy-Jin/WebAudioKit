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
 * SFX - 音效类
 * 可重叠播放的音频效果
 */
class SFX {
    constructor(options = {}) {
        this.src = null;
        this.defaultVolume = 1;
        this.defaultRate = 1;
        this.eventListeners = new Map();
        this.activeInstances = new Set();
        this.isLoaded = false;
        this.loadPromise = null;
        if (options.volume !== undefined) {
            this.defaultVolume = Math.max(0, Math.min(1, options.volume));
        }
        if (options.rate !== undefined) {
            this.defaultRate = options.rate;
        }
    }
    /**
     * 预加载音效资源
     */
    load(src) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.src === src && this.isLoaded) {
                return;
            }
            this.src = src;
            this.isLoaded = false;
            // 如果已有加载中的Promise，返回它
            if (this.loadPromise) {
                return this.loadPromise;
            }
            this.loadPromise = new Promise((resolve, reject) => {
                const audio = new Audio(src);
                const onLoad = () => {
                    this.isLoaded = true;
                    this.loadPromise = null;
                    this.emit('loaded');
                    cleanup();
                    resolve();
                };
                const onError = (e) => {
                    this.loadPromise = null;
                    this.emit('error', e);
                    cleanup();
                    reject(e);
                };
                const cleanup = () => {
                    audio.removeEventListener('canplaythrough', onLoad);
                    audio.removeEventListener('error', onError);
                };
                audio.addEventListener('canplaythrough', onLoad, { once: true });
                audio.addEventListener('error', onError, { once: true });
                audio.load();
            });
            return this.loadPromise;
        });
    }
    /**
     * 播放音效（每次创建新实例，支持重叠播放）
     */
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.src) {
                throw new Error('SFX: No audio source loaded. Call load() first.');
            }
            const audio = new Audio(this.src);
            audio.volume = this.defaultVolume;
            audio.playbackRate = this.defaultRate;
            this.activeInstances.add(audio);
            audio.addEventListener('play', () => this.emit('play'));
            audio.addEventListener('ended', () => {
                this.emit('ended');
                this.activeInstances.delete(audio);
            });
            audio.addEventListener('error', (e) => {
                this.emit('error', e);
                this.activeInstances.delete(audio);
            });
            try {
                yield audio.play();
            }
            catch (error) {
                this.emit('error', error);
                this.activeInstances.delete(audio);
                throw error;
            }
        });
    }
    /**
     * 停止所有正在播放的音效实例
     */
    stopAll() {
        this.activeInstances.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeInstances.clear();
        this.emit('stop');
    }
    get volume() {
        return this.defaultVolume;
    }
    set volume(value) {
        this.defaultVolume = Math.max(0, Math.min(1, value));
        this.activeInstances.forEach(audio => {
            audio.volume = this.defaultVolume;
        });
        this.emit('volumechange', this.defaultVolume);
    }
    get rate() {
        return this.defaultRate;
    }
    set rate(value) {
        this.defaultRate = value;
        this.activeInstances.forEach(audio => {
            audio.playbackRate = this.defaultRate;
        });
    }
    get activeCount() {
        return this.activeInstances.size;
    }
    get loaded() {
        return this.isLoaded;
    }
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }
    destroy() {
        this.stopAll();
        this.eventListeners.clear();
        this.src = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }
}

/**
 * BGM - 背景音乐类
 * 支持淡入淡出效果，不支持重叠播放
 */
class BGM {
    constructor(options = {}) {
        this.audio = null;
        this.src = null;
        this.eventListeners = new Map();
        this.fadeInMs = 0;
        this.fadeOutMs = 0;
        this.fadeTimer = null;
        this.defaultVolume = 1;
        this.defaultRate = 1;
        this.defaultLoop = true;
        this.isLoaded = false;
        this.loadPromise = null;
        if (options.volume !== undefined) {
            this.defaultVolume = Math.max(0, Math.min(1, options.volume));
        }
        if (options.rate !== undefined) {
            this.defaultRate = options.rate;
        }
        if (options.loop !== undefined) {
            this.defaultLoop = options.loop;
        }
        if (options.fadeIn !== undefined) {
            this.fadeInMs = options.fadeIn;
        }
        if (options.fadeOut !== undefined) {
            this.fadeOutMs = options.fadeOut;
        }
    }
    /**
     * 预加载BGM资源
     */
    load(src) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.src === src && this.isLoaded) {
                return;
            }
            // 如果正在播放，先停止
            if (this.audio && !this.audio.paused) {
                this.stop();
            }
            this.src = src;
            this.isLoaded = false;
            if (this.loadPromise) {
                return this.loadPromise;
            }
            this.loadPromise = new Promise((resolve, reject) => {
                this.audio = new Audio(src);
                this.audio.volume = this.defaultVolume;
                this.audio.playbackRate = this.defaultRate;
                this.audio.loop = this.defaultLoop;
                this.setupEvents();
                const onLoad = () => {
                    this.isLoaded = true;
                    this.loadPromise = null;
                    this.emit('loaded');
                    cleanup();
                    resolve();
                };
                const onError = (e) => {
                    this.loadPromise = null;
                    this.emit('error', e);
                    cleanup();
                    reject(e);
                };
                const cleanup = () => {
                    this.audio.removeEventListener('canplaythrough', onLoad);
                    this.audio.removeEventListener('error', onError);
                };
                this.audio.addEventListener('canplaythrough', onLoad, { once: true });
                this.audio.addEventListener('error', onError, { once: true });
                this.audio.load();
            });
            return this.loadPromise;
        });
    }
    setupEvents() {
        if (!this.audio)
            return;
        this.audio.addEventListener('play', () => this.emit('play'));
        this.audio.addEventListener('pause', () => this.emit('pause'));
        this.audio.addEventListener('ended', () => this.emit('ended'));
        this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', {
            currentTime: this.audio.currentTime,
            duration: this.audio.duration
        }));
        this.audio.addEventListener('error', (e) => this.emit('error', e));
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audio) {
                throw new Error('BGM: No audio source loaded. Call load() first.');
            }
            if (this.fadeInMs > 0) {
                yield this.fadeIn();
            }
            else {
                try {
                    yield this.audio.play();
                }
                catch (error) {
                    this.emit('error', error);
                    throw error;
                }
            }
        });
    }
    pause() {
        if (!this.audio)
            return;
        this.audio.pause();
    }
    stop() {
        if (!this.audio)
            return;
        if (this.fadeOutMs > 0) {
            this.fadeOut().then(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.emit('stop');
                }
            });
        }
        else {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.emit('stop');
        }
    }
    get volume() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.volume) !== null && _b !== void 0 ? _b : this.defaultVolume;
    }
    set volume(value) {
        const vol = Math.max(0, Math.min(1, value));
        this.defaultVolume = vol;
        if (this.audio) {
            this.audio.volume = vol;
            this.emit('volumechange', vol);
        }
    }
    get currentTime() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.currentTime) !== null && _b !== void 0 ? _b : 0;
    }
    set currentTime(value) {
        if (this.audio) {
            this.audio.currentTime = value;
        }
    }
    get duration() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0;
    }
    get paused() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.paused) !== null && _b !== void 0 ? _b : true;
    }
    get loop() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.loop) !== null && _b !== void 0 ? _b : this.defaultLoop;
    }
    set loop(value) {
        this.defaultLoop = value;
        if (this.audio) {
            this.audio.loop = value;
        }
    }
    get rate() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.playbackRate) !== null && _b !== void 0 ? _b : this.defaultRate;
    }
    set rate(value) {
        this.defaultRate = value;
        if (this.audio) {
            this.audio.playbackRate = value;
        }
    }
    get loaded() {
        return this.isLoaded;
    }
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }
    fadeIn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audio)
                return;
            this.clearFade();
            const targetVolume = this.audio.volume;
            this.audio.volume = 0;
            try {
                yield this.audio.play();
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            return new Promise((resolve) => {
                const step = targetVolume / (this.fadeInMs / 50);
                let vol = 0;
                this.fadeTimer = window.setInterval(() => {
                    if (!this.audio) {
                        this.clearFade();
                        resolve();
                        return;
                    }
                    vol += step;
                    if (vol >= targetVolume) {
                        this.audio.volume = targetVolume;
                        this.clearFade();
                        resolve();
                    }
                    else {
                        this.audio.volume = vol;
                    }
                }, 50);
            });
        });
    }
    fadeOut() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audio)
                return;
            this.clearFade();
            const startVolume = this.audio.volume;
            return new Promise((resolve) => {
                const step = startVolume / (this.fadeOutMs / 50);
                let vol = startVolume;
                this.fadeTimer = window.setInterval(() => {
                    if (!this.audio) {
                        this.clearFade();
                        resolve();
                        return;
                    }
                    vol -= step;
                    if (vol <= 0) {
                        this.audio.volume = 0;
                        this.clearFade();
                        resolve();
                    }
                    else {
                        this.audio.volume = vol;
                    }
                }, 50);
            });
        });
    }
    clearFade() {
        if (this.fadeTimer !== null) {
            clearInterval(this.fadeTimer);
            this.fadeTimer = null;
        }
    }
    /**
     * 切换到新的BGM源
     */
    switch(src) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fadeOutMs > 0 && this.audio && !this.audio.paused) {
                yield this.fadeOut();
            }
            this.stop();
            yield this.load(src);
            yield this.play();
        });
    }
    destroy() {
        this.clearFade();
        this.stop();
        if (this.audio) {
            this.audio.src = '';
            this.audio.load();
            this.audio = null;
        }
        this.eventListeners.clear();
        this.src = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }
}

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
 * Music - 音乐子类
 * 表示单个音乐项，包含元数据和歌词
 */
class Music {
    constructor(src, metadata = {}) {
        this.lyrics = [];
        this.eventListeners = new Map();
        this.src = src;
        this.metadata = metadata;
        if (this.metadata.lrc) {
            this.parseLyrics(this.metadata.lrc);
        }
    }
    get url() {
        return this.src;
    }
    get meta() {
        return Object.assign({}, this.metadata);
    }
    set meta(data) {
        this.metadata = Object.assign(Object.assign({}, this.metadata), data);
        if (data.lrc) {
            this.parseLyrics(data.lrc);
        }
    }
    getLyrics() {
        return [...this.lyrics];
    }
    getLyricAt(time) {
        if (this.lyrics.length === 0)
            return null;
        let index = -1;
        for (let i = 0; i < this.lyrics.length; i++) {
            if (time >= this.lyrics[i].time) {
                index = i;
            }
            else {
                break;
            }
        }
        return index >= 0 ? this.lyrics[index] : null;
    }
    parseLyrics(text) {
        try {
            const lrc = Lrc.parse(text);
            this.lyrics = lrc.lyrics.map(line => ({
                time: line.timestamp,
                text: line.content
            }));
            this.emit('lyricsloaded');
        }
        catch (error) {
            console.warn('Failed to parse lyrics:', error);
            this.lyrics = [];
        }
    }
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }
}

/**
 * WebAudioKit - Type Definitions
 */
/**
 * 播放模式
 */
var PlayMode;
(function (PlayMode) {
    PlayMode["LOOP"] = "loop";
    PlayMode["SHUFFLE"] = "shuffle";
    PlayMode["SINGLE"] = "single";
    PlayMode["SEQUENTIAL"] = "sequential";
})(PlayMode || (PlayMode = {}));
/**
 * 播放状态
 */
var PlayState;
(function (PlayState) {
    PlayState["PLAYING"] = "playing";
    PlayState["PAUSED"] = "paused";
    PlayState["STOPPED"] = "stopped";
    PlayState["LOADING"] = "loading";
    PlayState["ERROR"] = "error";
})(PlayState || (PlayState = {}));

/**
 * MusicPlayer - 音乐播放器类
 * 管理播放列表，支持多种播放模式
 */
class MusicPlayer {
    constructor(options = {}) {
        this.audio = null;
        this.eventListeners = new Map();
        this._state = PlayState.STOPPED;
        this.lyricIndex = -1;
        this.playlist = [];
        this.index = -1;
        this.mode = PlayMode.SEQUENTIAL;
        this.shuffleOrder = [];
        this.defaultVolume = 1;
        this.defaultRate = 1;
        this.defaultLoop = false;
        if (options.volume !== undefined) {
            this.defaultVolume = Math.max(0, Math.min(1, options.volume));
        }
        if (options.rate !== undefined) {
            this.defaultRate = options.rate;
        }
        if (options.loop !== undefined) {
            this.defaultLoop = options.loop;
        }
        if (options.mode !== undefined) {
            this.mode = options.mode;
        }
    }
    /**
     * 添加音乐到播放列表
     */
    add(music) {
        this.playlist.push(music);
        if (this.index === -1) {
            this.index = 0;
        }
        this.updateShuffle();
        this.emit('playlistchange');
    }
    /**
     * 批量添加音乐到播放列表
     */
    addList(musicList) {
        this.playlist.push(...musicList);
        if (this.index === -1 && this.playlist.length > 0) {
            this.index = 0;
        }
        this.updateShuffle();
        this.emit('playlistchange');
    }
    /**
     * 从Meting API数据添加到播放列表
     */
    addFromMeting(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const musicList = [];
            for (const item of data) {
                const metadata = {
                    title: (_a = item.name) !== null && _a !== void 0 ? _a : item.title,
                    artist: (_b = item.artist) !== null && _b !== void 0 ? _b : item.author,
                    album: (_c = item.album) !== null && _c !== void 0 ? _c : "",
                    cover: (_d = item.pic) !== null && _d !== void 0 ? _d : item.cover,
                };
                // 获取歌词
                if (item.lrc || item.lyric) {
                    try {
                        const response = yield fetch((_e = item.lrc) !== null && _e !== void 0 ? _e : item.lyric);
                        metadata.lrc = yield response.text();
                    }
                    catch (error) {
                        console.warn('Failed to fetch lyrics:', error);
                    }
                }
                const music = new Music(item.url, metadata);
                musicList.push(music);
            }
            this.addList(musicList);
        });
    }
    /**
     * 从播放列表移除
     */
    remove(idx) {
        if (idx >= 0 && idx < this.playlist.length) {
            this.playlist.splice(idx, 1);
            if (this.index >= this.playlist.length) {
                this.index = this.playlist.length - 1;
            }
            this.updateShuffle();
            this.emit('playlistchange');
        }
    }
    /**
     * 清空播放列表
     */
    clear() {
        this.stop();
        this.playlist = [];
        this.index = -1;
        this.shuffleOrder = [];
        this.emit('playlistchange');
    }
    /**
     * 加载指定索引的音乐
     */
    loadMusic(idx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (idx < 0 || idx >= this.playlist.length) {
                throw new Error('Invalid music index');
            }
            const music = this.playlist[idx];
            const wasPlaying = this.audio && !this.audio.paused;
            // 停止当前播放
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
            // 创建新的audio实例
            this.audio = new Audio(music.url);
            this.audio.volume = this.defaultVolume;
            this.audio.playbackRate = this.defaultRate;
            this.audio.loop = this.defaultLoop;
            this.setupEvents();
            this.index = idx;
            this.lyricIndex = -1;
            this._state = PlayState.LOADING;
            this.emit('musicchange', music);
            // 等待加载
            yield new Promise((resolve, reject) => {
                const onLoad = () => {
                    cleanup();
                    resolve();
                };
                const onError = (e) => {
                    this._state = PlayState.ERROR;
                    cleanup();
                    reject(e);
                };
                const cleanup = () => {
                    this.audio.removeEventListener('canplaythrough', onLoad);
                    this.audio.removeEventListener('error', onError);
                };
                this.audio.addEventListener('canplaythrough', onLoad, { once: true });
                this.audio.addEventListener('error', onError, { once: true });
                this.audio.load();
            });
            // 如果之前在播放，自动播放新音乐
            if (wasPlaying) {
                yield this.play();
            }
        });
    }
    setupEvents() {
        if (!this.audio)
            return;
        this.audio.addEventListener('play', () => {
            this._state = PlayState.PLAYING;
            this.emit('play');
        });
        this.audio.addEventListener('pause', () => {
            this._state = PlayState.PAUSED;
            this.emit('pause');
        });
        this.audio.addEventListener('ended', () => {
            this.emit('ended');
            this.handleEnded();
        });
        this.audio.addEventListener('timeupdate', () => {
            this.emit('timeupdate', {
                currentTime: this.audio.currentTime,
                duration: this.audio.duration
            });
            this.updateLyric();
        });
        this.audio.addEventListener('error', (e) => {
            this._state = PlayState.ERROR;
            this.emit('error', e);
        });
    }
    handleEnded() {
        return __awaiter(this, void 0, void 0, function* () {
            const nextMusic = this.next();
            if (nextMusic) {
                yield this.loadMusic(this.index);
                yield this.play();
            }
            else {
                this._state = PlayState.STOPPED;
                this.emit('stop');
            }
        });
    }
    play(idx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (idx !== undefined) {
                yield this.loadMusic(idx);
            }
            if (!this.audio) {
                if (this.playlist.length > 0 && this.index >= 0) {
                    yield this.loadMusic(this.index);
                }
                else {
                    throw new Error('No music to play');
                }
            }
            try {
                yield this.audio.play();
            }
            catch (error) {
                this._state = PlayState.ERROR;
                this.emit('error', error);
                throw error;
            }
        });
    }
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this._state = PlayState.STOPPED;
            this.emit('stop');
        }
    }
    /**
     * 下一首
     */
    next() {
        if (this.playlist.length === 0)
            return null;
        switch (this.mode) {
            case PlayMode.SINGLE:
                return this.current;
            case PlayMode.SHUFFLE:
                const currIdx = this.shuffleOrder.indexOf(this.index);
                const nextIdx = (currIdx + 1) % this.shuffleOrder.length;
                this.index = this.shuffleOrder[nextIdx];
                break;
            case PlayMode.LOOP:
                this.index = (this.index + 1) % this.playlist.length;
                break;
            case PlayMode.SEQUENTIAL:
                if (this.index < this.playlist.length - 1) {
                    this.index++;
                }
                else {
                    return null;
                }
                break;
        }
        return this.current;
    }
    /**
     * 上一首
     */
    prev() {
        if (this.playlist.length === 0)
            return null;
        switch (this.mode) {
            case PlayMode.SINGLE:
                return this.current;
            case PlayMode.SHUFFLE:
                const currIdx = this.shuffleOrder.indexOf(this.index);
                const prevIdx = currIdx === 0 ? this.shuffleOrder.length - 1 : currIdx - 1;
                this.index = this.shuffleOrder[prevIdx];
                break;
            case PlayMode.LOOP:
                this.index = this.index === 0 ? this.playlist.length - 1 : this.index - 1;
                break;
            case PlayMode.SEQUENTIAL:
                if (this.index > 0) {
                    this.index--;
                }
                else {
                    return null;
                }
                break;
        }
        return this.current;
    }
    /**
     * 播放下一首
     */
    playNext() {
        return __awaiter(this, void 0, void 0, function* () {
            const nextMusic = this.next();
            if (nextMusic) {
                yield this.loadMusic(this.index);
                yield this.play();
            }
        });
    }
    /**
     * 播放上一首
     */
    playPrev() {
        return __awaiter(this, void 0, void 0, function* () {
            const prevMusic = this.prev();
            if (prevMusic) {
                yield this.loadMusic(this.index);
                yield this.play();
            }
        });
    }
    updateShuffle() {
        this.shuffleOrder = Array.from({ length: this.playlist.length }, (_, i) => i);
        for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffleOrder[i], this.shuffleOrder[j]] =
                [this.shuffleOrder[j], this.shuffleOrder[i]];
        }
    }
    updateLyric() {
        const music = this.current;
        if (!music)
            return;
        const lyrics = music.getLyrics();
        if (lyrics.length === 0)
            return;
        const time = this.currentTime;
        let newIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (time >= lyrics[i].time) {
                newIndex = i;
            }
            else {
                break;
            }
        }
        if (newIndex !== this.lyricIndex) {
            this.lyricIndex = newIndex;
            this.emit('lyricchange', this.lyric);
        }
    }
    // ==================== Getters & Setters ====================
    get volume() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.volume) !== null && _b !== void 0 ? _b : this.defaultVolume;
    }
    set volume(value) {
        const vol = Math.max(0, Math.min(1, value));
        this.defaultVolume = vol;
        if (this.audio) {
            this.audio.volume = vol;
            this.emit('volumechange', vol);
        }
    }
    get currentTime() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.currentTime) !== null && _b !== void 0 ? _b : 0;
    }
    set currentTime(value) {
        if (this.audio) {
            this.audio.currentTime = value;
        }
    }
    get duration() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0;
    }
    get paused() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.paused) !== null && _b !== void 0 ? _b : true;
    }
    get loop() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.loop) !== null && _b !== void 0 ? _b : this.defaultLoop;
    }
    set loop(value) {
        this.defaultLoop = value;
        if (this.audio) {
            this.audio.loop = value;
        }
    }
    get rate() {
        var _a, _b;
        return (_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.playbackRate) !== null && _b !== void 0 ? _b : this.defaultRate;
    }
    set rate(value) {
        this.defaultRate = value;
        if (this.audio) {
            this.audio.playbackRate = value;
        }
    }
    get state() {
        return this._state;
    }
    get progress() {
        if (this.duration === 0)
            return 0;
        return this.currentTime / this.duration;
    }
    set progress(value) {
        this.currentTime = value * this.duration;
    }
    get current() {
        if (this.index >= 0 && this.index < this.playlist.length) {
            return this.playlist[this.index];
        }
        return null;
    }
    get(idx) {
        if (idx >= 0 && idx < this.playlist.length) {
            return this.playlist[idx];
        }
        return null;
    }
    getAll() {
        return [...this.playlist];
    }
    get length() {
        return this.playlist.length;
    }
    get currentIndex() {
        return this.index;
    }
    set currentIndex(value) {
        if (value >= 0 && value < this.playlist.length) {
            this.index = value;
        }
    }
    get playMode() {
        return this.mode;
    }
    set playMode(value) {
        this.mode = value;
        if (value === PlayMode.SHUFFLE) {
            this.updateShuffle();
        }
    }
    get lyric() {
        const music = this.current;
        if (!music)
            return null;
        const lyrics = music.getLyrics();
        if (this.lyricIndex >= 0 && this.lyricIndex < lyrics.length) {
            return lyrics[this.lyricIndex];
        }
        return null;
    }
    getLyrics() {
        const music = this.current;
        return music ? music.getLyrics() : [];
    }
    // ==================== Events ====================
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }
    destroy() {
        this.stop();
        if (this.audio) {
            this.audio.src = '';
            this.audio.load();
            this.audio = null;
        }
        this.eventListeners.clear();
        this.playlist = [];
        this.index = -1;
    }
}

export { BGM, Music, MusicPlayer, PlayMode, PlayState, SFX };
//# sourceMappingURL=index.js.map
