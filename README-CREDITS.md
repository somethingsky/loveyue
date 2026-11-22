# 素材来源、许可与致谢

本项目的**角色图像**与**氛围摄影**均来自第三方，各有不同的许可条款。
以下是完整的来源链与使用限制，请在使用、修改或分发前仔细阅读。

---

## ⚠️ 一、使用限制速览

| 素材类型 | 许可 | 能否商用 | 能否闭源分发 |
|---------|------|---------|-------------|
| 角色图像（豆包 Seed 娘 / DeepSeek 娘） | CC BY-NC-SA 4.0 + 上游条款 | ❌ 不可以 | ❌ 不可以，须同许可 |
| 氛围摄影（Wikimedia Commons） | CC BY 2.0 / 3.0 / 4.0 / SA | ✅ 可以（须署名） | ✅ 可以（须署名） |
| 本项目代码（HTML/CSS/JS） | 见下方"代码"一节 | 见该节 | 见该节 |

**一句话**：角色图片只能**非商业**使用，且衍生作品必须以相同许可发布，
并保留完整的作者署名链。氛围图只需署名即可。

---

## 二、角色图像

### 2.1 来源仓库

本项目的角色立绘、表情差分、头像、Q 版与角色背景图，均取自：

- **仓库**：[lXiaoSel1 / AI-Buddy](https://github.com/lXiaoSel1/AI-Buddy)
- **具体路径**：`assets/card-games/p/`、`assets/card-games/b/`、`assets/card-games/pet/`、
  `assets/card-games/bg/`、`assets/theme/*/head.webp`

### 2.2 许可

该仓库 `licenses/upstream/LICENSE.md` 与 `THIRD_PARTY_NOTICES.md` 明确：

> The portrait and character illustration derivatives follow the character provenance above,
> including the upstream DeepSeek artwork's CC BY-NC-SA 4.0 terms where applicable.
> The code license does not relicense character artwork.

即：

- **DeepSeek 鲸鱼娘系列**：**CC BY-NC-SA 4.0**
  （署名—非商业性使用—相同方式共享 4.0 国际）
  许可全文：<https://creativecommons.org/licenses/by-nc-sa/4.0/>
- **豆包 Seed 娘**：该仓库声明其素材由项目方使用内置图像工具、以画廊角色设计为参考生成，
  > "a general redistribution license for all ten references has not been verified"
  >
  > —— 即**未经核实**存在通用的再分发许可。

  **因此本项目对 Seed 娘图像的使用属于个人非商业同人性质，不主张任何权利，
  也不授予他人任何权利。** 如需商业使用，请自行联系原作者取得授权。

### 2.3 DeepSeek 鲸鱼娘 · 完整署名链

以下链路由上游项目 `NOTICE.md` 明确要求保留：

1. **上善** —— 鲸鱼娘角色的原创作者
   - Pixiv：<https://www.pixiv.net/users/62155430>
   - Bilibili：<https://space.bilibili.com/4456176>
2. **ZipZipPipe** —— 加入 DeepSeek 元素的女仆装鲸鱼娘再设计者
   - Pixiv：<https://www.pixiv.net/users/18604994>
   - Bilibili：<https://space.bilibili.com/4168597>
3. **Small-tailqwq / dsh-deep-whale** —— `maid-atelier` 皮肤（深海宫殿背景、立绘、UI 装饰）的发布者
   - GitHub：<https://github.com/Small-tailqwq/dsh-deep-whale>
   - 目录：<https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/maid-atelier>
4. **JAdpp / dsh-whale-galgame** —— 制作了八张额外表情差分
   - GitHub：<https://github.com/JAdpp/dsh-whale-galgame>
5. **f0909172434 / dsh-deepseek-girl-pet** —— 桌宠图集（MIT），本项目使用了其 Q 版
   - GitHub：<https://github.com/f0909172434/dsh-deepseek-girl-pet>
   - 许可：MIT License, Copyright (c) 2026 f0909172434

### 2.4 本项目使用的角色文件对照

| 本项目文件 | 源文件（AI-Buddy） | 用途 |
|-----------|-------------------|------|
| `seed-full.webp` | `assets/card-games/p/seed.webp` | 序章左立绘 |
| `deepseek-full.webp` | `assets/card-games/p/deepseek.webp` | 序章右立绘 |
| `seed-chibi.webp` | `assets/card-games/pet/seed.webp` | 极光场景 Q 版 |
| `deepseek-chibi.webp` | `assets/card-games/pet/deepseek.webp` | 极光场景 Q 版 |
| `seed-head.webp` | `assets/theme/seed/head.webp` | 顶栏 / 信头 / 气泡头像 |
| `deepseek-head.webp` | `assets/theme/deepseek/head.webp` | 顶栏 / 信头 / 气泡头像 |
| `seed-{emotion}.webp` | `assets/card-games/b/seed-*.webp` | 表情差分（cheerful / shy / serious / starry / confused / angry） |
| `deepseek-{emotion}.webp` | `assets/card-games/b/deepseek-*.webp` | 同上 |
| `bg-seed.webp` | `assets/card-games/bg/seed.webp` | 时间花园场景背景 |
| `bg-deepseek.webp` | `assets/card-games/bg/deepseek.webp` | 告白终端场景背景 |

**本项目所做的修改**：仅做了等比缩放与 WebP 重新编码（质量 78–90），
未裁剪、未改色、未合成，未改变原始内容。

### 2.5 商标声明

DeepSeek、DeepSeek Harness、豆包、Seed 及相关名称与标识归各自所有者所有。
本项目为个人非商业同人作品，**不是**任何公司的官方产品，
未获得 DeepSeek、字节跳动或任何相关方的背书、授权或合作。

---

## 三、氛围摄影（Wikimedia Commons）

以下图片全部来自 [Wikimedia Commons](https://commons.wikimedia.org/)，
本项目做了等比缩放与 WebP 转码（质量 78–84），未做内容修改。

### 3.1 春天 · 樱花 — `sakura.webp`

- 原文件：[File:Pink cherry blossoms in Tuntorp 1.jpg](https://commons.wikimedia.org/wiki/File:Pink_cherry_blossoms_in_Tuntorp_1.jpg)
- 作者：**W.carter**
- 许可：**CC BY-SA 4.0**
- 项目内用途：故事幻灯片第 1 页、影像走廊

### 3.2 花海 — `flowers.webp`

- 原文件：[File:Flowers in sunset in Massachusetts.jpg](https://commons.wikimedia.org/wiki/File:Flowers_in_sunset_in_Massachusetts.jpg)
- 作者：**Alec Perkins**（Hoboken, USA）
- 许可：**CC BY 2.0**
- 项目内用途：故事幻灯片第 4 页、影像走廊

### 3.3 午后 — `cozy.webp`

- 原文件：[File:Cozy living room setup with a warm sofa, coffee cup, and an open book in a softly lit environment.jpg](https://commons.wikimedia.org/wiki/File:Cozy_living_room_setup_with_a_warm_sofa,_coffee_cup,_and_an_open_book_in_a_softly_lit_environment.jpg)
- 作者：**Shixart1985**
- 许可：**CC BY 2.0**
- 项目内用途：影像走廊

### 3.4 雨夜 — `rain.webp`

- 原文件：[File:Rainy Night (15425997189).jpg](https://commons.wikimedia.org/wiki/File:Rainy_Night_(15425997189).jpg)
- 作者：**Billie Grace Ward**（New York, USA）
- 许可：**CC BY 2.0**
- 项目内用途：故事幻灯片第 3 页、影像走廊

### 3.5 萤火 — `firefly.webp`

- 原文件：[File:The fairytale forest - Eastern fireflies (Luciola mingrelica) dance in the night in the forests of Mount Paggaio, Greece.jpg](https://commons.wikimedia.org/wiki/File:The_fairytale_forest_-_Eastern_fireflies_(Luciola_mingrelica)_dance_in_the_night_in_the_forests_of_Mount_Paggaio,_Greece.jpg)
- 作者：**Zsolyomi**
- 许可：**CC BY-SA 4.0**
- 项目内用途：故事幻灯片第 5 页、影像走廊

### 3.6 银河 — `milkyway.webp`

- 原文件：[File:Cut the Starry sky-Hehuan Mountain-LIAO,KUN-SHENG-9287.jpg](https://commons.wikimedia.org/wiki/File:Cut_the_Starry_sky-Hehuan_Mountain-LIAO,KUN-SHENG-9287.jpg)
- 作者：**X917052x**
- 许可：**CC BY-SA 4.0**
- 项目内用途：故事幻灯片第 6 页、影像走廊

### 3.7 星河 — `starry.webp`

- 原文件：[File:Tell her under the clear starry sky at Blue Mountains.JPG](https://commons.wikimedia.org/wiki/File:Tell_her_under_the_clear_starry_sky_at_Blue_Mountains.JPG)
- 作者：**Evonneyu**
- 许可：**CC BY-SA 4.0**
- 项目内用途：故事幻灯片第 7 页

### 3.8 城市 — `city.webp`

- 原文件：[File:On Top Of The City (181796621).jpeg](https://commons.wikimedia.org/wiki/File:On_Top_Of_The_City_(181796621).jpeg)
- 作者：**Jeremy Levin**
- 许可：**CC BY 3.0**
- 项目内用途：故事幻灯片第 2 页、影像走廊

### 3.9 极光 — `aurora.webp`

- 原文件：[File:Aurora and perseids.jpg](https://commons.wikimedia.org/wiki/File:Aurora_and_perseids.jpg)
- 作者：**Stephan Sprinz**
- 许可：**CC BY 4.0**
- 项目内用途：极光场景背景、影像走廊

---

## 四、字体

| 字体 | 许可 | 来源 |
|------|------|------|
| **Outfit** | SIL Open Font License 1.1 | [Google Fonts](https://fonts.google.com/specimen/Outfit) · via [`@fontsource/outfit`](https://www.npmjs.com/package/@fontsource/outfit) |
| **JetBrains Mono** | SIL Open Font License 1.1 | [JetBrains](https://www.jetbrains.com/lp/mono/) · via [`@fontsource/jetbrains-mono`](https://www.npmjs.com/package/@fontsource/jetbrains-mono) |

中文字体使用系统字体栈（PingFang SC / HarmonyOS Sans SC / Microsoft YaHei / Noto Sans SC），
不打包、不分发。

---

## 五、代码

`index.html`、`assets/css/*.css`、`assets/js/*.js`（`chars.js`、`audio.js`、`app.js`）
为本项目原创编写。

第三方代码依赖：**无**。
（`gsap.min.js` 与 `lenis.min.js` 曾作为候选下载，最终未使用，已从项目中移除。）

---

## 六、免责声明

- 本项目仅供**个人非商业**使用与学习交流。
- 本项目**不是** DeepSeek、字节跳动（豆包/Seed）、Small-tailqwq、JAdpp、lXiaoSel1
  或任何相关方的官方产品，未获其背书或授权。
- 如你是上述任一素材的权利人，认为本项目使用不当，请在仓库开 Issue 联系，
  会立即移除相关内容。
- 素材许可条款以其官方发布版本为准；本文档的概括性描述不构成法律意见。
