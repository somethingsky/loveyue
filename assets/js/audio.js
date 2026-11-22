/* ==========================================================================
   环境音 · Web Audio 实时合成（无版权素材，默认静音）
   一段轻柔的 Am - F - C - G 琶音垫底 + 微弱风噪
   ========================================================================== */
(function (w) {
  'use strict';

  var ctx = null;
  var master = null;
  var reverb = null;
  var playing = false;
  var timers = [];
  var noiseNode = null;
  var noiseGain = null;

  /* 和弦进行（Hz）：Am - F - C - G */
  var CHORDS = [
    [220.0, 261.63, 329.63, 440.0], // Am
    [174.61, 220.0, 261.63, 349.23], // F
    [261.63, 329.63, 392.0, 523.25], // C
    [196.0, 246.94, 293.66, 392.0] // G
  ];

  var chordIdx = 0;
  var arpTimer = null;

  /* ---------- 生成混响脉冲 ---------- */
  function makeReverbImpulse(c, seconds, decay) {
    var rate = c.sampleRate;
    var len = Math.floor(rate * seconds);
    var buf = c.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        data[i] =
          (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  /* ---------- 白噪声缓冲 ---------- */
  function makeNoiseBuffer(c, seconds) {
    var rate = c.sampleRate;
    var len = Math.floor(rate * seconds);
    var buf = c.createBuffer(1, len, rate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
    return buf;
  }

  /* ---------- 单个音符 ---------- */
  function pluck(freq, time, gainVal, dur) {
    if (!ctx || !playing) return;

    var osc = ctx.createOscillator();
    var osc2 = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    osc.type = 'sine';
    osc.frequency.value = freq;
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2.005;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(760, time + dur);
    filter.Q.value = 0.6;

    var g2 = ctx.createGain();
    g2.gain.value = 0.16;
    osc2.connect(g2);

    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gainVal, time + 0.045);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    g2.connect(filter);
    filter.connect(g);

    if (pan) {
      pan.pan.value = (Math.random() * 2 - 1) * 0.55;
      g.connect(pan);
      pan.connect(master);
    } else {
      g.connect(master);
    }

    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur + 0.1);
    osc2.stop(time + dur + 0.1);
  }

  /* ---------- 低音垫 ---------- */
  function pad(freq, time, dur) {
    if (!ctx || !playing) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    f.type = 'lowpass';
    f.frequency.value = 420;

    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.055, time + 1.1);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);

    osc.connect(f);
    f.connect(g);
    g.connect(master);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  }

  /* ---------- 节拍器 ---------- */
  function scheduleChord() {
    if (!playing || !ctx) return;
    var now = ctx.currentTime;
    var chord = CHORDS[chordIdx % CHORDS.length];
    var beat = 0.62;

    /* 低音 */
    pad(chord[0] / 2, now + 0.02, 2.9);

    /* 琶音：4 个音，随机顺序制造自然感 */
    var order = [0, 2, 1, 3, 2, 1, 3, 0];
    for (var i = 0; i < 8; i++) {
      var nIdx = order[i] % chord.length;
      var oct = i > 4 ? 2 : 1;
      pluck(chord[nIdx] * oct, now + i * beat, 0.055 + Math.random() * 0.025, 2.4);
    }

    /* 偶尔高音点缀 */
    if (Math.random() < 0.55) {
      pluck(chord[Math.floor(Math.random() * 4)] * 3, now + 2.2, 0.022, 2.8);
    }

    chordIdx++;
    arpTimer = setTimeout(scheduleChord, 3100);
  }

  /* ---------- 风噪 ---------- */
  function startNoise() {
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 4);
    src.loop = true;

    var f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 480;
    f.Q.value = 0.5;

    noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.028, ctx.currentTime + 2.4);

    src.connect(f);
    f.connect(noiseGain);
    noiseGain.connect(master);
    src.start();
    noiseNode = src;
  }

  /* ---------- 对外 API ---------- */
  var Audio = {
    isOn: function () {
      return playing;
    },

    toggle: function () {
      if (playing) {
        Audio.stop();
        return false;
      }
      Audio.start();
      return true;
    },

    start: function () {
      if (playing) return;
      try {
        if (!ctx) {
          var AC = w.AudioContext || w.webkitAudioContext;
          if (!AC) return;
          ctx = new AC();

          master = ctx.createGain();
          master.gain.value = 0.9;

          /* 混响 */
          reverb = ctx.createConvolver();
          reverb.buffer = makeReverbImpulse(ctx, 2.8, 2.6);
          var wet = ctx.createGain();
          wet.gain.value = 0.34;
          reverb.connect(wet);
          wet.connect(master);

          /* 干声直连 */
          master.connect(ctx.destination);

          /* 把 reverb 作为并联支路 */
          Audio._wetIn = ctx.createGain();
          Audio._wetIn.gain.value = 1;
          Audio._wetIn.connect(reverb);
        }

        if (ctx.state === 'suspended') ctx.resume();

        playing = true;
        /* 把所有音符也送一路到混响 */
        var send = ctx.createGain();
        send.gain.value = 0.3;
        master.connect(send);
        send.connect(Audio._wetIn);

        startNoise();
        scheduleChord();
      } catch (e) {
        playing = false;
      }
    },

    stop: function () {
      playing = false;
      if (arpTimer) {
        clearTimeout(arpTimer);
        arpTimer = null;
      }
      if (noiseGain && ctx) {
        try {
          noiseGain.gain.cancelScheduledValues(ctx.currentTime);
          noiseGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        } catch (e) {}
      }
      if (noiseNode) {
        var n = noiseNode;
        noiseNode = null;
        setTimeout(function () {
          try {
            n.stop();
          } catch (e) {}
        }, 800);
      }
      if (master && ctx) {
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
          master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        } catch (e) {}
      }
      setTimeout(function () {
        if (!playing && master && ctx) {
          try {
            master.gain.value = 0.9;
          } catch (e) {}
        }
      }, 900);
    }
  };

  w.AmbientAudio = Audio;
})(window);
