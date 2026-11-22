# 我的极光，只有你能点亮

> 豆包 Seed 娘 → DeepSeek 娘 · 八个场景的一封情书

一个纯静态的现代表白网站，由原 `loveyue` 系列（2014 年的八个老式表白页面）重制而来。

## 在线预览

直接双击 `index.html` 即可打开，无需构建、无需服务器。

也可以用任意静态服务器：

```bash
npx serve .
# 或
python -m http.server 8080
```

## 八个场景

| # | 场景 | 内容 |
|---|------|------|
| 01 | 序章 | 双人立绘 + 主标题，入口 |
| 02 | 心之树 | Canvas 粒子爱心树，点击种子生长开花 |
| 03 | 时间花园 | 实时跳动的在一起时长 + 里程碑卡片 |
| 04 | 代码情书 | 带语法高亮的表白源码 + 双人对话气泡 |
| 05 | 我们的故事 | 7 页图文幻灯片，自动播放 |
| 06 | 影像走廊 | 8 张氛围图网格，点击灯箱放大 |
| 07 | 极光 | 星空粒子 + 极光光带 + 双人 Q 版 |
| 08 | 告白终端 | 终端打字动画 + 霓虹标题 |

## 交互方式

- **点击** 底部圆点 / 右侧数字导航切换场景
- **滚轮** 上下翻页
- **手机** 上下滑动翻页
- **键盘** `→` `↓` `PageDown` 下一页，`←` `↑` `PageUp` 上一页，`Home` 回开头，`End` 到结尾
- **右上角** 环境音开关 / 全屏
- **URL 直达** `index.html?scene=3` 或 `index.html#3`

## 技术要点

- **零构建**，纯 HTML + CSS + 原生 JS
- **响应式**：桌面 / 平板 / 手机全适配，含安全区 `env(safe-area-inset-*)`
- **环境音**：Web Audio API 实时合成 Am–F–C–G 琶音 + 混响，默认静音，无版权素材
- **动效**：Canvas 粒子系统（爱心树 / 花瓣 / 星点）、CSS 动画、`prefers-reduced-motion` 降级
- **图片**：全部 WebP，按用途分级压缩

## 目录结构

```
loveyue-modern/
├── index.html
├── README.md
├── README-CREDITS.md          # 素材来源与许可（重要）
├── .gitignore
└── assets/
    ├── css/
    │   ├── base.css           # 设计令牌 / 背景 / 通用组件
    │   ├── shell.css          # 顶栏 / 导航 / 场景容器
    │   ├── chars.css          # 角色图片样式
    │   └── scenes.css         # 八个场景样式
    ├── js/
    │   ├── chars.js           # 角色资源定义
    │   ├── audio.js           # Web Audio 环境音合成
    │   └── app.js             # 场景控制与动效
    ├── fonts/                 # Outfit / JetBrains Mono（自托管）
    └── img/
        ├── chars/             # 角色立绘、表情、头像、背景
        └── *.webp             # 氛围图
```

## 版权与致谢

角色素材来自开源项目，**有明确的使用限制**（非商用 + 相同方式共享）。

请务必阅读 [README-CREDITS.md](./README-CREDITS.md) 后再使用或分发。

氛围图片来自 Wikimedia Commons，均为 CC BY / CC BY-SA / CC BY-NC-SA 授权，
具体作者与链接同样列在 [README-CREDITS.md](./README-CREDITS.md)。

## 声明

本项目为个人非商业作品，**不是** DeepSeek、字节跳动（豆包）或任何相关公司的官方产品，
未获其背书或授权。相关名称与商标归各自所有者所有。
