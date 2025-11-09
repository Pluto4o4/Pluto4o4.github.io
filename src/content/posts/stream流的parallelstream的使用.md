---
title: "stream流的parallelStream的使用"
description: "学习 parallelStream 并行流的使用和常见坑"
published: 2023-11-26
tags: ["java", "并发流"]
draft: false
---

## 什么是 parallelStream

多线程处理问题，除了使用**线程池(ExecutorService)**，很多人选择了**parallelStream()**并行流，底层使用**forkjoin**实现并行处理。但是在使用并行流时需要注意一些坑，防止出现问题。

## 坑

### 线程不安全

使用 parallelStream() 时，如果涉及集合操作，需要注意使用线程安全的集合，例如 HashMap、ArrayList 等。

### 使用公共线程池

parallelStream() 底层用的 ForkJoinPool.commonPool() 进行并行计算。代码中多个脚本同时用到 parallelStream 时，会共用线程池，一个脚本 IO 慢，其他脚本都等等，用到的脚本越多，卡的时间越长。

### 并行代码中 ThreadLocal 失效

Java 开发中，我们经常会用到 ThreadLocal。parallelStream() 是一个隐式线程池，比如：读写分离的连接名称、request 通用获取等等，并行代码块中都将失效。