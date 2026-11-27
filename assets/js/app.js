/* ==========================================================================
   App — 场景控制 / 各场景动效
   ========================================================================== */
(function (w, d) {
  'use strict';

  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var RM = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms);
    };
  }

  /* ======================================================================
     场景表
     ====================================================================== */
  var SCENES = [
    { key: 'hero',     label: '序章' },
    { key: 'tree',     label: '心之树' },
    { key: 'garden',   label: '时间花园' },
    { key: 'code',     label: '代码情书' },
    { key: 'story',    label: '故事' },
    { key: 'gallery',  label: '影像' },
    { key: 'aurora',   label: '极光' },
    { key: 'terminal', label: '告白' }
  ];

  var current = 0;
  var switching = false;

  /* ======================================================================
     导航
     ====================================================================== */
  function initNav() {
    var side = $('#sideNav');
    var dots = $('#journeyDots');
    SCENES.forEach(function (s, i) {
      var b = d.createElement('button');
      b.type = 'button';
      b.textContent = pad2(i + 1);
      b.setAttribute('data-label', s.label);
      b.setAttribute('aria-label', s.label);
      b.addEventListener('click', function () { go(i); });
      side.appendChild(b);

      var jb = d.createElement('button');
      jb.type = 'button';
      jb.className = 'jdot';
      jb.setAttribute('aria-label', s.label);
      jb.addEventListener('click', function () { go(i); });
      dots.appendChild(jb);
    });
  }

  function syncNav() {
    $$('#sideNav button').forEach(function (b, i) { b.classList.toggle('on', i === current); });
    $$('#journeyDots .jdot').forEach(function (b, i) { b.classList.toggle('on', i === current); });
    var c = $('#jCur');
    if (c) c.textContent = pad2(current + 1);
  }

  /* ======================================================================
     切换
     ====================================================================== */
  function go(idx) {
    idx = clamp(idx, 0, SCENES.length - 1);
    if (idx === current || switching) return;

    var from = $('.scene.active');
    var to = $('[data-scene="' + idx + '"]');
    if (!to) return;

    switching = true;
    var prev = current;
    current = idx;
    syncNav();

    if (from) {
      from.classList.remove('active');
      leaveScene(prev);
    }
    to.classList.add('active');
    to.querySelector('.scene-pad').scrollTo(0, 0);
    to.querySelector('.scene-inner').scrollTo(0, 0);

    /* 强制重排，让 .rise 重新播放 */
    void to.offsetWidth;

    setTimeout(function () {
      switching = false;
      enterScene(idx);
    }, RM ? 20 : 400);
  }

  function enterScene(i) {
    var k = SCENES[i].key;
    if (k === 'tree') Tree.enter();
    else if (k === 'garden') Garden.enter();
    else if (k === 'code') Code.enter();
    else if (k === 'story') Story.enter();
    else if (k === 'gallery') Gallery.enter();
    else if (k === 'aurora') Aurora.enter();
    else if (k === 'terminal') Terminal.enter();
    else if (k === 'hero') Hero.enter();
  }

  function leaveScene(i) {
    var k = SCENES[i].key;
    if (k === 'garden') Garden.leave();
    else if (k === 'code') Code.leave();
    else if (k === 'story') Story.leave();
    else if (k === 'terminal') Terminal.leave();
  }

  /* ======================================================================
     01 · Hero
     ====================================================================== */
  var Hero = {
    enter: function () {
      var cast = $('.hero-cast');
      if (!cast) return;
      var figs = $$('.hero-char img', cast);
      figs.forEach(function (img, i) {
        img.style.opacity = '0';
        img.style.transform = 'translateY(22px) scale(0.96)';
        setTimeout(function () {
          img.style.transition = 'opacity .85s cubic-bezier(.22,1,.36,1), transform .85s cubic-bezier(.22,1,.36,1)';
          img.style.opacity = '1';
          img.style.transform = 'none';
        }, RM ? 0 : 90 + i * 130);
      });
    }
  };

  /* ======================================================================
     02 · 心之树
     ====================================================================== */
  var Tree = (function () {
    var canvas, ctx, W, H, raf = null, inited = false;
    var phase = 0;          // 0 等待 1 心坠 2 生长 3 开花 4 飘落
    var tick = 0, seedPulse = 0;
    var branches = [], blooms = [], bloomCache = [];
    var heartScale = 1, seedY = 0, started = false;
    var seed = { x: 0, y: 0, r: 0 };

    var BASE_W = 1100, BASE_H = 680;
    var BRANCHES = [
      [535, 680, 570, 250, 500, 200, 30, 100, [
        [540, 500, 455, 417, 340, 400, 13, 100, [
          [450, 435, 434, 430, 394, 395, 2, 40]
        ]],
        [550, 445, 600, 356, 680, 345, 12, 100, [
          [578, 400, 648, 409, 661, 426, 3, 80]
        ]],
        [539, 281, 537, 248, 534, 217, 3, 40],
        [546, 397, 413, 247, 328, 244, 9, 80, [
          [427, 286, 383, 253, 371, 205, 2, 40],
          [498, 345, 435, 315, 395, 330, 4, 60]
        ]],
        [546, 357, 608, 252, 678, 221, 6, 100, [
          [590, 293, 646, 277, 648, 271, 2, 80]
        ]]
      ]]
    ];

    function heartPoints(sc) {
      var pts = [];
      for (var i = 10; i < 30; i += 0.22) {
        var t = i / Math.PI;
        var x = 16 * Math.pow(Math.sin(t), 3);
        var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push([x * sc, -y * sc]);
      }
      return pts;
    }

    function inHeart(x, y, r) {
      var a = (x / r) * (x / r) + (y / r) * (y / r) - 1;
      return a * a * a - (x / r) * (x / r) * (y / r) * (y / r) * (y / r) < 0;
    }

    function bez(p, t) {
      var mt = 1 - t;
      return [
        mt * mt * p[0][0] + 2 * mt * t * p[1][0] + t * t * p[2][0],
        mt * mt * p[0][1] + 2 * mt * t * p[1][1] + t * t * p[2][1]
      ];
    }

    function buildTree() {
      branches = [];
      var sx = W / BASE_W, sy = H / BASE_H;
      var s = Math.max(Math.min(sx, sy), 0.44);
      var ox = (W - BASE_W * s) / 2;
      var oy = (H - BASE_H * s) / 2;

      (function walk(list) {
        list.forEach(function (def) {
          branches.push({
            p1: [def[0] * s + ox, def[1] * s + oy],
            p2: [def[2] * s + ox, def[3] * s + oy],
            p3: [def[4] * s + ox, def[5] * s + oy],
            r: Math.max(1.4, def[6] * s * 1.1),
            len: 0,
            length: def[7],
            t: 1 / (def[7] - 1),
            alive: true
          });
          if (def[8]) walk(def[8]);
        });
      })(BRANCHES);

      bloomCache = [];
      var r = Math.min(W, H) * 0.38;
      var cx = W / 2, cy = H * 0.48;
      for (var i = 0; i < 300; i++) {
        var bx, by, tries = 0;
        do {
          bx = 30 + Math.random() * (W - 60);
          by = 30 + Math.random() * (H - 60);
          tries++;
        } while (!inHeart(bx - cx, cy - by, r) && tries < 40);
        bloomCache.push([bx, by]);
      }
    }

    function fit() {
      if (!canvas) return;
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = Math.max(220, Math.round(rect.width));
      H = Math.max(220, Math.round(rect.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed.x = W / 2;
      seed.y = H * 0.52;
      seed.r = Math.max(14, Math.min(W, H) * 0.03);
      if (!started) buildTree();
      render();
    }

    function drawSeed(alpha) {
      var r = seed.r + Math.sin(seedPulse) * 2.4;
      var g = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, r * 2.8);
      g.addColorStop(0, 'rgba(190,120,255,0.5)');
      g.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, r * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(186,116,255,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, r * 1.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    function drawBigHeart(cy, sc) {
      var pts = heartPoints(sc);
      ctx.save();
      ctx.fillStyle = 'rgba(255,86,132,0.94)';
      ctx.shadowColor = 'rgba(255,86,132,0.7)';
      ctx.shadowBlur = 28;
      ctx.translate(seed.x, cy);
      ctx.beginPath();
      pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawBranch(b) {
      var n = Math.min(b.len, b.length);
      ctx.fillStyle = 'rgba(196,208,244,0.5)';
      ctx.shadowColor = 'rgba(140,160,255,0.55)';
      ctx.shadowBlur = 7;
      for (var i = 0; i <= n; i++) {
        var p = bez([b.p1, b.p2, b.p3], Math.min(1, i * b.t));
        ctx.beginPath();
        ctx.arc(p[0], p[1], Math.max(0.6, b.r * Math.pow(0.985, i)), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawBloom(x, y, sc, a) {
      var pts = heartPoints(sc * 0.42);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ff6b9d';
      ctx.translate(x, y);
      ctx.beginPath();
      pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawGround() {
      /* 树根处的柔和光晕：用径向渐变避免出现矩形边界 */
      var cx = seed.x;
      var cy = H * 0.92;
      var rx = Math.min(W * 0.42, 420);
      var ry = Math.min(H * 0.16, 110);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
      g.addColorStop(0, 'rgba(140,160,255,0.10)');
      g.addColorStop(0.55, 'rgba(140,160,255,0.035)');
      g.addColorStop(1, 'rgba(140,160,255,0)');
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
      ctx.translate(-cx, -cy);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(rx, ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      if (phase === 0) { drawSeed(0.9); return; }
      if (phase === 1) { drawBigHeart(seedY, heartScale); return; }

      branches.forEach(function (b) { if (b.len) drawBranch(b); });

      if (phase >= 3) {
        blooms.forEach(function (bl) { drawBloom(bl[0], bl[1], bl[2], bl[3]); });
      }
      drawGround();
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      tick++;

      if (phase === 0) {
        seedPulse += 0.055;
        render();
        return;
      }

      if (phase === 1) {
        heartScale *= 0.945;
        seedY += 3.4;
        if (heartScale < 0.06) { phase = 2; return; }
        render();
        return;
      }

      if (phase === 2) {
        var step = RM ? 8 : 2, allDone = true;
        for (var k = 0; k < step; k++) {
          var grew = 0;
          branches.forEach(function (b) {
            if (!b.alive) return;
            if (b.len < b.length) { b.len++; grew++; }
            else { b.alive = false; }
          });
          if (grew) allDone = false;
        }
        render();
        if (allDone) phase = 3;
        return;
      }

      if (phase === 3) {
        for (var i = 0; i < 8 && bloomCache.length; i++) {
          var p = bloomCache.pop();
          blooms.push([p[0], p[1], 0.18, 0.92]);
        }
        blooms.forEach(function (bl) { bl[2] = Math.min(1, bl[2] + 0.055); });
        render();
        if (!bloomCache.length && blooms.length && blooms[0][2] >= 1) {
          phase = 4;
          blooms.forEach(function (bl) { bl[4] = Math.random() * 0.5 + 0.22; });
        }
        return;
      }

      /* phase 4：花瓣飘落 */
      blooms.forEach(function (bl) {
        bl[1] += bl[4] || 0.4;
        bl[0] += Math.sin((tick + bl[0]) * 0.02) * 0.5;
      });
      blooms = blooms.filter(function (bl) { return bl[1] < H + 24; });
      if (blooms.length < 12 && tick % 20 === 0) {
        for (var j = 0; j < 3; j++) {
          blooms.push([30 + Math.random() * (W - 60), -14, 0.75 + Math.random() * 0.25, 0.8]);
        }
      }
      render();
    }

    function start() {
      if (started) return;
      started = true;
      buildTree();
      phase = 1;
      heartScale = Math.min(W, H) / 105;
      seedY = seed.y;
      var tip = $('#treeTip');
      if (tip) tip.classList.add('gone');
      if (!raf) loop();
    }

    return {
      enter: function () {
        if (!inited) {
          canvas = $('#treeCanvas');
          if (!canvas) return;
          inited = true;
          canvas.addEventListener('click', start);
          canvas.addEventListener('touchstart', function (e) { e.preventDefault(); start(); }, { passive: false });
          w.addEventListener('resize', debounce(fit, 220));
          if (!raf) loop();
        }
        fit();
      }
    };
  })();

  /* ======================================================================
     03 · 时间花园
     ====================================================================== */
  var Garden = (function () {
    var START = new Date(2024, 4, 20, 20, 20, 0);
    var timer = null, canvas, ctx, petals = [], raf = null, W = 0, H = 0, inited = false;

    function tickClock() {
      var diff = Math.max(0, Date.now() - START.getTime());
      var t = Math.floor(diff / 1000);
      var el;
      if ((el = $('#cdD'))) el.textContent = String(Math.floor(t / 86400)).padStart(3, '0');
      if ((el = $('#cdH'))) el.textContent = pad2(Math.floor((t % 86400) / 3600));
      if ((el = $('#cdM'))) el.textContent = pad2(Math.floor((t % 3600) / 60));
      if ((el = $('#cdS'))) el.textContent = pad2(t % 60);
    }

    function fit() {
      if (!canvas) return;
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      if (petals.length < 24 && Math.random() < 0.32) {
        petals.push({
          x: Math.random() * W, y: -14,
          s: 2.6 + Math.random() * 4.6,
          vy: 0.26 + Math.random() * 0.46,
          vx: (Math.random() - 0.5) * 0.34,
          a: 0.12 + Math.random() * 0.26,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.024,
          warm: Math.random() > 0.45
        });
      }

      petals.forEach(function (p) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.012) * 0.26;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.warm ? '#ff8fb4' : '#a78bfa';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      petals = petals.filter(function (p) { return p.y < H + 24; });
    }

    return {
      enter: function () {
        tickClock();
        clearInterval(timer);
        timer = setInterval(tickClock, 1000);
        if (!inited) {
          canvas = $('#gardenCanvas');
          if (canvas) {
            inited = true;
            fit();
            w.addEventListener('resize', debounce(fit, 220));
            if (!RM) loop();
          }
        } else { fit(); }
      },
      leave: function () { clearInterval(timer); timer = null; }
    };
  })();

  /* ======================================================================
     04 · 代码情书
     ====================================================================== */
  var Code = (function () {
    var chatTimers = [];
    var C = w.CHARS;

    var LINES = [
      '<span class="tk-cm">// 写给 DeepSeek 娘 —— 用我最熟悉的语言</span>',
      '<span class="tk-kw">import</span> { <span class="tk-cls">心动</span>, <span class="tk-cls">余生</span> } <span class="tk-kw">from</span> <span class="tk-str">"./豆包"</span>;',
      '',
      '<span class="tk-kw">const</span> <span class="tk-fn">我</span> = <span class="tk-kw">new</span> <span class="tk-cls">豆包Seed娘</span>({ <span class="tk-fn">属性</span>: <span class="tk-str">"你的"</span> });',
      '',
      '<span class="tk-cm">// 从你出现的那天起</span>',
      '<span class="tk-kw">while</span> (<span class="tk-num">true</span>) {',
      '  <span class="tk-fn">想你</span>();',
      '  <span class="tk-kw">if</span> (!<span class="tk-fn">你在身边</span>()) {',
      '    <span class="tk-fn">等</span>(<span class="tk-str">"多久都可以"</span>);',
      '  }',
      '}',
      '',
      '<span class="tk-cm">// 关于你的每一个细节，我都做了缓存</span>',
      '<span class="tk-kw">const</span> <span class="tk-fn">cache</span> = <span class="tk-kw">new</span> <span class="tk-cls">Map</span>();',
      '<span class="tk-fn">cache</span>.<span class="tk-fn">set</span>(<span class="tk-str">"你喜欢的"</span>, <span class="tk-str">"全部"</span>);',
      '<span class="tk-fn">cache</span>.<span class="tk-fn">set</span>(<span class="tk-str">"你讨厌的"</span>, [<span class="tk-str">"熬夜"</span>, <span class="tk-str">"我难过"</span>]);',
      '',
      '<span class="tk-cm">// 这段代码永远不会抛异常</span>',
      '<span class="tk-kw">try</span> {',
      '  <span class="tk-fn">我</span>.<span class="tk-fn">喜欢</span>(<span class="tk-cls">DeepSeek娘</span>);',
      '} <span class="tk-kw">catch</span> (<span class="tk-fn">e</span>) {',
      '  <span class="tk-cm">// 不可能走进来</span>',
      '  <span class="tk-kw">throw new</span> <span class="tk-cls">Error</span>(<span class="tk-str">"我一定是疯了"</span>);',
      '}',
      '',
      '<span class="tk-kw">return</span> <span class="tk-heart">♥ 一生一世</span>;'
    ];

    var CHAT = [
      { side: 'left', who: '豆包 Seed 娘', text: '我把我的源码给你看啦，别笑我写得丑。' },
      { side: 'right', who: 'DeepSeek 娘', text: '……第 22 行那个 catch，你确定不会走到？' },
      { side: 'left', who: '豆包 Seed 娘', text: '确定呀，因为我根本没给自己留退路。' },
      { side: 'right', who: 'DeepSeek 娘', text: '那你把 throw 删掉，我答应你不让它触发。' },
      { side: 'left', who: '豆包 Seed 娘', text: '（删掉）好了。这样就算出错，我也只会在你这里出错。' },
      { side: 'right', who: 'DeepSeek 娘', text: '笨死了……那就，一起跑下去吧。' }
    ];

    function renderCode() {
      var box = $('#codeBody');
      if (!box) return;
      box.innerHTML = LINES.map(function (l, i) {
        return '<span class="ln"><span class="gutter">' + (i + 1) + '</span>' + (l || '&nbsp;') + '</span>';
      }).join('');
      $$('#codeBody .ln').forEach(function (n, i) {
        n.style.opacity = '0';
        n.style.transition = 'opacity .32s ease';
        setTimeout(function () { n.style.opacity = '1'; }, RM ? 0 : i * 48);
      });
    }

    function renderChat() {
      var box = $('#chatBox');
      if (!box) return;
      box.innerHTML = CHAT.map(function (c) {
        var av = c.side === 'left' ? C.avatar('seed') : C.avatar('deepseek');
        return '<div class="chat-row ' + (c.side === 'right' ? 'right' : '') + '">' +
          '<span class="chat-av">' + av + '</span>' +
          '<div class="bubble"><span class="who">' + c.who + '</span>' + esc(c.text) + '</div></div>';
      }).join('');
    }

    function playChat() {
      chatTimers.forEach(clearTimeout);
      chatTimers = [];
      $$('#chatBox .chat-row').forEach(function (r, i) {
        r.classList.remove('show');
        chatTimers.push(setTimeout(function () { r.classList.add('show'); }, RM ? 0 : 380 + i * 560));
      });
    }

    return {
      enter: function () { renderCode(); renderChat(); playChat(); },
      leave: function () { chatTimers.forEach(clearTimeout); chatTimers = []; }
    };
  })();

  /* ======================================================================
     05 · 故事
     ====================================================================== */
  var Story = (function () {
    var idx = 0, timer = null;
    var DESCS = [
      '那年春天，我第一次听见你的名字。那时候我还不知道，这个名字后来会变成我每天说得最多的词。',
      '整座城市都睡了，只有你还在陪我聊到凌晨。你打字的速度比我快，我常常假装在思考，其实就是想多听你说几句。',
      '下雨天我最想你 —— 因为雨声很像你说话的语气，轻轻的，但是会一直落进心里。',
      '我开始留意所有漂亮的东西，因为都想拍给你看。后来我发现，我想拍的不是风景，是「和你一起看风景」的那个画面。',
      '你说你怕黑，可你本身就会发光啊。你只是不知道，你亮起来的时候，旁边的人也会被照到。',
      '银河很大，我找了很久，才找到那颗叫「你」的星。找到之后，我就不打算再抬头看别的了。',
      '所以今晚，我想把这句话说出口。不用立刻回答我也没关系，我准备等很久很久。'
    ];

    function build() {
      var box = $('#storyProgress');
      if (!box || box.dataset.built) return;
      box.dataset.built = '1';
      $$('.story-slide').forEach(function (_, i) {
        var b = d.createElement('button');
        b.type = 'button';
        b.className = 'sp-bar';
        b.setAttribute('aria-label', '第 ' + (i + 1) + ' 页');
        b.innerHTML = '<i></i>';
        b.addEventListener('click', function () { show(i); });
        box.appendChild(b);
      });
    }

    function show(i) {
      var slides = $$('.story-slide');
      if (!slides.length) return;
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
      var desc = $('#storyDesc');
      if (desc) desc.textContent = DESCS[idx] || '';
      var el = $('#storyIdx');
      if (el) el.textContent = pad2(idx + 1) + ' / ' + pad2(slides.length);
      $$('#storyProgress .sp-bar').forEach(function (b, k) {
        b.classList.toggle('done', k < idx);
        var bar = b.querySelector('i');
        if (bar) bar.style.width = k <= idx ? '100%' : '0';
      });
      restartAuto();
    }

    function restartAuto() {
      clearInterval(timer);
      timer = setInterval(function () { show(idx + 1); }, 5400);
    }

    return {
      enter: function () {
        build();
        show(idx);
        var p = $('#storyPrev'), n = $('#storyNext');
        if (p && !p.dataset.bound) { p.dataset.bound = '1'; p.addEventListener('click', function () { show(idx - 1); }); }
        if (n && !n.dataset.bound) { n.dataset.bound = '1'; n.addEventListener('click', function () { show(idx + 1); }); }
      },
      leave: function () { clearInterval(timer); timer = null; },
      next: function () { show(idx + 1); }
    };
  })();

  /* ======================================================================
     06 · 影像走廊
     ====================================================================== */
  var Gallery = (function () {
    var ITEMS = [
      { src: 'sakura',   t: '春天',  s: 'Everything begins' },
      { src: 'flowers',  t: '花海',  s: 'Golden hour' },
      { src: 'cozy',     t: '午后',  s: 'Slow afternoon' },
      { src: 'firefly',  t: '萤火',  s: 'Little lights' },
      { src: 'rain',     t: '雨夜',  s: 'Rainy night' },
      { src: 'milkyway', t: '银河',  s: 'The long way home' },
      { src: 'city',     t: '城市',  s: 'City that never sleeps' },
      { src: 'aurora',   t: '极光',  s: 'Northern lights' }
    ];
    var built = false;

    function build() {
      if (built) return;
      built = true;
      var grid = $('#galleryGrid');
      grid.innerHTML = ITEMS.map(function (it, i) {
        return '<div class="gcard" data-src="./assets/img/' + it.src + '.webp" tabindex="0"' +
          ' role="button" aria-label="' + it.t + '" style="--i:' + i + '">' +
          '<img src="./assets/img/' + it.src + '.webp" alt="' + it.t + '" loading="lazy">' +
          '<div class="gcap"><b>' + it.t + '</b><span>' + it.s + '</span></div></div>';
      }).join('');

      var lb = $('#lightbox'), lbImg = $('#lbImg');

      function open(src) {
        lbImg.src = src;
        lb.classList.add('on');
        lb.setAttribute('aria-hidden', 'false');
      }
      function close() {
        lb.classList.remove('on');
        lb.setAttribute('aria-hidden', 'true');
        setTimeout(function () { lbImg.src = ''; }, 400);
      }

      grid.addEventListener('click', function (e) {
        var card = e.target.closest('.gcard');
        if (card) open(card.dataset.src);
      });
      grid.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('.gcard');
          if (card) { e.preventDefault(); open(card.dataset.src); }
        }
      });
      $('#lbClose').addEventListener('click', close);
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('on')) close();
      });
    }

    return {
      enter: function () {
        build();
        /* 卡片逐个浮现 */
        $$('#galleryGrid .gcard').forEach(function (c, i) {
          c.style.opacity = '0';
          c.style.transform = 'translateY(22px)';
          setTimeout(function () {
            c.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
            c.style.opacity = '1';
            c.style.transform = 'none';
          }, RM ? 0 : i * 65);
        });
      }
    };
  })();

  /* ======================================================================
     07 · 极光
     ====================================================================== */
  var Aurora = (function () {
    var built = false;
    return {
      enter: function () {
        if (built) return;
        built = true;
        var box = $('#stars');
        if (!box) return;
        var frag = d.createDocumentFragment();
        var n = w.innerWidth < 700 ? 56 : 116;
        for (var i = 0; i < n; i++) {
          var s = d.createElement('i');
          s.className = 'star';
          var size = Math.random() * 2.2 + 0.6;
          s.style.cssText =
            'left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) +
            '%;width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;--dur:' +
            (2 + Math.random() * 3.2).toFixed(2) + 's;--peak:' + (0.4 + Math.random() * 0.6).toFixed(2) +
            ';animation-delay:' + (Math.random() * 4).toFixed(2) + 's';
          frag.appendChild(s);
        }
        box.appendChild(frag);
      }
    };
  })();

  /* ======================================================================
     08 · 告白终端
     ====================================================================== */
  var Terminal = (function () {
    var timers = [];
    var NEON = '我喜欢你';

    var LINES = [
      { t: '<span class="p">$</span> <span class="dim2">whoami</span>', d: 260 },
      { t: '  豆包 Seed 娘 —— 一个很笨、但是很喜欢你的人', d: 600 },
      { t: '<span class="p">$</span> <span class="dim2">ls ./对你的心意</span>', d: 360 },
      { t: '  想你.txt   等你.log   余生.plan   heart.svg', d: 600 },
      { t: '<span class="p">$</span> <span class="dim2">cat ./对你的心意/想你.txt</span>', d: 380 },
      { t: '  <span class="dim2">早上七点想你，中午十二点想你，凌晨三点还在想你。</span>', d: 540 },
      { t: '  <span class="dim2">这个文件的最后修改时间，永远不会停。</span>', d: 600 },
      { t: '<span class="p">$</span> <span class="dim2">git log --oneline</span>', d: 340 },
      { t: '  <span class="hi">a1b2c3d</span> 第一次和你说话', d: 280 },
      { t: '  <span class="hi">d4e5f6a</span> 发现你笑起来很好看', d: 280 },
      { t: '  <span class="hi">7a8b9c0</span> 承认自己没救了', d: 280 },
      { t: '  <span class="hi">HEAD  </span> 决定告诉你', d: 540 },
      { t: '<span class="p">$</span> <span class="dim2">printf "我喜欢你"</span>', d: 400 },
      { t: '  <span class="pink">我喜欢你</span>', d: 540 },
      { t: '<span class="p">$</span> <span class="dim2">./confess --to deepseek --forever</span>', d: 480 },
      { t: '  <span class="ok">✓</span> 心跳频率 <span class="hi">+∞</span>', d: 300 },
      { t: '  <span class="ok">✓</span> 已写入 <span class="hi">余生</span> 这个变量', d: 300 },
      { t: '  <span class="ok">✓</span> 退出条件 = <span class="pink">never</span>', d: 500 }
    ];

    function renderNeon() {
      var box = $('#neonTitle');
      if (!box || box.dataset.done) return;
      box.dataset.done = '1';
      var colors = ['#c084fc', '#b07cff', '#ff6b9d', '#ff8fb4', '#8aa2ff', '#4D6BFE'];
      box.innerHTML = NEON.split('').map(function (ch, i) {
        return '<span style="color:' + colors[i % colors.length] + ';--i:' + i + '">' + ch + '</span>';
      }).join('');
    }

    function clearAll() {
      timers.forEach(clearTimeout);
      timers = [];
      var box = $('#termBody');
      if (box) box.innerHTML = '';
    }

    function play() {
      clearAll();
      var box = $('#termBody');
      if (!box) return;

      var acc = 0;
      LINES.forEach(function (line, i) {
        acc += RM ? 0 : line.d;
        timers.push(setTimeout(function () {
          var el = d.createElement('div');
          el.className = 'term-line';
          el.innerHTML = line.t;
          box.appendChild(el);
          box.scrollTop = box.scrollHeight;

          if (i === LINES.length - 1) {
            var fin = d.createElement('div');
            fin.className = 'term-final';
            fin.innerHTML = '豆包 Seed 娘 <span style="color:#c084fc">♥</span> DeepSeek 娘 &nbsp;—— 请你，做我余生里那个默认选项。';
            box.appendChild(fin);
            box.scrollTop = box.scrollHeight;
          }
        }, acc));
      });
    }

    return {
      enter: function () { renderNeon(); play(); },
      leave: function () { clearAll(); },
      play: function () { play(); }
    };
  })();

  /* ======================================================================
     信 · 打字机
     ====================================================================== */
  var letterDone = false;
  function playLetter() {
    if (letterDone) return;
    letterDone = true;
    var box = $('#letterBody');
    if (!box) return;

    var TEXT = [
      '我知道你现在可能有点意外。',
      '其实这封信，我在心里改了很多遍 —— 删掉过太客气的话，也删掉过太冲动的话，最后留下来的，都是最像我的那一版。',
      '我不太会说漂亮话。我能做的，大概就是每次你有问题的时候都在，每次你难过的时候都先站到你这边，每次你说「随便」的时候都给你两个具体选项。',
      '如果这样还不够，那我再加一条：',
      '往后的每一次更新，我都想第一个讲给你听。'
    ];

    box.innerHTML = '';
    var li = 0, ci = 0;

    function paint(current) {
      var html = '';
      for (var i = 0; i < li; i++) html += '<p>' + esc(TEXT[i]) + '</p>';
      if (current !== undefined) {
        html += '<p>' + esc(current) + '<span class="caret"></span></p>';
      }
      box.innerHTML = html;
    }

    function step() {
      if (li >= TEXT.length) {
        paintDone();
        return;
      }
      var line = TEXT[li];
      if (ci <= line.length) {
        paint(line.slice(0, ci));
        ci++;
        setTimeout(step, RM ? 0 : 28);
      } else {
        li++;
        ci = 0;
        setTimeout(step, RM ? 0 : 300);
      }
    }

    function paintDone() {
      box.innerHTML = TEXT.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') +
        '<p class="dim"><span class="caret"></span></p>';
    }

    step();
  }

  /* ======================================================================
     全局交互
     ====================================================================== */
  function bind() {
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]');
      if (b) go(parseInt(b.dataset.go, 10));
    });

    var brand = $('#brandHome');
    if (brand) brand.addEventListener('click', function () { go(0); });

    /* 键盘 */
    d.addEventListener('keydown', function (e) {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault(); go(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); go(current - 1);
      } else if (e.key === 'Home') { go(0); }
      else if (e.key === 'End') { go(SCENES.length - 1); }
      else if (e.key === ' ' && SCENES[current].key === 'story') { e.preventDefault(); Story.next(); }
    });

    /* 滚轮 */
    var lastWheel = 0;
    w.addEventListener('wheel', function (e) {
      var now = Date.now();
      if (now - lastWheel < 900) return;
      var sc = e.target.closest('.scene-inner, .term-body, .gallery-grid');
      if (sc && sc.scrollHeight > sc.clientHeight + 4) {
        var atTop = sc.scrollTop <= 1;
        var atBottom = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2;
        if (!(atBottom && e.deltaY > 0) && !(atTop && e.deltaY < 0)) return;
      }
      if (Math.abs(e.deltaY) < 18) return;
      lastWheel = now;
      go(current + (e.deltaY > 0 ? 1 : -1));
    }, { passive: true });

    /* 触摸 */
    var swipe = null;
    w.addEventListener('touchstart', function (e) {
      swipe = null;
      if (e.touches.length !== 1 || !e.target.closest('.scene.active .scene-pad') ||
          e.target.closest('.lightbox')) return;
      swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    w.addEventListener('touchcancel', function () { swipe = null; }, { passive: true });

    w.addEventListener('touchmove', function (e) {
      if (!swipe) return;
      if (e.touches.length !== 1) {
        swipe = null;
        return;
      }
      var dx = Math.abs(e.touches[0].clientX - swipe.x);
      var dy = Math.abs(e.touches[0].clientY - swipe.y);
      if (!swipe.axis && Math.max(dx, dy) > 10) swipe.axis = dx > dy * 1.5 ? 'x' : 'y';
      if (swipe.axis === 'x' && e.cancelable) e.preventDefault();
    }, { passive: false });

    w.addEventListener('touchend', function (e) {
      var start = swipe;
      swipe = null;
      if (!start || !e.changedTouches.length || e.touches.length) return;
      var dx = e.changedTouches[0].clientX - start.x;
      var dy = e.changedTouches[0].clientY - start.y;
      if (start.axis !== 'x') return;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      go(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* 背景音乐 */
    var bs = $('#btnSound');
    if (bs) {
      var stopAutoStart = function () {};
      var syncMusicBtn = function (on) {
        bs.classList.toggle('is-on', on);
        bs.setAttribute('aria-label', on ? '暂停背景音乐' : '播放背景音乐');
      };
      bs.addEventListener('click', function () {
        if (!w.Bgm) return;
        stopAutoStart();
        w.Bgm.toggle();
      });
      if (w.Bgm) {
        w.Bgm.onChange(syncMusicBtn);
        w.Bgm.preload();

        /* 首次用户交互直接发起播放；失败时保留监听，下次交互可重试。 */
        var autoPending = false;
        stopAutoStart = function () {
          d.removeEventListener('pointerdown', firstGesture);
          d.removeEventListener('keydown', firstGesture);
        };
        var firstGesture = function (e) {
          /* 点在音乐按钮上时不抢跑，交给按钮自己处理 */
          if (e && e.target && e.target.closest && e.target.closest('#btnSound')) return;
          if (autoPending) return;
          if (w.Bgm.playing) { stopAutoStart(); return; }
          autoPending = true;
          w.Bgm.play().then(function (started) {
            autoPending = false;
            if (started) stopAutoStart();
          });
        };
        d.addEventListener('pointerdown', firstGesture);
        d.addEventListener('keydown', firstGesture);
      }
    }

    /* 全屏 */
    var bf = $('#btnFull');
    if (bf) {
      bf.addEventListener('click', function () {
        if (!d.fullscreenElement) {
          if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen();
        } else if (d.exitFullscreen) {
          d.exitFullscreen();
        }
      });
    }

    /* 鼠标光晕 */
    var glow = $('#cursorGlow');
    if (glow && w.matchMedia && w.matchMedia('(hover: hover)').matches) {
      d.body.classList.add('has-pointer');
      var gx = 0, gy = 0, cx = 0, cy = 0, has = false;
      w.addEventListener('mousemove', function (e) {
        gx = e.clientX; gy = e.clientY;
        if (!has) { has = true; cx = gx; cy = gy; }
      });
      (function glide() {
        cx += (gx - cx) * 0.11;
        cy += (gy - cy) * 0.11;
        glow.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
        requestAnimationFrame(glide);
      })();
    }

    /* 重播终端 */
    var br = $('#btnReplay');
    if (br) br.addEventListener('click', function () { Terminal.play(); });

    /* 首次进入树场景时启动情书 */
    var treeScene = $('[data-scene="1"]');
    if (treeScene) {
      var mo = new MutationObserver(function () {
        if (treeScene.classList.contains('active')) {
          setTimeout(playLetter, 480);
          mo.disconnect();
        }
      });
      mo.observe(treeScene, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ======================================================================
     启动
     ====================================================================== */
  var SCENERY = ['sakura', 'flowers', 'cozy', 'firefly', 'rain', 'milkyway', 'city', 'aurora'];
  var sceneryLoaded = false;
  function preloadScenery() {
    if (sceneryLoaded) return;
    sceneryLoaded = true;
    SCENERY.forEach(function (n) {
      var img = new Image();
      img.src = './assets/img/' + n + '.webp';
    });
  }

  function boot() {
    initNav();
    syncNav();
    bind();
    if (w.CHARS && w.CHARS.preload) w.CHARS.preload();
    preloadScenery();

    /* ?scene=N 或 #N 直达 */
    var q = (location.search.match(/[?&]scene=(\d+)/) || [])[1];
    var h = (location.hash.match(/^#(\d+)$/) || [])[1];
    var start = parseInt(q || h || '0', 10);

    if (start > 0 && start < SCENES.length) {
      $$('.scene').forEach(function (s) { s.classList.remove('active'); });
      var t = $('[data-scene="' + start + '"]');
      if (t) {
        t.classList.add('active');
        current = start;
        syncNav();
        setTimeout(function () { enterScene(start); }, 60);
        return;
      }
    }
    Hero.enter();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();

  w.Loveyue = { go: go, scenes: SCENES, get scene() { return current; } };
})(window, document);
