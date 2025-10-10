---
title: "CountDownLatch"
description: "作用 CountDownLatch典型的用法是将一个程序分为n个互相独立的可解决任务，并创建值为n的CountDownLatch。当每一个任务完成时，都会在这个锁存器上调用countDown，等待问题被解决的任务调用这个锁存器的await，将他们自己拦住，直至锁存器计数结束。  使用  CountDownLatch latch&#x3D;new CountDownLatch(10); for(in"
pubDate: 2023-11-20T13:03:38.000Z
updatedDate: 2023-11-29T16:45:51.575Z
tags: ["java", "JUC"]
draft: false
---

## [](#作用)作用

CountDownLatch典型的用法是将一个程序分为n个互相独立的可解决任务，并创建值为n的CountDownLatch。当每一个任务完成时，都会在这个锁存器上调用countDown，等待问题被解决的任务调用这个锁存器的await，将他们自己拦住，直至锁存器计数结束。

## [](#使用)使用
```java
CountDownLatchlatch=newCountDownLatch(10);for(inti=0;i<10;i++){executor.submit({try{System.out.println("use CountDownLatch");}finally{latch.countDown();}});}try{//设置超时时间，防止卡死latch.await(10,TimeUnit.SECONDS);}catch(Exceptione){throwe;}
```