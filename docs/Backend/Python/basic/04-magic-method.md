# 魔术方法/魔法函数 (Magic Methods)

在 Python 中，魔术方法和魔法函数其实是指同一个概念，只是叫法不同。更准确的称呼是魔术方法。

## 什么是魔术方法？

以下列代码为例：

```python
class TestCase:
    
    def __init__(self, value):          # 魔术方法
        self.value = value

    def get_value(self):                # 普通函数
        return self.value
    
test_instance = TestCase(10)
```

在这个示例中，`value` 是一个属性，`get_value()` 是一个普通函数，`__init__()` 是一个**魔术方法 (Magic Methods 或 Dunder Methods)**。它们以双下划线开头和结尾，在特定场景下会被 Python 自动调用，用于定制对象的行为。

常见的魔术方法有：

| 魔术方法       | 作用                                 |
| -------------- | ------------------------------------ |
| `__init__`     | 对象初始化                           |
| `__str__`/ `__repr__` | 定义对象的字符串表示                 |
| `__add__`      | 定义加法运算符行为                   |
| `__len__`      | 定义对象的长度                       |
| `__call__`      | 使对象可调用                         |

## 魔术方法的特性

魔术方法的“魔法”体现在以下几个方面：

1. **与操作符绑定**
2. **行为可通过重写定制**
3. **自动触发，无需显示调用**

### 魔术方法与操作符的对应关系

Python 是怎么知道在特定场景下该调用哪个具体方法的呢？比如，为什么 `len()` 函数会去调用对象的 `__len__()` 方法？这是因为 Python 定义了**操作符与魔术方法的对应关系**，当你使用某个操作符或者内置函数时，Python 解释器会自动去查找并调用对应的魔术方法。举例如下：

<!-- 完整对应关系见[附录II](#附录ii魔术方法与操作符的完整对应关系)： -->

| 操作符       | 对应的魔术方法   |
| ------------ | ---------------- |
| `+`          | `__add__`        |
| `-`          | `__sub__`        |
| `*`          | `__mul__`        |
| `/`          | `__truediv__`    |
| `len()`       | `__len__`        |

由此可以得知：
<div className="alert alert--info"> 
   <span>**双下划线方法 ≠ 魔术方法**</span>
</div>
<br/>
**只有那些被 Python 预定义并在特定场景下自动调用的方法才被称为魔术方法**。例如，`__init__` 是魔术方法，因为它在创建对象时自动调用；而 `__my_custom_method__` 虽然符合命名规范，但如果没有被 Python 预定义或自动调用，就不算是魔术方法，因此**不能完完全全地自定义一个魔术方法**。

### 定制对象行为

我们可以重写这些魔术方法来定制对象的行为，例如：

```python
class MyNumber:
    def __init__(self, value):
        self.value = value

    def __add__(self, other):
        return MyNumber(self.value + other.value)

    def __str__(self):
        return f"MyNumber({self.value})"

num1 = MyNumber(5)
num2 = MyNumber(10)
print(num1 + num2)  # 输出: MyNumber(15)
```

如果没有重写 `__add__` 方法，Python 会**沿着继承链向上查找**，直到查找到 `object` 基类。而 `object` 没有实现 `__add__` 方法，因此会引发 `TypeError`，表示不支持这种操作。

<details>
   <summary>Python object 基类底层代码</summary>

   ```python
   @disjoint_base
   class object:
       __doc__: str | None
       __dict__: dict[str, Any]
       __module__: str
       __annotations__: dict[str, Any]
       @property
       def __class__(self) -> type[Self]: ...
       @__class__.setter
       def __class__(self, type: type[Self], /) -> None: ...
       def __init__(self) -> None: ...
       def __new__(cls) -> Self: ...
       # N.B. `object.__setattr__` and `object.__delattr__` are heavily special-cased by type checkers.
       # Overriding them in subclasses has different semantics, even if the override has an identical signature.
       def __setattr__(self, name: str, value: Any, /) -> None: ...
       def __delattr__(self, name: str, /) -> None: ...
       def __eq__(self, value: object, /) -> bool: ...
       def __ne__(self, value: object, /) -> bool: ...
       def __str__(self) -> str: ...  # noqa: Y029
       def __repr__(self) -> str: ...  # noqa: Y029
       def __hash__(self) -> int: ...
       def __format__(self, format_spec: str, /) -> str: ...
       def __getattribute__(self, name: str, /) -> Any: ...
       def __sizeof__(self) -> int: ...
       # return type of pickle methods is rather hard to express in the current type system
       # see #6661 and https://docs.python.org/3/library/pickle.html#object.__reduce__
       def __reduce__(self) -> str | tuple[Any, ...]: ...
       def __reduce_ex__(self, protocol: SupportsIndex, /) -> str | tuple[Any, ...]: ...
       if sys.version_info >= (3, 11):
           def __getstate__(self) -> object: ...

       def __dir__(self) -> Iterable[str]: ...
       def __init_subclass__(cls) -> None: ...
       @classmethod
       def __subclasshook__(cls, subclass: type, /) -> bool: ...
   ```
</details>

如果 `MyNumber` 类继承自 `int`，那么它就会继承 `int` 类的 `__add__` 方法，当执行 `num1 + num2` 时，int 的 `__add__` 方法会被调用，它会返回一个新的 `int` 对象，而不是 `MyNumber` 对象。因此，输出将是 `15` 而不是 `MyNumber(15)`。也即继承来的方法返回的是父类类型（int），而不是子类类型（MyNumber），如果需要返回子类类型，仍然需要重写 `__add__` 方法来实现。

```python
class MyNumber(int):
    def __init__(self, value):
        print("MyNumber __init__ called")
        super().__init__()

    def __str__(self):
        return f"MyNumber({self.value})"

num1 = MyNumber(5)
num2 = MyNumber(10)
print(num1 + num2)  # 输出: 15
```

### 自动调用的时机

相比于普通函数需要通过对象.函数名() 的方式显示调用，魔术方法在特定事件（如创建对象、打印对象、操作运算符等）发生时会被自动调用。例如：

```python
class TestCase:
    
    def __init__(self, value: int):          # 魔术方法
        self.value = value

    def get_value(self):                # 普通函数
        return self.value

    def __str__(self):                   # 魔术方法
        return f"TestCase(value={self.value})"
    
test_instance = TestCase(10)
print(str(test_instance))  # 输出: TestCase(value=10)
```

其中，`print(str(test_instance))` 等价于：

```python
print(test_instance.__str__())
```

## 常用魔术方法详解

### `__new__` 和 `__init__`

`__new__` 和 `__init__` 是 Python 中创建对象时的两个关键“魔法方法”，但它们职责完全不同。`__new__` 负责创建实例，而 `__init__` 负责初始化实例。以下列代码为例：

```python
class TestCase:
    
    def __init__(self, value):          # 魔术方法
        self.value = value

    def get_value(self):                # 普通函数
        return self.value
    
test_instance = TestCase(10)
```

其中，`test_instance = TestCase(10)` 等价于：

```python
test_instance = TestCase.__new__(TestCase)
if isinstance(test_instance, TestCase):
   TestCase.__init__(test_instance, 10)
```

在这个过程中，`__new__` 方法：

- 在语义上类似静态方法（因为没有 self，在实例创建前调用），但它不是普通的 `@staticmethod`
- 接受类作为第一个参数（通常命名为 `cls`）
- 负责创建并返回一个新的实例对象

而 `__init__` 方法：

- 是实例方法
- 接受实例作为第一个参数（通常命名为 `self`）
- 负责初始化实例的属性和状态，不返回任何值（返回 `None`），如果 `__init__` 返回其他值会引发 `TypeError`。

一般情况下使用类初始化不需要重写 `__new__` 方法，除非需要控制实例的创建过程（如单例模式、不可变类型等）。而 `__init__` 方法是最常用的魔术方法之一，用于设置实例的初始状态。

### `__str__` 和 `__repr__`

当我们直接操作输出自定义类对象查看时，得到的都是一个可读性很差的内容，以下列代码为例：

```python
class MyNumber:
    def __init__(self, value):
        self.value = value

num = MyNumber(5)
print(num)  # 输出: <__main__.MyNumber object at 0x0000023B6A478BE0>
```

直接输出 `num` 对象时，只能得到类名称和内存地址，想要获取值只能通过 `num.value` 来访问。为了让输出更友好，我们可以重写 `__str__` 方法：

```python
class MyNumber:
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return f"MyNumber({self.value})"

num = MyNumber(5)
print(num)  # 输出: MyNumber(5)
```

也可以重写 `__repr__` 方法：

```python
class MyNumber:
    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"MyNumber({self.value})"

num = MyNumber(5)
print(num)  # 输出: MyNumber(5)
```

`__str__` 和 `__repr__` 在上述例子中的效果是一样的，那它们的区别是什么呢？

以 Python 标准库中的 `datetime` 模块为例：

```python
from datetime import datetime

today = datetime.now()
print(str(today))  # 输出: 2025-03-18 13:00:44.081170
print(repr(today)) # 输出: datetime.datetime(2025, 3, 18, 13, 0, 44, 81170)
``` 

可以看到，`__str__` 提供了一个用户友好的字符串表示，而 `__repr__` 提供了一个更详细的、开发者友好的字符串表示，通常包含了对象的类型和关键信息。

这里总结 `__str__` 和 `__repr__` 的区别：

|  | `__str__` | `__repr__` |
|---------|-----------|------------|
| **目标受众** | 最终用户 | 开发者 |
| **核心目标** | 可读性 | 准确性 |
| **输出风格** | 简洁友好 | 详尽准确 |
| **典型场景** | 打印输出、用户界面 | 调试、日志记录 |
| **调用时机** | • `print(obj)`<br/>• `str(obj)`<br/>• `f"{obj}"` | • 交互环境输入 `obj`<br/>• `repr(obj)`<br/>• 容器打印元素 |
| **后备机制** | 如果未定义，默认使用 `__repr__` | 必须明确定义，否则使用默认实现 |
| **示例** | `2025-03-18 13:00:44` | `datetime.datetime(2025, 3, 18, 13, 0, 44)` |

<details>
   <summary>拓展：`__repr__`的默认实现</summary>

    如果没有重写 `__repr__` 方法，Python 会沿着继承链向上查找，直到查找到 object 基类。
   ```python
    print(object.__repr__(object))
    # 输出: <type object at 0x00007FF937A4A780>
   ```
</details>

### `__getitem__` 和 `__iter__`

- `__getitem__(self, key)`：按“索引/键”取值；被动支持迭代，简单但有限制，适合序列类数据结构
- `__iter__(self)`：按“顺序”遍历；主动提供迭代器，灵活但稍复杂，适合自定义迭代逻辑。Python 优先查找 `__iter__`，如果没有则退回到 `__getitem__`。


<!-- ## 附录I：常用魔术方法列表（分组）

下面列出常见魔术方法（并非穷尽），按照功能分组，便于查阅：

- 对象生命周期与表示:
    - `__new__(cls, ...)`：创建实例（很少需要）；
    - `__init__(self, ...)`：初始化；
    - `__del__(self)`：对象销毁时调用（不保证一定调用）；
    - `__repr__(self)`：调试/开发者友好的字符串表示；
    - `__str__(self)`：用户友好的字符串表示；
    - `__format__(self, spec)`：格式化支持。

- 比较与哈希：
    - `__eq__`, `__ne__`, `__lt__`, `__le__`, `__gt__`, `__ge__`；
    - `__hash__`：使对象可哈希（用于 dict/set）。

- 数值与算术运算：
    - `__add__`, `__sub__`, `__mul__`, `__truediv__`, `__floordiv__`, `__mod__`, `__pow__`；
    - 反向运算`__radd__`, `__rsub__` 等；
    - 一元运算 `__neg__`, `__pos__`, `__abs__`；
    - 类型转换 `__int__`, `__float__`, `__complex__`。

- 序列与映射协议：
    - `__len__`, `__getitem__`, `__setitem__`, `__delitem__`；
    - 迭代相关 `__iter__`, __next__（迭代器）；
    - 成员检测 `__contains__`（用于 `in`）。

- 可调用与描述符：
    - `__call__`：使实例可调用；
    - 描述符协议 `__get__`, `__set__`, `__delete__`（用于实现属性）。

- 上下文管理：
    - `__enter__`, `__exit__`（支持 `with` 语句）。

- 属性访问钩子：
    - `__getattr__`（在属性不存在时调用），`__getattribute__`（所有属性访问都会调用），`__setattr__`, `__delattr__`。

- 序列化/持久化：
    - `__getstate__`, `__setstate__`（pickle 支持）。

- 其他常用：
    - `__bool__`：布尔上下文；
    - `__dir__`：自定义 `dir()` 输出；
    - `__slots__`（不是方法，而是类属性，用于内存优化）。

可以结合 `dir(obj)`、`help(type(obj))` 等工具查看某个类型支持哪些魔法方法。

## 附录II：操作符与魔术方法的对应关系（常用）

下面列出常见操作符与对应魔法方法：

| 操作/内建函数 | 魔法方法 |
| ------------ | ------- |
| `x + y` | `x.__add__(y)` 或 `y.__radd__(x)` |
| `x - y` | `x.__sub__(y)` 或 `y.__rsub__(x)` |
| `x * y` | `x.__mul__(y)` 或 `y.__rmul__(x)` |
| `x / y` | `x.__truediv__(y)` 或 `y.__rtruediv__(x)` |
| `x // y` | `x.__floordiv__(y)` |
| `x % y` | `x.__mod__(y)` |
| `x ** y` | `x.__pow__(y)` |
| `-x` | `x.__neg__()` |
| `+x` | `x.__pos__()` |
| `abs(x)` | `x.__abs__()` |
| `int(x)` | `x.__int__()` |
| `float(x)` | `x.__float__()` |
| `len(x)` | `x.__len__()` |
| `x[i]` | `x.__getitem__(i)` |
| `x[i] = v` | `x.__setitem__(i, v)` |
| `del x[i]` | `x.__delitem__(i)` |
| `for v in x` | `iter(x)` → `x.__iter__()`; 迭代器的 `next()` 调用 `__next__()` |
| `in` | `x.__contains__(y)` 或迭代回退到 `__iter__`/`__getitem__` |
| `x()` | `x.__call__()` |
| `with X as y:` | `X.__enter__()` / `X.__exit__()` |

注：许多运算具有反向方法（`__radd__` 等）以及就地赋值方法（`__iadd__` 等），解释器会在合适的顺序中尝试调用它们。 -->

## 参考

[Real Python: Python Magic Methods](https://realpython.com/python-magic-methods/)  
[Understanding Python’s `__str__` and `__repr__` Methods](https://medium.com/@akshatgadodia/understanding-pythons-str-and-repr-methods-a-guide-for-python-developers-83490d83e4e9)  
[When Should You Use `.__repr__`() vs `.__str__`() in Python?](https://realpython.com/python-repr-vs-str/)