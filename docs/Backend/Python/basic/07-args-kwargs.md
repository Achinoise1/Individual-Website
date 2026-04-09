# *args 和 **kwargs

## 概念说明

在了解 *args 和 **kwargs 之前，我们需要了解 Python 函数传参规则以及不同的参数类型。

### Python 函数传参规则

Python 函数传参规则涉及两个不同层面的规则，需要分开理解：

- `传递规则`：解决的是“对象如何传入函数”的问题。Python 采用的是按对象引用传递（也称为“传对象引用”），即传递的是对象的引用而不是副本。详见[函数传参](02-mutable.md#函数传参)内容，这里不再赘述。
- `定义规则`：解决的是“参数在函数定义时如何书写”的问题。Python 提供了灵活的参数类型，包括 **位置参数、关键字参数、默认参数、可变参数（\*args）和关键字可变参数（\*\*kwargs）** 等。

### 参数类型

#### 位置参数

位置参数是指在函数或命令调用时，根据参数传递的顺序位置来确定其对应关系的参数。简单来说，参数的取值取决于它在调用时的"位置"（第几个）

```python
def introduce(name, age, city):
    print(f"我叫{name}，今年{age}岁，来自{city}")

# 位置参数调用
introduce("张三", 25, "北京")  
# 输出：我叫张三，今年25岁，来自北京
```

在这个例子中：

- "张三"对应name（第1个位置）
- 25对应age（第2个位置）
- "北京"对应city（第3个位置）

结合前面的例子，我们不难发现**位置参数的特点**：
- 参数的顺序必须与函数定义保持一致
- 如果调换顺序，结果可能出错

```python
introduce(25, "北京", "张三")  
# 输出：我叫25，今年北京岁，来自张三  ❌ 存在逻辑错误
```

#### 关键字参数

关键字参数是指在**函数调用**时，使用参数名来指定对应关系的参数。通过`参数名=值`的形式，可以不按照顺序传递参数。

```python
def introduce(name, age, city):
    print(f"我叫{name}，今年{age}岁，来自{city}")

introduce(city="上海", name="李四", age=30)
# 输出：我叫李四，今年30岁，来自上海
```

在这个例子中：
- city="上海"在第一个位置，实际对应city参数
- name="李四"在第二个位置，实际对应name参数
- age=30在第三个位置，实际对应age参数

结合前面的例子，我们不难发现**关键字参数的特点**：
- 可以不按顺序传参，一定程度上提高代码可读性

```python
introduce(25, "北京", "张三")  
introduce(city="北京", name="张三", age=25)
```

- 必须确保参数名正确，否则会报错：

```python
introduce(name="李四", age=28, country="广州")
# TypeError: introduce() got an unexpected keyword argument 'country'  ❌ 不存在的参数名
```

- 不能重复传参，否则会报错：

```python
introduce("张三", name="李四", age=28, city="广州")
# TypeError: introduce() got multiple values for argument 'name'  ❌ 同时使用位置参数和关键字参数传递同一个参数
```

#### 默认参数

默认参数是指在**函数定义**时，为参数指定一个默认值。如果在调用函数时没有传递该参数，就会使用这个默认值。

> 注意区分默认参数和关键字参数：  
> - 默认参数是在函数定义时，给参数设置默认值  
> - 关键字参数是在函数调用时，通过参数名传递参数

```python
def greet(name, message="你好"):
    print(f"{message}，{name}")

# 不提供默认参数
greet("张三")  # 输出：你好，张三

# 提供默认参数（覆盖默认值）
greet("李四", "早上好")  # 输出：早上好，李四
```

结合前面的例子，我们不难发现**默认参数的特点**：
- 简化调用，减少重复代码
- 提高灵活性，调用函数时可以选择性地传递参数
- 保持兼容性，添加新参数不影响现有代码

需要注意的是，默认参数只在函数定义时被计算一次，如果默认参数是可变对象（如列表、字典），可能会导致意外行为：

```python
def create_and_append_to_list(value, lst=[]):  # 期望每次都返回一个新的列表
    lst.append(value)
    return lst

print(create_and_append_to_list(1))  # 输出: [1]
print(create_and_append_to_list(2))  # 输出: [1, 2]  ❌ 默认参数 lst 是同一个列表对象
```
```python
import time

def log_message(message, timestamp=time.time()):
    print(f"{timestamp}: {message}")

log_message("开始")  
time.sleep(2)
log_message("结束")  # ❌ 输出的时间与上一次相同，时间戳没有更新
```

#### 可变参数

在常规函数定义中，参数数量是固定的：

```python
def add(a, b):
    return a + b
```

但当我们无法提前确定参数数量或名称时，固定参数就会遇到瓶颈：

- 需要求任意个数字之和
- 需要封装一个通用日志装饰器
- 需要给函数传递动态配置项

为了解决这类问题，Python 提供了 `*args` 和 `**kwargs` 语法，允许函数**接收不定数量的参数**。接下来我们将详细介绍 `*args` 和 `**kwargs` 的定义、原理、使用方法以及适用场景。

## `*args`: 位置可变参数 

`*args` 用于接收任意数量的位置参数，并将它们打包成一个元组（tuple）。这里的"args"可以是任意名称，但星号 `*` 是必须的，`*args` 是 Python 社区的约定名称。

```python
def add(*args):
    result = 0
    for num in args:
        result += num
    return result

print(add(1, 2))            # args=(1, 2) 输出: 3
print(add(1, 2, 3, 4, 5))   # args=(1, 2, 3, 4, 5) 输出: 15
print(add())                # args=() 输出: 0
```

### `*` 解包

`*` 除了能在函数定义时，打包参数为元组外，还可以在函数调用时，拆包一个可迭代对象（列表/字典/字符串/元组/集合/生成器...）为位置参数。

- 列表/元组解包：
```python
def add(a, b, c):
    print(a, b, c)

nums = [1, 2, 3]
add(*nums)  # 等价于 add(1, 2, 3)，输出: 1 2 3

nums = (1, 2, 3)
add(*nums)  # 输出: 1 2 3
```

- 集合解包（无序）：
```python
def print_set(a, b, c):
    print(a, b, c)
my_set = {3, 1, 2}
print_set(*my_set)  # 输出: a=1, b=2, c=3（顺序不固定）
```

- 字符串解包：
```python
def print_chars(a, b, c, d, e):
    print(f"a={a}, b={b}, c={c}, d={d}, e={e}")

word = "Hello"
print_chars(*word)  # 解包字符串
# 输出: a=H, b=e, c=l, d=l, e=o
```

- 字典解包（仅解包键）：
```python
def print_keys(a, b, c):
    print(f"a={a}, b={b}, c={c}")

data = {"a": 1, "b": 2, "c": 3}
print_keys(*data)  # 解包字典的键
# 输出: a=a, b=b, c=c
```

> 在 Python 中，`*` 操作符的本质是迭代（iterate）对象。当一个对象被 `*` 解包时，Python 会调用该对象的 `__iter__()` 方法，获取它的迭代器，然后逐个取出元素。  
> 
> 字典在 Python 中是一个可迭代对象，但它的默认迭代行为是遍历键，因此 `*` 解包字典时会得到键而不是值。如果需要解包字典的值，可以使用 `**` 解包关键字参数的方式，或者使用 `*dict.values()` 解包字典的值

## `**kwargs`: 关键字可变参数

`**kwargs` 用于接收任意数量的关键字参数，并将它们打包成一个字典（dict）。"kwargs"是"keyword arguments"的缩写，同样可以使用其他名称，但双星号 `**` 必须保留。

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="北京")

# kwargs = {'name': 'Alice', 'age': 25, 'city': '北京'}
# 输出:
# name: Alice
# age: 25
# city: 北京
```

`**` 除了能在函数定义时，打包参数为字典外，还可以在函数调用时，拆包一个字典为关键字参数：

```python
def greet(name, age):
    print(name, age)

info = {"name": "Tom", "age": 18}
greet(**info)  # 等价于 greet(name="Tom", age=18)，输出: Tom 18
```

## 函数参数完整顺序

在了解了各种参数类型后，我们需要掌握它们在函数定义中的组合规则。Python 函数参数的顺序有严格要求，必须遵循以下顺序：

```python
def func(
    required1,   # 必需位置参数
    required2,   # 必需位置参数
    *args,       # 可变位置参数
    default1=10, # 关键字参数（有默认值）
    default2=20, # 关键字参数（有默认值）
    **kwargs     # 可变关键字参数
):
    pass
```

调用示例：

```python
func(1, 2, 3, 4, c=20, x=100)
# a=1, b=2, args=(3,4), c=20, kwargs={'x':100}
```

Python 参数顺序必须遵循：
1. 普通位置参数：没有任何特殊修饰的参数
2. 可变位置参数（*args）：接收任意多个位置参数
3. 关键字参数（默认参数）：必须有默认值的参数
4. 可变关键字参数（**kwargs）：接收任意多个关键字参数

## 为什么一定是这个顺序

我们可以从参数解析的角度来理解为什么一定按照普通位置参数-可变位置参数-关键字参数-可变关键字参数的顺序定义：

### 位置参数必须在关键字参数之前

当 Python 解析函数调用时，它首先根据位置匹配参数，然后再根据关键字匹配。如果允许在定义函数时将位置参数放在默认参数之后，那么当调用 wrong(3) 时，Python 就无法确定这个 3 是应该赋给 a 还是 b。因此，Python 在函数定义阶段就会直接报错，提示语法错误。

```python
def correct(a, b=2):
    pass

def wrong(a=1, b):          # SyntaxError: non-default argument follows default argument
    pass

correct(3)  
wrong(3)    
```

### 可变参数必须位于普通位置参数之后

当 Python 解析函数调用时，如果可变参数出现在普通位置参数之前，此时会将所有位置参数都收集到 `*args` 中，导致后续的普通位置参数无法接收任何值，从而引发 TypeError。

```python
def correct(a, *args):
    pass

def wrong(*args, a):  
    pass

correct(1, 2, 3)  # a=1, args=(2, 3)
wrong(1, 2, 3)    # TypeError: wrong() missing 1 required keyword-only argument: 'a'
```

### 关键字可变参数必须位于关键字参数之后

当 Python 解析函数定义时，如果 **kwargs 出现在普通关键字参数之前，那么所有传入的关键字参数都会被 **kwargs 优先收集，导致后续的普通关键字参数无法接收到任何值。因此，Python 在函数定义阶段就会直接报错，提示语法错误。

```python
def correct(a=10, **kwargs):
    pass

def wrong(**kwargs, a=10):      # SyntaxError: invalid syntax
    pass

correct(a=20, x=100)  
wrong(a=20, x=100)    
```

## `*args` 和 `**kwargs` 实践示例

了解了 `*args` 和 `**kwargs` 的基本用法后，让我们看看它们在实际开发中的应用场景，以及使用它们时需要注意的优缺点。

### 参数透传（装饰器）

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print("calling function...")
        return func(*args, **kwargs)
    return wrapper

@logger
def add(a, b):
    return a + b

add(1, 2)
```

### 接口扩展

```python
def request(url, method="GET", **kwargs):
    print("url:", url)
    print("method:", method)
    print("options:", kwargs)

request(
    "api/test",
    timeout=10,
    headers={"token": "123"},
    retry=True
)
```

输出：

```bash
url: api/test
method: GET
options: {'timeout': 10, 'headers': {'token': '123'}, 'retry': True}
```

## 可变参数优缺点分析

### 优点

- **灵活性高**：无需提前确定参数数量和名称
- **兼容性强**：新增参数不会破坏已有调用方
- **适合封装**：装饰器、中间层函数可以无感知地透传参数
- **代码简洁**：避免手动处理列表或字典参数

### 缺点

- **可读性差**：调用方不易看出函数到底接收哪些参数
- **缺少类型约束**：IDE 难以自动补全，类型检查工具支持有限
- **调试困难**：参数错误通常在运行时才会暴露
- **文档依赖性强**：必须依赖文档或注释说明有效参数

> **小结**：`*args` 和 `**kwargs` 是强大的工具，但应该在有明确需求的场景下使用，避免过度使用导致代码可读性下降。

## 适用场景

| 场景           | 推荐用法   | 说明                            |
| -------------- | ---------- | ------------------------------- |
| 参数数量不固定 | `*args`    | 求和、日志、批量处理            |
| 参数名称不固定 | `**kwargs` | 配置项、可选参数、动态属性      |
| 函数参数透传   | 两者结合   | 装饰器、中间层封装              |
| 接口向后兼容   | `**kwargs` | HTTP 请求、数据库连接、框架配置 |
| 动态函数调用   | 两者结合   | JSON 参数调用函数、自动化调用   |

## 总结

从位置参数到默认参数，再到 `*args` 和 `**kwargs`，Python 的参数体系逐步解决了一个核心问题：**如何让函数定义更灵活地应对不同的调用需求**。而 `*args` 和 `**kwargs` 正是为了解决**参数数量或名称不确定**的场景而生。

它们的核心机制是**打包与解包**：函数定义时，`*args` 将多余位置参数打包成元组，`**kwargs` 将多余关键字参数打包成字典；函数调用时，`*` 将可迭代对象解包为位置参数，`**` 将字典解包为关键字参数。

| 对比     | `*args`       | `**kwargs`       |
| -------- | ------------- | ---------------- |
| 参数类型 | 位置参数      | 关键字参数       |
| 打包结构 | tuple         | dict             |
| 调用方式 | `func(1,2,3)` | `func(a=1,b=2)`  |
| 访问方式 | `args[0]`     | `kwargs["a"]`    |
| 使用符号 | `*`           | `**`             |
| 典型场景 | 批量数据处理  | 配置项、接口扩展 |

使用时必须遵循固定的参数定义顺序：**普通位置参数 → `*args` → 默认参数 → `**kwargs`**。这个顺序确保了参数解析的确定性——位置参数优先匹配，可变参数收集剩余，默认参数提供备选，最后用 `**kwargs` 兜底。

`*args` 和 `**kwargs` 的主要优势在于**灵活性**（无需预知参数数量）、**兼容性**（新增参数不影响现有调用）和**封装性**（便于参数透传）。但也要注意其**可读性较差**、**类型约束缺失**、**调试相对困难**等局限。因此，建议在日志记录、配置传递、装饰器封装等场景中使用，而在核心业务逻辑中尽量保持参数定义明确。

理解这两个工具的关键在于：它们是 Python 在**灵活性与可读性之间的平衡设计**——当不确定性出现时，我们有标准化的解决方案；当确定性足够时，仍可选择显式定义参数。


