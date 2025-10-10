---
title: "mysql explan的使用"
description: "1.作用  表的读取顺序 数据读取操作的操作类型 哪些索引可以使用 哪些索引被实际使用 表之间的引用 每张表有多少行被优化器查询   2.使用方式 explain+sql语句 结果字段如下：    id select_type table type possible_keys key_len ref rows extra      2.1 字段含义 id: 表示执行select子句或操作表的顺序"
published: 2023-11-11
tags: ["mysql", "sql优化"]
draft: false
---

## [](#1作用)1.作用
- 表的读取顺序
- 数据读取操作的操作类型
- 哪些索引可以使用
- 哪些索引被实际使用
- 表之间的引用
- 每张表有多少行被优化器查询

## [](#2使用方式)2.使用方式

explain+sql语句

结果字段如下：
idselect_typetabletypepossible_keyskey_lenrefrowsextra
### [](#21-字段含义)2.1 字段含义

`id`: 表示执行select子句或操作表的顺序
id的三种情况：

- id相同—由上至下顺序执行
- id不同—序号越高优先级越大
- 以上两种情况同时存在—相同的部分由上至下依次执行，不同的部分优先级越大越先执行

`select_type`:表示查询的类型，主要区别在于普通查询、联合查询、子查询等
有六种结果

- 

SIMPLE 简单的select查询，查询中不包含子查询或者UNION

- 

PRIMARY 查询中若包含任何复杂的子部分，最外层查询则被标记为PRIMARY

- 

SUBQUERY 在SELECT或WHERE列表中包含了子查询

- 

DERIVED 在FROM列表中包含的子查询被标记为DERIVED（衍生），MySQL会递归执行这些子查询，把结果放在临时表中

- 

UNION 若第二个SELECT出现在UNION之后，则被标记为UNION：若UNION包含在FROM子句的子查询中，外层SELECT将被标记为：DERIVED

- 

UNION RESULT 从UNION表获取结果的SELECT

`table`:执行的表

`type`: 表示查询使用了哪些类型

```none
system > const > eq_ref > ref > range > index > all
```

一般需要到达range，最好到ref

- **system**表只有一行记录（等于系统表），这是const类型的特列，平时不会出现，这个也可以忽略不计
- **const**表示通过索引一次就找到了，const用于比较primary key 或者unique索引。因为只匹配一行数据，所以很快。如将主键置于where列表中，MySQL就能将该查询转换为一个常量。
- **eq_ref**唯一性索引扫描，对于每个索引键，表中只有一条记录与之匹配。常见于主键或唯一索引扫描
- **ref**非唯一性索引扫描，返回匹配某个单独值的所有行，本质上也是一种索引访问，它返回所有匹配某个单独值的行，然而，它可能会找到多个符合条件的行，所以他应该属于查找和扫描的混合体。
- **range**只检索给定范围的行，使用一个索引来选择行，key列显示使用了哪个索引，一般就是在你的where语句中出现between、< 、>、in等的查询，这种范围扫描索引比全表扫描要好，因为它只需要开始于索引的某一点，而结束于另一点，不用扫描全部索引。
- **index**Full Index Scan，Index与All区别为index类型只遍历索引树。这通常比ALL快，因为索引文件通常比数据文件小。（也就是说虽然all和Index都是读全表，但index是从索引中读取的，而all是从硬盘读取的）
- **all**Full Table Scan 将遍历全表以找到匹配的行

`possible_keys`:显示可能应用在这张表中的索引
`key`: 实际使用的索引
`key_len`:表示索引中的字节数，可通过该列计算查询中使用的索引长度，在不损失精确度的情况下，长度越短越好。
`ref`: 显示索引的哪列被使用。
`rows`: 估算所需记录所需读取的行数

`extra`:额外信息

- using filesort  mysql无法利用索引完成排序操作，需要使用一个外部的索引排序
- using temporary 使用了临时表保存中间结果
- using index 表示select操作中覆盖了索引,避免了访问表的数据行
- using where 使用了where过滤
- using join buffer 表明使用了连接缓存，例如在查询的时候，多表join的次数非常多，可以将join buffer调大一些
- impossible where where子句的值总是false，不能获取任何元组
- select tables optimized away
- distinct 优化distinct操作，在找到第一匹配的元组后即停止找同样值的动作。