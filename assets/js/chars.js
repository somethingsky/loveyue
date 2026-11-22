/* ==========================================================================
   Character assets — 豆包 Seed 娘 × DeepSeek 娘
   素材来源: lXiaoSel1/AI-Buddy (CC BY-NC-SA 4.0 / 项目生成)
   详见 README-CREDITS.md
   ========================================================================== */
(function (w) {
  'use strict';

  var BASE = './assets/img/chars/';

  /* 角色定义 */
  var ROLES = {
    seed: {
      key: 'seed',
      name: '豆包 Seed 娘',
      short: '豆包',
      full: BASE + 'seed-full.webp',
      chibi: BASE + 'seed-chibi.webp',
      head: BASE + 'seed-head.webp',
      bg: BASE + 'bg-seed.webp',
      color: '#a855f7',
      colorSoft: '#c9a4ff',
      tint: '168, 85, 247'
    },
    deepseek: {
      key: 'deepseek',
      name: 'DeepSeek 娘',
      short: '深蓝',
      full: BASE + 'deepseek-full.webp',
      chibi: BASE + 'deepseek-chibi.webp',
      head: BASE + 'deepseek-head.webp',
      bg: BASE + 'bg-deepseek.webp',
      color: '#4d6bfe',
      colorSoft: '#8aa2ff',
      tint: '77, 107, 254'
    }
  };

  /* 表情图片 */
  function expr(role, emotion) {
    return BASE + role + '-' + (emotion || 'cheerful') + '.webp';
  }

  /* ---------- 立绘（全尺寸，用于 Hero / 场景主视觉） ---------- */
  function figure(role, opts) {
    opts = opts || {};
    var r = ROLES[role];
    var emo = opts.emotion || 'cheerful';
    var src = opts.chibi ? r.chibi : expr(role, emo);
    var alt = r.name;
    return (
      '<img class="char-fig char-fig-' +
      role +
      '" src="' +
      src +
      '" alt="' +
      alt +
      '" draggable="false" decoding="async"' +
      (opts.eager ? '' : ' loading="lazy"') +
      '>'
    );
  }

  /* ---------- 头像（圆形裁切用） ---------- */
  function avatar(role, size) {
    var r = ROLES[role];
    return (
      '<img class="char-av char-av-' +
      role +
      '" src="' +
      r.head +
      '" alt="' +
      r.name +
      '" draggable="false" decoding="async"' +
      (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') +
      '>'
    );
  }

  /* ---------- 兼容旧接口（返回 SVG 的地方已改为图片） ---------- */
  function legacy(kind) {
    if (kind === 'doubao' || kind === 'db') return figure('seed');
    if (kind === 'deepseek' || kind === 'ds') return figure('deepseek');
    return '';
  }

  /* ---------- 预加载 ---------- */
  function preload() {
    var list = [
      ROLES.seed.full,
      ROLES.deepseek.full,
      ROLES.seed.chibi,
      ROLES.deepseek.chibi,
      ROLES.seed.head,
      ROLES.deepseek.head,
      ROLES.seed.bg,
      ROLES.deepseek.bg
    ];
    ['cheerful', 'shy', 'serious', 'starry'].forEach(function (e) {
      list.push(expr('seed', e), expr('deepseek', e));
    });
    list.forEach(function (src) {
      var img = new Image();
      img.src = src;
    });
  }

  w.CHARS = {
    ROLES: ROLES,
    figure: figure,
    avatar: avatar,
    expr: expr,
    preload: preload,
    /* 旧接口向后兼容 */
    doubao: figure('seed', { chibi: true, emotion: 'cheerful' }),
    deepseek: figure('deepseek', { chibi: true, emotion: 'cheerful' }),
    get avatarFn() {
      return avatar;
    }
  };
})(window);
