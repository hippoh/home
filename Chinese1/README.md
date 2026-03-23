# 古籍全文阅读站

一个纯静态的网站，现已整合：

- 《声律启蒙》
- 《幼学琼林》
- 《世说新语》
- 《唐诗三百首》
- 《古文观止》

主要功能：

- 五部古籍共用一套阅读器
- 统一视觉系统，但每部书有独立色调
- 《世说新语》保留原有“分门逐则 + 译文切换”结构
- 每部书都有打印排版页 `print.html`
- 每部书都有整书 PDF
- 每部书都可导出当前章节/卷/诗体的 PDF

## 使用

1. 生成站点数据：

```bash
python3 scripts/build_library.py
```

2. 直接打开：

- `/Users/hippoh/Desktop/code/古文/index.html`

或运行静态服务器：

```bash
python3 -m http.server 8000
```

3. 生成 PDF：

```bash
.venv/bin/python scripts/build_pdf.py
```

## 数据文件

- 总数据：`data/library.json`
- 分书数据：`data/books/*.json`
- 前端入口：`assets/data.js`

## 来源说明

- 《世说新语》原文与译文整理自国学梦页面缓存。
- 《声律启蒙》《幼学琼林》《古文观止》原文整理自维基文库 EPUB。
- 《唐诗三百首》原序整理自维基文库，诗文主体整理自 Project Gutenberg 电子文本。

## 备注

- 古籍原文均来自公有领域文本或开放整理版本。
- 当前只有《世说新语》带白话译文切换。
- 《唐诗三百首》所用电子文本共 320 首，按源文本原样收录。
