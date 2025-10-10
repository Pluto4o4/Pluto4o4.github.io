---
title: "hexo-butterfly主题代码高亮设置"
description: "参考文章 自定義代碼配色 | Butterfly Hexo博客：六、prism代码高亮 - 简书  prism代码高亮 在使用butterfly自带的代码高亮中发现有些代码不高亮，因此在网上找代码高亮方案，发现了使用prism的代码高亮，但是没有在butterfly中使用的教程，经过一段时间的摸索，终于能够使用，记录下在butterly主题中使用prism代码高亮的方法。  在根目录_conf"
published: 2022-09-22
tags: ["hexo", "代码高亮"]
draft: false
---

## [](#参考文章)参考文章

[自定義代碼配色 | Butterfly](https://butterfly.js.org/posts/b37b5fe3/#%E4%B8%8B%E8%BC%89%E5%92%8C%E4%BF%AE%E6%94%B9CSS%E6%96%87%E4%BB%B6-1)

[Hexo博客：六、prism代码高亮 - 简书](https://www.jianshu.com/p/f395d92a1110)

## [](#prism代码高亮)prism代码高亮

在使用butterfly自带的代码高亮中发现有些代码不高亮，因此在网上找代码高亮方案，发现了使用prism的代码高亮，但是没有在butterfly中使用的教程，经过一段时间的摸索，终于能够使用，记录下在butterly主题中使用prism代码高亮的方法。

### [](#在根目录_configyml中修改配置)在根目录`_config.yml`中修改配置
```yaml
highlight:#关闭自带的代码高亮enable:falseline_number:falseauto_detect:falsetab_replace:''wrap:falsehljs:falseprismjs:enable:true#开启此设置preprocess:trueline_number:truetab_replace:''#在尾部添加以下代码marked:langPrefix:line-numbers language-
```

### [](#下载prism)下载prism

[官网](https://prismjs.com/download.html)

选择配置

- `themes`主题,随便选，后面要重新配置
- `Languages`需要高亮的语言，根据需要选择，觉得麻烦可以选`select/unselect all`全选
- `Plugins`以下是我选择的插件，显示语言和复制按钮主题都有，可以不选。
  - `line numbers`显示代码行数
  - `Show Language`显示语言，可以用主题自带的，两种显示可以共存
  - `toolbar`工具栏
  - `Copy to Clipboard Button`复制按钮，toolbar是前置

选择好后下载`js`和`css`文件

### [](#配置)配置

将下载好的`prism.js`和`prism.css`文件放入`/theme/butterfly/source/js/prism/`目录中`prism`目录需要自己创建。

编辑`prism.css`文件,在开头处添加下列代码

```yaml
:root{--hl-color:#ccc;          #代码框字体顔色【必须】--hl-bg:#2d2d2d;          #代码框背景色【必须】--hltools-bg:#323233;     #代码框顶部工具栏背景色【可选】--hltools-color:#fbf1c7;  #代码框顶部工具栏字体顔色【可选】--hlnumber-bg:#504945;    #代码框行数背景色【可选】--hlnumber-color:#fbf1c7; #代码框行数字体顔色【可选】--hlscrollbar-bg:#928374; #代码框滚动条顔色【可选】--hlexpand-bg:#d3af86;    #代码框底部展开背景色【可选】}
```

在`_config.butterfly.yml`文件中的`inject`处添加下面两个链接

```yaml
inject:head:-<link rel="stylesheet" href="/js/prism/prism.css">bottom:-<script src="/js/prism/prism.js" async></script>
```

### [](#重启查看是否生效)重启查看是否生效

![image-20220922171948463](https://i0.hdslb.com/bfs/album/13851671588b69c9a1a12eaef4ac2379aac77c8a.png)

配置好后发现之前的shell命令也能高亮，