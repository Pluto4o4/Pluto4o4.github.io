---
title: "CountDownLatch"
description: "学习 CountDownLatch 的用法和实际应用"
published: 2023-11-20
tags: ["java", "JUC"]
draft: false
---

## 作用

CountDownLatch 典型的用法是将一个程序分为 n 个互相独立的可解决任务，并创建值为 n 的 CountDownLatch。当每一个任务完成时，都会在这个锁存器上调用 countDown，等待问题被解决的任务调用这个锁存器的 await，将他们自己拦住，直至锁存器计数结束。

## 使用

```java
CountDownLatch latch = new CountDownLatch(10);
for (int i = 0; i < 10; i++) {
    executor.submit(() -> {
        try {
            System.out.println("use CountDownLatch");
        } finally {
            latch.countDown();
        }
    });
}

try {
    // 设置超时时间，防止卡死
    latch.await(10, TimeUnit.SECONDS);
} catch (Exception e) {
    throw e;
}
```