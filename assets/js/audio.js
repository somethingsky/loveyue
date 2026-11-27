/* ==========================================================================
   BGM — 背景音乐播放器
   曲目：《把回忆拼好给你》 - cici_
   首次用户交互时尝试播放；右上角音乐按钮可随时控制
   ========================================================================== */
(function (w, d) {
  'use strict';

  var SRC = './assets/audio/bgm.mp3';
  var audio = null;
  var playing = false;
  var listeners = [];
  var fadeTimer = null;
  var playRequest = 0;
  var wantsPlayback = false;

  /* 目标音量（淡入淡出用） */
  var TARGET_VOLUME = 0.55;

  function ensure() {
    if (audio) return audio;
    audio = new Audio();
    audio.src = SRC;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    audio.addEventListener('playing', function () {
      if (!wantsPlayback) { audio.pause(); return; }
      playing = true;
      emit();
    });
    audio.addEventListener('pause', function () {
      playing = false;
      emit();
    });
    audio.addEventListener('ended', function () {
      playing = false;
      emit();
    });
    audio.addEventListener('error', function () {
      playing = false;
      emit();
    });

    /* 文件就绪后再校正一次循环（某些浏览器 loop 会失效） */
    audio.addEventListener('timeupdate', function () {
      if (audio.duration && audio.currentTime >= audio.duration - 0.28) {
        audio.currentTime = 0;
      }
    });

    return audio;
  }

  function emit() {
    listeners.forEach(function (fn) {
      try { fn(playing); } catch (e) {}
    });
  }

  function fadeTo(target, ms) {
    clearInterval(fadeTimer);
    if (!audio) return;
    var from = audio.volume;
    var start = Date.now();
    var dur = ms || 900;

    fadeTimer = setInterval(function () {
      var p = Math.min(1, (Date.now() - start) / dur);
      /* easeInOutQuad */
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * e));
      if (p >= 1) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (target <= 0.001) audio.pause();
      }
    }, 24);
  }

  var Bgm = {
    /* 是否正在播放 */
    get playing() {
      return playing;
    },

    /* 订阅状态变化 */
    onChange: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },

    /* 播放（带淡入） */
    play: function () {
      var a = ensure();
      var request = ++playRequest;
      wantsPlayback = true;
      clearInterval(fadeTimer);
      var result;
      try {
        /* 必须在用户手势的调用栈中执行，不能等待 canplay。 */
        result = a.play();
      } catch (e) {
        wantsPlayback = false;
        playing = false;
        emit();
        return Promise.resolve(false);
      }
      return Promise.resolve(result).then(function () {
        if (request !== playRequest || !wantsPlayback) return false;
        fadeTo(TARGET_VOLUME, 1400);
        return true;
      }, function () {
        if (request === playRequest) {
          wantsPlayback = false;
          playing = false;
          emit();
        }
        return false;
      });
    },

    /* 暂停（带淡出） */
    pause: function () {
      ++playRequest;
      wantsPlayback = false;
      if (!audio) { playing = false; emit(); return; }
      if (audio.paused) {
        clearInterval(fadeTimer);
        audio.pause();
      } else {
        fadeTo(0, 700);
      }
      playing = false;
      emit();
    },

    /* 切换 */
    toggle: function () {
      if (playing || (audio && !audio.paused)) {
        Bgm.pause();
        return false;
      }
      Bgm.play();
      return true;
    },

    /* 预加载（不播放） */
    preload: function () {
      var a = ensure();
      try { a.load(); } catch (e) {}
    },

    setVolume: function (v) {
      TARGET_VOLUME = Math.max(0, Math.min(1, v));
      if (audio && playing) audio.volume = TARGET_VOLUME;
    }
  };

  w.Bgm = Bgm;
})(window, document);
