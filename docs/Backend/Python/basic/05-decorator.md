# 装饰器 (Decorator)

装饰器（Decorator） 是一个**接受函数作为参数并返回新函数**的可调用对象。它允许你在不修改原函数代码的情况下，动态地添加额外的功能。

根据定义，你可能会产生如下疑问：
1. 怎么理解“接受函数作为参数并返回新函数”？
2. 怎么体现“动态地添加额外的功能”？

要解答这些问题，我们需要先理解 Python 中函数的两个重要特性：函数是一等公民和闭包。它们共同构成了装饰器的基础。

## 函数是一等公民

> 当函数在一个编程语言中被当作普通变量对待时，我们说这个语言具有一等函数。  
> A programming language is said to have First-class functions when functions in that language are treated like any other variable.

在 Python 中，函数是**一等公民**，这意味着：
- 函数可以赋值给变量
```python
def say_hello(name):
    return f"你好，{name}"

# 直接把函数赋值给变量
greet = say_hello

print(greet("小明"))  # 输出：你好，小明
print(say_hello("小明"))  # 输出：你好，小明（效果完全一样）
```
- 函数可以作为参数传递给另一个函数
```python
def say_hello(name):
    return f"你好，{name}"

def say_bye(name):
    return f"再见，{name}"

# 这个函数接收另一个函数作为参数
def greet_person(greet_func, name):
    return greet_func(name)

# 把不同的函数传进去
print(greet_person(say_hello, "小红"))  # 输出：你好，小红
print(greet_person(say_bye, "小红"))    # 输出：再见，小红
```
- 函数可以作为另一个函数的返回值
```python
def create_greeting(greeting_word):
    # 内部定义一个新函数
    def greet(name):
        return f"{greeting_word}，{name}"
    # 返回这个函数
    return greet

# 创建不同的问候函数
say_hello = create_greeting("你好")
say_good_morning = create_greeting("早上好")

# 使用返回的函数
print(say_hello("张三"))        # 输出：你好，张三
print(say_good_morning("李四")) # 输出：早上好，李四
```

理解了函数可以“作为返回值返回”，我们就具备了**构造新函数的能力**。但如果新函数还需要“记住一些额外信息”（比如配置、状态），就必须依赖闭包。

## 闭包
 
函数可以作为返回值，那么就可以在函数`func1`内部定义`func2`，并返回：

```python
def func1():
    message = "一个来自外部函数的消息"
    def func2():
        return f"这是内层函数，外部变量是：{message}"
    return func2

# 调用外层函数，得到内层函数
inner_func = func1()
print(inner_func())  # 输出：这是内层函数，外部变量是：一个来自外部函数的消息
```

按理说func1执行完毕后，`message`变量应该被销毁了，但实际上执行`func2`时，仍然可以访问到它。这就是**闭包**的特性：**内部函数“记住”了外部函数的变量**。

### 定义

当一个内部函数引用了外部函数的变量，并且外部函数返回了这个内部函数时，这个内部函数连同它引用的外部变量，共同构成了一个闭包（Closure）。

```python
def make_multiplier(x):
    def multiplier(n):
        return x * n  # multiplier 记住了 x 的值
    return multiplier

# 创建两个不同的闭包
double = make_multiplier(2)  # double 记住了 x=2
triple = make_multiplier(3)  # triple 记住了 x=3

print(double(5))  # 10
print(triple(5))  # 15
```

也就是说，一个闭包的形成需要满足三个条件：

1. 必须有一个嵌套函数（内部函数）
2. 内部函数必须引用外部函数的变量
3. 外部函数必须返回内部函数

那么闭包底层是如何实现，又是如何执行的呢？

### 拓展：底层机制

当 Python 创建一个闭包时：

- 把外部函数的变量存储在一个特殊的属性 `__closure__` 中
- 内部函数保存的是这些变量的引用，而非副本

使用引用替代副本的原因：

- 内存效率：不需要复制整个变量
- 状态保持：允许修改变量（使用 nonlocal）
- 一致性：多个闭包可以共享同一个变量

```python
def create_functions():
    shared_var = 0  # 被多个闭包共享的变量
    
    def increment():
        nonlocal shared_var
        shared_var += 1
        return shared_var
    
    def decrement():
        nonlocal shared_var
        shared_var -= 1
        return shared_var
    
    def get_value():
        return shared_var
    
    return increment, decrement, get_value

inc, dec, get = create_functions()

print(inc())  # 1
print(inc())  # 2
print(dec())  # 1
print(get())  # 1
```

## 装饰器

现有一个简单函数：

```python
def func1():
    print("这是函数1")
```

如果想要给下列函数前后输出日志，最简单粗暴的方法是直接在前后添加打印语句：

```python
def func1():
    print("函数开始调用")
    print("这是函数1")
    print("函数调用结束")
```

若在每个函数内部直接编写，会导致：

- 代码重复
- 业务逻辑与辅助逻辑耦合
- 修改困难

结合前面提到的**函数是一等公民**和**闭包**，有了这两点，我们就可以构造一个“包装函数”：

```python
def add_logging(func):
    def wrapper():
        print("函数开始调用")
        result = func()
        print("函数调用结束")
        return result
    return wrapper

func1 = add_logging(func1)
```

这个“包装函数”就是装饰器。它接受一个函数作为参数，返回一个新的函数（wrapper），这个新函数在调用原函数前后添加了日志功能。

### 基本结构

不难发现，装饰器的基本结构如下所示：

```python
def decorator(func):
    def inner(*args, **kwargs):
        # 前置逻辑
        result = func(*args, **kwargs)
        # 后置逻辑
        return result
    return inner


func1 = decorator(func1)
func2 = decorator(func2)
...
```

### 带参数的装饰器

如果被装饰的函数需要接受参数，那么装饰器内部的 wrapper 函数也需要接受这些参数，并将它们传递给原函数：

```python
def outer(param):                       # 第一层：接收装饰器参数
    def decorator(func):                # 第二层：接收函数
        def wrapper(*args, **kwargs):   # 第三层：执行函数
            return func(*args, **kwargs)
        return wrapper
    return decorator

decorator = outer(x)
func1 = decorator(func1)
```

将重复功能提取成装饰器，已经比在每个函数内部重复书写要优雅得多。但每次都要手动写 `func = decorator(func)` 还是略显繁琐。为此，Python 提供了语法糖 `@decorator`，让代码更加简洁清晰。

### 语法糖

装饰器在 Python 中有一个特殊的语法糖：`@decorator`。使用这个语法糖，可以在函数定义时直接应用装饰器：

```python
@decorator
def func1():
    print("这是函数1")
```

等价于：

```python
def func1():
    print("这是函数1")

func1 = decorator(func1)
```

带参数的装饰器：

```python
@decorator(x)
def func2():
    print("这是函数2")
```

等价于：

```python
def func2():
    print("这是函数2")

func2 = decorator(x)(func2)
```

语法糖是简化代码、提高可读性的一种语法，让我们能够以更清晰易懂的方式表达程序逻辑。有关语法糖的详细内容，见 [语法糖](/blog/syntactic-sugar-salt) 一文。

语法糖虽然简化了写法，但没有改变装饰器的本质：`func = decorator(x)(func)`。那么问题来了：

- 这个"赋值"操作是在什么时候发生的？
- 如果有多层装饰，包装的顺序是怎样的？
- 调用时，函数的执行顺序又是怎样的？

下面通过两个阶段来解答这些问题。

### 定义阶段：包装顺序

当解释器执行到带有多个装饰器的函数定义时，例如：

```python
@deco1
@deco2
def test():
    ...
```

会立即被转换为：

```python
test = deco1(deco2(test))
```

这里实际转换顺序是：

1. 先执行 `deco2(test)`，得到一个新的函数对象
2. 再将这个新函数对象传给 `deco1`
3. 最终 `test` 被赋值为 `deco1` 返回的包装函数

### 执行阶段：调用顺序

以下列代码为例：

```python
def deco1(func):
    print("deco1 执行")
    def wrapper(*args, **kwargs):
        print("deco1 wrapper")
        return func(*args, **kwargs)
    return wrapper

def deco2(func):
    print("deco2 执行")
    def wrapper(*args, **kwargs):
        print("deco2 wrapper")
        return func(*args, **kwargs)
    return wrapper

@deco1
@deco2
def test():
    print("test 执行")

test()
```

输出结果如下：

```
deco2 执行
deco1 执行
deco1 wrapper
deco2 wrapper
test 执行
```

可以看到定义阶段输出顺序 `deco2 执行` → `deco1 执行`，印证了包装顺序是从内到外。

而调用 `test()` 时，实际执行的是最外层的 `wrapper`（来自 `deco1`），它里面调用了下一层的 `func`（即 `deco2` 的 `wrapper`），直到最后调用原始函数。因此执行顺序是 `deco1 wrapper` → `deco2 wrapper` → `test 执行`。

到这里，前面的三个问题都有了回答，总结如下：

- 赋值发生在函数定义阶段：解释器遇到 @ 语法时立即执行装饰器，替换原函数。
- 包装顺序是从内到外：先执行靠近函数的装饰器，再执行上面的。
- 执行顺序是从外到内：调用时先执行最外层包装，再层层进入内层，最后到原函数。

## 实践示例

### 日志装饰器

```python
def log_call(func):
    def inner(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 执行完毕")
        return result
    return inner

@log_call
def add(a, b):
    return a + b

# 调用并查看结果
result = add(3, 5)
print(f"计算结果: {result}")
```

输出：

```
调用 add
add 执行完毕
计算结果: 8
```

### flask 路由装饰器

```python
from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    app.run()  # 启动服务，访问 http://127.0.0.1:5000/hello
```

在实际开发中，我们经常需要为多个函数添加相同的附加逻辑，比如日志记录、权限校验、耗时统计或缓存处理。如果直接在每個函数内部编写这些代码，会带来几个问题：

- 代码重复：相同的逻辑在多个函数中反复出现
- 耦合度高：业务代码与辅助功能纠缠在一起
- 维护困难：需要修改时，不得不逐个函数去调整

而装饰器正好提供了一种优雅的解决方案。那么，使用装饰器具体有哪些好处，又需要注意什么呢？

## 优缺点

### 优点

- **解耦逻辑**：业务代码与通用逻辑分离
- **代码复用**：一个装饰器可作用于多个函数
- **语法简洁**：`@decorator` 一行完成增强

### 缺点

- **调试困难**：多层装饰器会增加调用栈深度
- **行为不透明**：不易看出函数被做了哪些修改
- **元信息丢失**：未使用 `functools.wraps` 时会改变函数签名

### 拓展：使用 `functools.wraps` 保留函数元信息

`functools.wraps` 是一个装饰器，用于将原函数的元信息（如 `__name__`、`__doc__` 等）复制到包装函数上，避免调试和文档生成工具显示异常。

```python
import functools

def log_call(func):
    @functools.wraps(func)
    def inner(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 执行完毕")
        return result
    return inner

@log_call
def add(a, b):
    """计算两个数的和"""
    return a + b

print(add.__name__)  # 输出: add (如果不使用 wraps，会输出 inner)
print(add.__doc__)   # 输出: 计算两个数的和 (如果不使用 wraps，会输出 None)
```

## 参考

- [First-class Functions](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function)
- [Python Closures](https://www.geeksforgeeks.org/python/python-closures/)