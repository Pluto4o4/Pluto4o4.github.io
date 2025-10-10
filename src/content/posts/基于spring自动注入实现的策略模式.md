---
title: "基于Spring自动注入实现的策略模式"
description: "实现策略 public interface ActionStrategy()&amp;#123; 	 	void do(); &amp;#125; @Service public class DineAction implements ActionStrategy&amp;#123; 	@Override 	public void do()&amp;#123; 		System.out.print"
pubDate: 2023-10-25T12:50:31.000Z
updatedDate: 2023-11-29T16:43:20.324Z
tags: ["Spring", "设计模式"]
draft: false
---

## [](#实现策略)实现策略
```java
publicinterfaceActionStrategy(){voiddo();}
```

```java
@ServicepublicclassDineActionimplementsActionStrategy{@Overridepublicvoiddo(){System.out.println("吃饭");}}
```

```java
@ServicepublicclassSleepActionimplementsActionStrategy{@Overridepublicvoiddo(){System.out.println("睡觉");}}
```

```java
@ServicepublicclassPlayGameActionimplementsActionStrategy{@Overridepublicvoiddo(){System.out.println("打游戏");}}
```

## [](#策略枚举类)策略枚举类
```java
publicenumActionStrategyEnum{DINE_ACTION("吃饭","dineAction"),SLEEP_ACTION("睡觉","sleepAction"),PLAY_GAME_ACTION("打游戏","playGameAction");privateStringaction;privateStringbeanName;publicstaticStringgetBeanNameByName(Stringaction){if(StringUtils.isBlank(action)){returnStrUtil.EMPTY;}for(ActionStrategyEnumvalue:ActionStrategyEnum.values()){if(name.equals(value.name)){returnvalue.beanName;}}returnStrUtil.EMPTY;}}
```

## [](#选择策略类)选择策略类
```java
@ServicepublicclassChooseActionStrategy{//利用spring自动注入，将实现类映射为名字和实体类@ResourceprivateMap<String,ActionStrategy>actionStrategyMap;publicActionStrategygetStrategy(StringactionName){StringbeanName=ActionStrategyEnum.getBeanNameByName(actionName);returnactionStrategyMap.get(beanName);}}
```

## [](#使用)使用
```java
publicclassStrategy{@ResourceprivateChooseStrategychooseStrategy;publicvoiddemo(String[]actions){String[]actions={"吃饭","睡觉","打游戏"}for(Stringaction:actions){ActionStrategyactionStrategy=chooseStrategy.getAction(acion);if(Objects.isNull(actionStrategy)){return;}actionStrtegy.do();}}}
```