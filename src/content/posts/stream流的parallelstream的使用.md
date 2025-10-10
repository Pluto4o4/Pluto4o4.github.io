---
title: "stream流的parallelStream的使用"
description: "什么是parallelSream 多线程处理问题，除了使用使用线程池(ExecutorService)，很多人选择了parallelStream() 并行流，底层使用forkjoin实现并行处理。但是在使用并行流时需要注意一些坑，防止出现问题。  坑  线程不安全 使用parallelSream()时，如果涉及集合操作，需要注意使用线程安全的集合，例如hashMap，arraylist等。  使"
pubDate: 2023-11-26T15:12:34.000Z
updatedDate: 2023-11-26T15:13:08.979Z
tags: ["java", "并发流"]
draft: false
---

## [](#什么是parallelsream)什么是parallelSream

多线程处理问题，除了使用使用**线程池(ExecutorService)**，很多人选择了**parallelStream()**并行流，底层使用**forkjoin**实现并行处理。但是在使用并行流时需要注意一些坑，防止出现问题。

## [](#坑)坑
### [](#线程不安全)线程不安全

使用parallelSream()时，如果涉及集合操作，需要注意使用线程安全的集合，例如hashMap，arraylist等。

### [](#使用公共线程池)使用公共线程池

parallelStream()底层用的ForkJoinPool.commonPool();进行并行计算。代码中多个脚本同时用到parallelStream时，会共用线程池，一个脚本io慢，其他脚本都等等，用到的脚本越多，卡的时间越长。

#### [](#并行代码中threadlocal失效)并行代码中Threadlocal失效

java开发中，我们经常会用到Threadlocal。parallelStream()是一个隐式线程池，比如：读写分离的连接名称、request通用获取等等，并行代码块中都将失效。