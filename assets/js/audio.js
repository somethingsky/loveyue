/* ==========================================================================
   BGM — 背景音乐播放器
   曲目：《把回忆拼好给你》 - cici_
   默认不播放（浏览器自动播放策略限制），点击右上角音乐按钮后开始
   ========================================================================== */
(function (w, d) {
  'use strict';

  var SRC = './assets/audio/bgm.mp3';
  var audio = null;
  var playing = false;
  var listeners = [];
  var fadeTimer = null;

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
      function go() {
        var p = a.play();
        if (p && p.catch) {
          p.catch(function () {
            /* 自动播放被拦截，静默失败 */
            playing = false;
            emit();
          });
        }
        fadeTo(TARGET_VOLUME, 1400);
      }
      if (a.readyState >= 2) {
        go();
      } else {
        a.addEventListener('canplay', function once() {
          a.removeEventListener('canplay', once);
          go();
        });
      }
    },

    /* 暂停（带淡出） */
    pause: function () {
      if (!audio) { playing = false; emit(); return; }
      fadeTo(0, 700);
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
