---
title: "Spring的AOP+自定义注解"
description: "学习 Spring AOP 和自定义注解的核心概念和实战应用"
published: 2023-11-26
tags: ["java", "AOP", "自定义注解"]
draft: false
---

# AOP

## AOP定义

AOP （Aspect Orient Programming）,直译过来就是 面向切面编程,AOP 是一种编程思想，是面向对象编程（OOP）的一种补充。

## AOP的使用场景
- 日志记录
- 事务管理
- 权限检验
- 性能监测

## AOP核心概念

### 核心概念

| 名称 | 说明 |
| --- | --- |
| Joinpoint | 连接点，指可以被动态代理拦截目标类的方法 |
| Pointcut | 切入点，对 Joinpoint 进行拦截 |
| Advice | 通知，拦截到 Joinpoint 之后要做的事，切入增强内容 |
| Target | 目标，代理的目标对象 |
| Weaving | 植入，将增强代码应用到目标上，生成代理对象的过程 |
| Proxy | 代理，生成的代理对象 |
| Aspect | 切面，切入点和通知的结合 |

### 通知分类

| 通知类型 | 说明 |
| --- | --- |
| @Before | 前置通知，通知方法在目标方法调用之前执行 |
| @After | 后置通知，通知方法在目标方法返回或异常后调用 |
| @AfterReturning | 返回后通知，通知方法会在目标方法返回后调用 |
| @AfterThrowing | 抛出异常通知，通知方法会在目标方法抛出异常后调用 |
| @Around | 环绕通知，通知方法会将目标方法封装起来 |

### AOP获取常见参数

自定义注解

```java
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FileParam {
    public String[] suffix() default {"doc", "xls", "ppt", "png", "txt"};
    public int size() default 1024;
}
```

```java
@Component
@Aspect
public class AopTest {
    @Pointcut("execution(public * com.example.demo.Contrller.*(..))")
    private void pointCut() {}

    @Before(value = "pointCut()")
    public void logBefore(JoinPoint joinPoint) {
        // 方法名
        joinPoint.getSignature().getName();
        // 参数集合
        Arrays.asList(joinPoint.getArgs());
        // 参数值类型
        joinPoint.getArgs()[0].getClass().getTypeName();
        // 获取目标对象，FileParam是一个自定义对象
        FileParam fileParam = ((MethodSignature) joinPoint.getSignature())
            .getMethod().getAnnotation(FileParam.class);
        // 目标方法所在的类
        String classType = joinPoint.getTarget().getClass().getName();
        // 获取当前请求request对象
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        // 获取URI地址
        request.getRequestURI();
        // 获取请求方法
        request.getMethod();
    }
}
```

# 自定义注解

## 元注解

### @Target

说明Annotation修饰的范围
取值(ElementType):

- CONSTRUCTOR:用于描述构造器
- FIELD:用于描述域
- LOCAL_VARIABLE:用于描述局部变量
- METHOD:用于描述方法
- PACKAGE:用于描述包
- PARAMETER:用于描述参数
- TYPE:用于描述类、接口(包括注解类型) 或enum声明

### @Retention

定义保留时间
取值(RetentionPoicy):

- SOURCE: 在源文件中有效（即源文件保留）
- CLASS: 在class文件中有效（即class保留）
- RUNTIME: 在运行时有效（即运行时保留）

### @Documented

一个标记注解

### @Inherited

@Inherited 元注解是一个标记注解，@Inherited阐述了某个被标注的类型是被继承的。如果一个使用了@Inherited修饰的annotation类型被用于一个class，则这个annotation将被用于该class的子类。

### @interface

自定义注解

### 注解元素默认值
```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FruitProvider {
    /**
     * 供应商编号
     * @return
     */
    public int id() default -1;

    /**
     * 供应商名称
     * @return
     */
    public String name() default "";

    /**
     * 供应商地址
     * @return
     */
    public String address() default "";
}
```

# 自定义注解+AOP实战

## 自定义注解

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FileValid {}
```

```java
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FileParam {
    public String[] suffix() default {"doc", "xls", "ppt", "png", "txt"};
    public int size() default 1024;
}
```

## Controller

```java
@RestController
@RequestMapping("/file")
@Slf4j
public class AopTestController {
    @PostMapping("/upload")
    @FileValid
    public String upload(@FileParam(suffix = {"txt"}) MultipartFile file,
                         HttpServletRequest request,
                         HttpServletResponse response) {
        log.info("method");
        return "success";
    }
}
```

## AOP切面

```java
@Component
@Aspect
@Slf4j
public class FileValidAspect {
    @Pointcut("@annotation(com.example.demo.annotation.FileValid)")
    public void pointcut() {}

    @Around("pointcut()")
    public Object around(ProceedingJoinPoint pjp) {
        Object[] args = pjp.getArgs();
        Method method = ((MethodSignature) pjp.getSignature()).getMethod();

        // 参数列表
        Parameter[] parameters = method.getParameters();
        for (int i = 0; i < parameters.length; i++) {
            // 判断参数是否修饰了注解
            if (parameters[i].isAnnotationPresent(FileParam.class)) {
                // 获取注解进而得到注解上的参数值
                Annotation annotation = parameters[i].getAnnotation(FileParam.class);
                String[] suffixs = ((FileParam) annotation).suffix();
                int size = ((FileParam) annotation).size();
                log.info("suffixs: {}, size: {}", suffixs, size);

                // 实际大小
                long Size = 0L;
                String suffix = null;
                if (args[i] instanceof MultipartFile) {
                    MultipartFile temp = ((MultipartFile) args[i]);
                    Size = temp.getSize();
                    suffix = temp.getOriginalFilename().split("\\.")[1];
                    log.info("suffix: {}, size: {}", suffix, Size);
                }

                if (Size > size) {
                    return String.format("文件大小：%sByte,超过限定大小：%Byte", Size, size);
                }
                if (!Arrays.asList(suffixs).contains(suffix)) {
                    return String.format("不支持文件上传类型: %s", suffix);
                }
            }
        }

        try {
            return pjp.proceed();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return "error";
    }

    @Before("pointcut()")
    public void before() {
        log.info("before...");
    }

    @AfterReturning("pointcut()")
    public void afterReturning() {
        log.info("afterReturning");
    }

    @After("pointcut()")
    public void after() {
        log.info("after ...");
    }

    @AfterThrowing("pointcut()")
    public void afterThrowing() {
        log.info("afterThrowing");
    }
}
```

## @Around、@Before、@After、@AfterReturning、@AfterThrowing 执行顺序

实现切面可以用两种方式:

- 直接使用@Before和@After,会在切点执行前和之后执行
- 使用@Around封装切点,处理完后放行，继续执行接口方法

那各种方式的执行顺序是什么呢
**@Around->@Before->接口->@AfterReturning(有异常@AfterThrowing)->@After**
需要注意的是只要调用了pjp.proceed()方法，就会执行一遍@Befrore后面的所有步骤，然后再回@Around执行pjp.proceed()方法后的代码,调用几次pjp.proceed()就会执行几次@Before到@After之后的内容。