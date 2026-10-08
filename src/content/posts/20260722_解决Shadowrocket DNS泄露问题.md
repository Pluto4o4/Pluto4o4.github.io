---
title: "20260722_解决 Shadowrocket DNS 泄露问题"
published: 2026-07-22
---

# 20260722\_解决 Shadowrocket DNS 泄露问题

## 前情提要

用了很多小火箭的配置，发现都有 dns 泄露的问题，但是只要一用分组的规则，需要判断是否是海外域名就会出现 dns 泄露，我百思不得其解。最近在 youtube 上看到了小火箭防 dns 泄露的视频，博主把 dns 解析服务器全配置为 cloudflare，dns 泄露问题就解决了，我恍然大明白，然后看了之前用的 lazy.config 或者其他小火箭的分流配置，dns 服务器都用了阿里的或者国内的，只要用他们都 dns 解析就必定会被泄露，我立马配上，删掉了国内的 dns 解析服务器，果然再运行 dns 检查就完美无缺，没有泄露一点儿。但是带来另一个问题，发现部分国内应用图片加载非常慢甚至失败，或者一些应用网络也出现了问题，全部走海外 dns 解析，国内的应用使用体验就会有很多问题，再研究了一番，小火箭本身没有 dns 分流的配置，但是可以通过配置文件中的`dns-direct-system=true` 这个配置开启，意思是命中直连规则的域名通过系统的 dns 解析，不会走海外 dns 解析服务器，海外域名直接走海外 dns 解析服务器，这样既不会 dns 泄露，国内访问也不会出现问题

## 配置

### 第一步 配置 dns 解析

在小火箭的配置里，`通用`->`dns覆写` 全部换成海外 dns 解析服务,阿里腾讯的全删掉，备用也删掉

```sh
https://cloudflare-dns.com/dns-query#proxy
https://security.cloudflare-dns.com/dns-query#proxy
https://dns.google/dns-query#proxy
```

配置劫持 dns

```sh
8.8.8.8:53
8.8.4.4:53
```

### 第二步 配置文件开启 dns 分流

`长按配置文件`->`编辑纯文本`，添加以下配置

```sh
dns-direct-system=true
```

### 第三步 测试 dns

在网站 `https://ipleak.net` 测试

## 推荐配置

站内有许多比较好配置了，可以用以下几个，我是模块规则和懒人混用，模块规则优先级比配置高，所以用了配置就不要开模块的 `proxy`,否则分流会失效，然后再改一下这些规则里的 dns 配置，就可以正常使用了

### 1. 站内佬的配置

https://linux.do/t/topic/1661947

### 2.模块规则

<https://github.com/GMOogway/shadowrocket-rules>

### 3.懒人规则

<https://github.com/LOWERTOP/Shadowrocket>
