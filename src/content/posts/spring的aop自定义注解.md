---
title: "Spring的AOP+自定义注解"
description: "AOP  AOP定义 AOP （Aspect Orient Programming）,直译过来就是 面向切面编程,AOP 是一种编程思想，是面向对象编程（OOP）的一种补充。  AOP的使用场景  日志记录 事务管理 权限检验 性能监测   AOP核心概念  核心概念    名称 说明     Joinpoint 连接点，指可以被动态代理拦截目标类的方法   Pointcut 切入点,对Join"
pubDate: 2023-11-26T15:10:43.000Z
updatedDate: 2023-11-26T15:11:54.224Z
tags: ["java", "AOP", "自定义注解"]
draft: false
---

# [](#aop)AOP
## [](#aop定义)AOP定义

AOP （Aspect Orient Programming）,直译过来就是 面向切面编程,AOP 是一种编程思想，是面向对象编程（OOP）的一种补充。

## [](#aop的使用场景)AOP的使用场景
- 日志记录
- 事务管理
- 权限检验
- 性能监测

## [](#aop核心概念)AOP核心概念
### [](#核心概念)核心概念名称说明Joinpoint连接点，指可以被动态代理拦截目标类的方法Pointcut切入点,对Joinpoint进行拦截Advice通知，拦截到Joinpoint之后要做的事，切入增强内容｜Target目标，代理的目标对象Weaving植入，将增强代码应用到目标上，生成代理对象的过程Proxy代理，生成的代理对象Aspect切面，切入点和通知的结合
### [](#通知分类)通知分类通知说明｜before前置通知，通知方法在目标方法调用之前执行after后置通知，通知方法在目标方法返回或异常后调用after-returning返回后通知，通知方法会在目标方法返回后调用after-throwing抛出异常通知,通知方法回在目标方法抛出异常后调用around环绕通知，通知方法会将目标方法封装起来
### [](#aop获取常见参数)AOP获取常见参数

自定义注解

```java
@Target({ElementType.PARAMETER})@Retention(RetentionPolicy.RUNTIME)@Documentedpublic@interfaceFileParam{publicString[]suffix()default{"doc","xls","ppt","png","txt"};publicintsize()default1024;}
```

```java
@Component@AspectpublicclassAopTest{@Pointcut("execution(public * com.example.demo.Contrller.*(..))")privatevoidpointCut(){};@Before(value="pointCut()")publicvoidlogBefore(JoinPointjoinPoint){//方法名joinPoint.getSignature().getName();//参数集合Arrays.asList(joinPoint.getArgs());//参数值类型joinPoint.getArgs()[0].getClass().getTypeName();//获取目标解对象 FileParam是一个自定义对象FileParamfileParam=((MethodSignature)joinPoint.getSignature()).getMethod().getAnnotation(FileParam.class);//目标方法所在的类StringclassType=joinPoint.getTarget().getClass().getName();//获取当前请求request对象ServletRequestAttributesattributes=(ServletRequestAttributes)RequestContextHolder.getRequestAttributes();HttpServletRequestrequest=attributes.getRequest();//获取URI地址request.getRequestURI();//获取请求方法request.getMethod();}}
```

# [](#自定义注解)自定义注解
## [](#元注解)元注解
#### [](#target)**@Target**

说明Annotation修饰的范围
取值(ElementType):

- CONSTRUCTOR:用于描述构造器
- FIELD:用于描述域
- LOCAL_VARIABLE:用于描述局部变量
- METHOD:用于描述方法
- PACKAGE:用于描述包
- PARAMETER:用于描述参数
- TYPE:用于描述类、接口(包括注解类型) 或enum声明

#### [](#retention)@Retention

定义保留时间
取值(RetentionPoicy):

- SOURCE:在源文件中有效（即源文件保留）
- CLASS:在class文件中有效（即class保留）
- RUNTIME:在运行时有效（即运行时保留）

#### [](#documented)@Documented

一个标记注解

#### [](#inherited)@Inherited

@Inherited 元注解是一个标记注解，@Inherited阐述了某个被标注的类型是被继承的。如果一个使用了@Inherited修饰的annotation类型被用于一个class，则这个annotation将被用于该class的子类。

#### [](#interface)@interface

自定义注解

#### [](#注解元素默认值)注解元素默认值
```java
@Target(ElementType.FIELD)15@Retention(RetentionPolicy.RUNTIME)16@Documented17public@interfaceFruitProvider{18/**
19 * 供应商编号
20 * @return
21      */22publicintid()default-1;2324/**
25 * 供应商名称
26 * @return
27      */28publicStringname()default"";2930/**
31 * 供应商地址
32 * @return
33      */34publicStringaddress()default"";35}
```

# [](#自定义注解aop实战)自定义注解+AOP实战
## [](#自定义注解-2)自定义注解
```java
@Target({ElementType.METHOD})@Retention(RetentionPolicy.RUNTIME)@Documentedpublic@interfaceFileValid{}
```

```java
@Target({ElementType.PARAMETER})@Retention(RetentionPolicy.RUNTIME)@Documentedpublic@interfaceFileParam{publicString[]suffix()default{"doc","xls","ppt","png","txt"};publicintsize()default1024;}
```

## [](#controller)Controller
```java
@RestController@RequestMapping("/file")@Slf4jpublicclassAopTestController{@PostMapping("/upload")@FileValidpublicStringupload(@FileParam(suffix={"txt"})MultipartFilefile,HttpServletRequestrequest,HttpServletResponseresponse){log.info("method");return"success";}}
```

## [](#aop切面)AOP切面
```java
@Component@Aspect@Slf4jpublicclassFileValidAspect{@Pointcut("@annotation(com.example.demo.annotation.FileValid)")publicvoidpointcut(){}@Around("pointcut()")publicObjectaround(ProceedingJoinPointpjp){Object[]args=pjp.getArgs();Methodmethod=((MethodSignature)pjp.getSignature()).getMethod();//参数列表Parameter[]parameters=method.getParameters();for(inti=0;i<parameters.length;i++){//判断参数是否修饰了注解if(parameters[i].isAnnotationPresent(FileParam.class)){//获取注解进而得到注解上的参数值Annotationannotation=parameters[i].getAnnotation(FileParam.class);String[]suffixs=((FileParam)annotation).suffix();intsize=((FileParam)annotation).size();log.info("suffixs: {},size: {}",suffixs,size);//实际大小longSize=0L;Stringsuffix=null;if(args[i]instanceofMultipartFile){MultipartFiletemp=((MultipartFile)args[i]);Size=temp.getSize();suffix=temp.getOriginalFilename().split("\\.")[1];log.info("suffix: {},size: {}",suffix,Size);}if(Size>size){returnString.format("文件大小：%sByte,超过限定大小：%Byte",Size,size);}if(!Arrays.asList(suffixs).contains(suffix)){returnString.format("不支持文件上传类型: %s",suffix);}}}try{returnpjp.proceed();}catch(Throwablethrowable){throwable.printStackTrace();}return"error";}@Before("pointcut()")publicvoidbefore(){log.info("before...");}@AfterReturning("pointcut()")publicvoidafterReturning(){log.info("afterReturning");}@After("pointcut()")publicvoidafter(){log.info("after ...");}@AfterThrowing("pointcut()")publicvoidafterThrowing(){log.info("afterThrowing");}}
```

## [](#around-before-after-afterreturning-afterthrowing执行顺序)@Around、@Before、@After、@AfterReturning、@AfterThrowing执行顺序

实现切面可以用两种方式:

- 直接使用@Before和@After,会在切点执行前和之后执行
- 使用@Around封装切点,处理完后放行，继续执行接口方法

那各种方式的执行顺序是什么呢
**@Around->@Before->接口->@AfterReturning(有异常@AfterThrowing)->@After**
需要注意的是只要调用了pjp.proceed()方法，就会执行一遍@Befrore后面的所有步骤，然后再回@Around执行pjp.proceed()方法后的代码,调用几次pjp.proceed()就会执行几次@Before到@After之后的内容。