---
title: "基于Spring自动注入实现的策略模式"
description: "学习如何使用 Spring 自动注入实现策略模式"
published: 2023-10-25
tags: ["Spring", "设计模式"]
draft: false
---

## 实现策略

```java
public interface ActionStrategy {
    void do();
}
```

```java
@Service
public class DineAction implements ActionStrategy {
    @Override
    public void do() {
        System.out.println("吃饭");
    }
}
```

```java
@Service
public class SleepAction implements ActionStrategy {
    @Override
    public void do() {
        System.out.println("睡觉");
    }
}
```

```java
@Service
public class PlayGameAction implements ActionStrategy {
    @Override
    public void do() {
        System.out.println("打游戏");
    }
}
```

## 策略枚举类

```java
public enum ActionStrategyEnum {
    DINE_ACTION("吃饭", "dineAction"),
    SLEEP_ACTION("睡觉", "sleepAction"),
    PLAY_GAME_ACTION("打游戏", "playGameAction");

    private String action;
    private String beanName;

    ActionStrategyEnum(String action, String beanName) {
        this.action = action;
        this.beanName = beanName;
    }

    public static String getBeanNameByName(String action) {
        if (StringUtils.isBlank(action)) {
            return StrUtil.EMPTY;
        }
        for (ActionStrategyEnum value : ActionStrategyEnum.values()) {
            if (action.equals(value.action)) {
                return value.beanName;
            }
        }
        return StrUtil.EMPTY;
    }
}
```

## 选择策略类

```java
@Service
public class ChooseActionStrategy {
    // 利用spring自动注入，将实现类映射为名字和实体类
    @Resource
    private Map<String, ActionStrategy> actionStrategyMap;

    public ActionStrategy getStrategy(String actionName) {
        String beanName = ActionStrategyEnum.getBeanNameByName(actionName);
        return actionStrategyMap.get(beanName);
    }
}
```

## 使用

```java
public class Strategy {
    @Resource
    private ChooseActionStrategy chooseStrategy;

    public void demo() {
        String[] actions = {"吃饭", "睡觉", "打游戏"};
        for (String action : actions) {
            ActionStrategy actionStrategy = chooseStrategy.getStrategy(action);
            if (Objects.isNull(actionStrategy)) {
                return;
            }
            actionStrategy.do();
        }
    }
}
```