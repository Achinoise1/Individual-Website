---
tags: [python, fundamental]
title: 容器 (tuple/list/dict/set)
---

# 容器 (tuple/list/dict/set)

## tuple 元组 

Python 中使用小括号包括元素来创建一个元组，例如：

```python
my_tuple = (1, 2, 3)
```

元组内元素可重复。注意，如果元组中只有一个元素，必须在元素后面加逗号，否则 Python 会将其识别为普通的括号表达式：

```python
single_element_tuple = (42,)  # 这是一个包含一个元素的元组
```

也可以通过逗号分隔的方式创建元组：

```python
my_tuple = 1, 2, 3
```

### 特点

**有序**：元组中的元素是有序的，可以通过索引访问。  

```python
my_tuple = (10, 20, 30)
print(my_tuple[0])  # 10
```

**不可变**：元组一旦创建就不能修改，不能添加、删除或改变其中的元素。  

```python
my_tuple = (1, 2, 3)
my_tuple[0] = 100   

# TypeError: 'tuple' object does not support item assignment
```

如果元组内部元素都是不可变的，也即元组可哈希，则可以作为 dict 的 key

```python
my_dict = {
    (1, 2): "value1",
    (3, 4): "value2"
} 
```

否则会报错：

```python
my_dict = {
    (1, [2, 3]): "value1"  
} 

# TypeError: unhashable type: 'list'
```

为了更深入理解元组“不可变”和“高效访问”的原因，我们需要了解 tuple 的底层实现。

### 底层实现

在 CPython 中，元组底层是一个指针数组，每个指针指向元组中的一个元素。该数组在创建时一次性分配完成，之后大小不可改变，因此元组具有“固定大小”的特性。

```c
typedef struct {
    PyObject_VAR_HEAD
    /* Cached hash.  Initially set to -1. */
    Py_hash_t ob_hash;
    /* ob_item contains space for 'ob_size' elements.
       Items must normally not be NULL, except during construction when
       the tuple is not yet visible outside the function that builds it. */
    PyObject *ob_item[1];
} PyTupleObject;
```
- `PyObject_VAR_HEAD` 包含了对象的基本信息，如引用计数、类型指针和大小（ob_size）
- `ob_hash` 存储 tuple 的 hash 值  
- `ob_item` 是一个指针数组，存储了元组中每个元素的地址    

> 详细底层代码可以参考[元组源码](https://github.com/python/cpython/blob/main/Include/cpython/tupleobject.h)。

使用指针而不是直接存储对象，是因为：

- Python 中万物皆对象，对象的大小可能不同。
- 指针数组可以实现固定大小的存储结构（每个指针大小相同，通常是 8 字节）
- 元组可以高效地通过索引访问元素（O(1) 时间复杂度）

总结元组操作复杂度如下：

| 操作类型 | 时间复杂度 |
| -------- | ---------- |
| 索引访问 | O(1)       |
| 遍历     | O(n)       |

### 使用

由于元组具有不可变、轻量和可哈希等特点，常用于以下场景：

**多返回值**

```python
def get_user():
    return "Alice", 18

name, age = get_user()
```

**数据固定**

```python
CONFIG = ("127.0.0.1", 8080)
```

**ORM 返回结果**

```python
row = ("Alice", 18, "Engineer")
```

## list 列表

Python 中使用方括号包括元素来创建一个列表，例如：

```python
my_list = [1, 2, 3]
```

也可以通过 `list()` 构造器创建：

```python
my_list = list()            # 空列表
my_list = list((1, 2, 3))  # 从元组创建
my_list = list("abc")      # ['a', 'b', 'c']
```

或者使用列表推导式：

```python
squares = [x ** 2 for x in range(5)]  # [0, 1, 4, 9, 16]
```

### 特点

**有序**：列表中的元素是有序的，可以通过索引访问。

```python
my_list = [10, 20, 30]
print(my_list[0])   # 10
print(my_list[-1])  # 30
```

**可变**：列表创建后可以修改，支持添加、删除、修改元素。

```python
my_list = [1, 2, 3]
my_list.append(4)    # [1, 2, 3, 4]
my_list[0] = 100     # [100, 2, 3, 4]
my_list.remove(2)    # [100, 3, 4]
```

**允许重复**：列表中的元素可以重复，且支持存放不同类型的元素。

```python
mixed = [1, "hello", 3.14, True, None]
```

### 底层实现

在 CPython 中，列表底层使用**动态数组**实现，核心是一个连续的指针数组，支持动态扩容。

```c
typedef struct {
    PyObject_VAR_HEAD
    /* Vector of pointers to list elements.  list[0] is ob_item[0], etc. */
    PyObject **ob_item;

    /* ob_item contains space for 'allocated' elements.  The number
     * currently in use is ob_size.
     * Invariants:
     *     0 <= ob_size <= allocated
     *     len(list) == ob_size
     *     ob_item == NULL implies ob_size == allocated == 0
     * list.sort() temporarily sets allocated to -1 to detect mutations.
     *
     * Items must normally not be NULL, except during construction when
     * the list is not yet visible outside the function that builds it.
     */
    Py_ssize_t allocated;
} PyListObject;
```
- `PyObject_VAR_HEAD` 包含了对象的基本信息，如引用计数、类型指针和大小（ob_size）
- `ob_item` 是指针数组的头指针，存储各元素对象的地址
- `allocated` 是已分配的内存槽数量（容量），可能大于 `ob_size`

> 详细底层代码可以参考[列表源码](https://github.com/python/cpython/blob/main/Include/cpython/listobject.h)。

**动态扩容**：当 `append` 等操作使元素数量超过 `allocated` 时，会触发扩容。CPython 使用 **过扩容（over-allocation）** 策略：

```c
new_allocated = ((size_t)newsize + (newsize >> 3) + 6) & ~(size_t)3;
```

- `newsize + newsize >> 3`：相当于多分配 1/8（约12.5%），减少以后频繁扩容
- `+ 6`：确保在小列表情况下也有一定的额外空间
- `& ~(size_t)3`：将分配的大小对齐到 4 的倍数，优化内存访问

> `& ~3` 的本质是：把一个数的二进制最后两位清零，从而让它变成 4 的倍数（向下对齐）

**缩容**：当列表元素数量大幅减少时，CPython 也会尝试缩容以节省内存。策略非常保守，只有当 `ob_size` 小于 `allocated / 2` 时才会触发缩容：

```c
if (allocated >= newsize && newsize >= (allocated >> 1)) {
    /* Do not resize */
    Py_SET_SIZE(self, newsize);
    return 0;
}
```

- `allocated >= newsize`：当前容量足够，不需要扩容
- `newsize >= (allocated >> 1)`：新大小至少是当前容量的一半，避免频繁缩容
- 如果满足上述条件，则直接更新 `ob_size`，不进行内存重新分配

总结列表操作复杂度如下：

| 操作类型     | 时间复杂度  |
| ------------ | ----------- |
| 索引访问     | O(1)        |
| 末尾追加     | 扩容时 O(n)，其余时候 O(1)，均摊 O(1)   |
| 任意位置插入 | O(n)        |
| 删除末尾     | 通常 O(1)，极少数情况下可能触发缩容 O(n)   |
| 任意位置删除 | O(n)        |
| 遍历         | O(n)        |
| in 成员检测  | O(n)        |

### 使用

**收集同类数据**

```python
fruits = ["apple", "banana", "cherry"]
```

**动态数组**

```python
data = []
for i in range(1000):
    data.append(i)
```

**模拟栈（LIFO）**

```python
stack = []
stack.append(1)
stack.append(2)
stack.pop()  # 2
```

**队列（FIFO）**

列表的 `pop(0)` 为 O(n)，大量使用时推荐改用 `collections.deque`：

```python
from collections import deque

queue = deque([1, 2, 3])
queue.append(4)
queue.popleft()  # 1
```

## dict 字典

Python 中使用花括号包括键值对来创建一个字典，例如：

```python
my_dict = {"name": "Alice", "age": 18}
```

可以通过 `dict()` 构造器创建：

```python
my_dict = dict(name="Alice", age=18)
```

可以通过传入一个包含键值对的可迭代对象来创建：

```python
my_dict = dict([("name", "Alice"), ("age", 18)])
```

可以通过字典推导式创建：

```python
my_dict = {k: k ** 2 for k in range(5)}  # 
```

### 特点

**键值对存储**：以 key-value 形式存储数据，通过键来访问值。

```python
user = {"name": "Alice", "age": 18}
print(user["name"])   # Alice
print(user.get("email", "N/A"))  # N/A（键不存在时返回默认值）
```

**键唯一**：同一个键只能出现一次，重复赋值会覆盖原有值。

```python
d = {"a": 1, "a": 2}
print(d)  # {'a': 2}
```

**键必须可哈希**：通常为不可变对象（如 int、str、tuple）。

**有序（Python 3.7+）**：字典保留插入顺序，迭代时按插入先后输出。

**可变**：可以动态添加、修改、删除键值对。

### 底层实现

CPython 中 dict 使用**哈希表**实现，核心数据结构为 `PyDictObject`：

```c
typedef struct {
    PyObject_HEAD
    /* Number of items in the dictionary */
    Py_ssize_t ma_used;
    /* Dictionary version: globally unique, value change each time
     * the dictionary is modified */
    uint64_t ma_version_tag;
    /* Keys object: contains the hash table (indices) and entries array */
    PyDictKeysObject *ma_keys;
    /* If ma_values is NULL, the table is "combined": keys and values
     * are stored in ma_keys.
     * If ma_values is not NULL, the table is "split". */
    PyDictValues *ma_values;
} PyDictObject;
```

`PyDictObject` 本身并不直接存储键值对，而是将数据交由更底层结构维护。

- `PyObject_HEAD` 包含引用计数和类型指针
- `ma_used` 字典中实际存储的键值对数量
- `ma_version_tag` 全局唯一版本号，每次修改字典时递增，用于快速检测字典是否被修改

dict 的核心数据并不在 `PyDictObject` 中，而是由 `PyDictKeysObject` 负责维护。

- `ma_keys` 指向哈希表核心结构 `PyDictKeysObject`，包含两个关键数组：
  - **indices**（稀疏数组）：哈希表槽位，用于查找定位。
  - **entries**（紧凑数组）：按**插入顺序**紧凑存储实际数据，在 combined 模式下存储 `(hash, key, value)` 三元组；在 split 模式下只存 `(hash, key)`，value 存储在 `ma_values` 中。

```
indices:  [None, 0, None, 1, None, 2, ...]   # 稀疏哈希槽
entries:  [(h1, k1, v1), (h2, k2, v2), ...]  # 按插入顺序紧凑存储
```

> 这一设计既节省了内存，又天然保留了插入顺序。

- `ma_values` 为 `NULL` 时使用**合并模式**（combined），否则为**分离模式**（split，用于类实例 `__dict__` 的键共享优化）

> 详细底层代码可以参考[字典源码](https://github.com/python/cpython/blob/main/Include/cpython/dictobject.h)。

大致理解结构之后，现在来看查找过程：

1. 计算 key 的哈希值 `hash(key)`
2. 通过哈希值找到存储槽位置 `slot = hash(key) & mask`
3. 通过 indices 找到对应的 entries 索引
4. 比较 key 是否相等：相等则返回 value；不相等则继续 probing
5. 在 entries 中取出 (key, value)

**哈希冲突**：不同的 key 可能映射到同一槽位，CPython 使用**开放定址法**（探测法，pseudorandom probing）解决冲突。

当哈希表接近 2/3 满（考虑可用槽位）时触发扩容。

总结字典操作复杂度如下：

| 操作类型   | 时间复杂度  |
| ---------- | ----------- |
| 键查询     | 均摊 O(1)   |
| 插入/修改  | 均摊 O(1)   |
| 删除       | 均摊 O(1)   |
| 遍历       | O(n)        |

### 使用

**映射关系**

```python
user = {"name": "Alice", "age": 18}
```

**计数**

```python
from collections import Counter

text = "hello world"
count = Counter(text)
print(count["l"])  # 3
```

**分组**

```python
students = [("Alice", "A"), ("Bob", "B"), ("Charlie", "A")]

groups = {}
for name, grade in students:
    groups.setdefault(grade, []).append(name)
# {'A': ['Alice', 'Charlie'], 'B': ['Bob']}
```

**缓存**

```python
cache = {}

def fib(n):
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    cache[n] = fib(n - 1) + fib(n - 2)
    return cache[n]
```

## set 集合

Python 中使用花括号包括元素来创建一个集合，例如：

```python
my_set = {1, 2, 3}
```

注意：`{}` 创建的是空字典，创建空集合必须使用 `set()`：

```python
empty_set = set()        # 空集合
my_set = set([1, 2, 2, 3])  # {1, 2, 3}，自动去重
```

### 特点

**无序**：集合不保证元素顺序，不能依赖顺序进行访问或逻辑判断。

**唯一**：集合中的元素不重复，添加重复元素会被自动忽略。

```python
s = {1, 2, 2, 3, 3}
print(s)  # {1, 2, 3}
```

**元素必须可哈希**：集合的元素必须是可哈希类型，不能包含 `list`、`dict` 等可变对象。

**可变**：可以添加、删除元素（`frozenset` 是不可变版本，且可哈希）。

### 底层实现

CPython 中 set 也使用**哈希表**实现，结构与 dict 类似，但只存储 key，没有 value。

```c
typedef struct {
    PyObject_HEAD
    Py_ssize_t fill;    /* 已占用槽位（包括有效元素 + 删除后留下的 dummy），判断是否需要扩容 */
    Py_ssize_t used;    /* 当前实际存在的元素数量 */
    Py_ssize_t mask;    /* allocated - 1，用于计算槽位 index = hash & mask */
    setentry *table;    /* 指向哈希表 */
    ...
} PySetObject;
```

- 元素查询时，先计算 `hash(key)`，再通过 `index = hash & mask` 定位槽位
- 哈希冲突时同样使用探测法
- 当哈希表负载较高（接近 2/3）时，会触发扩容以降低冲突

> 详细底层代码可以参考[集合源码](https://github.com/python/cpython/blob/main/Objects/setobject.c)。

集合的**交集、并集、差集**等运算同样基于哈希表实现：

总结集合操作复杂度如下：

| 操作类型        | 时间复杂度     |
| --------------- | -------------- |
| 元素查询（in）  | 均摊 O(1)      |
| 插入            | 均摊 O(1)      |
| 删除            | 均摊 O(1)      |
| 并集（\|）      | O(m + n)       |
| 交集（&）       | O(min(m, n))   |
| 差集（-）       | O(m)           |
| 遍历            | O(n)           |

### 使用

**去重**

```python
nums = [1, 2, 2, 3, 3, 4]
unique = list(set(nums))  # [1, 2, 3, 4]
```

**快速成员检测**

相较于 list 的 O(n) 查询，set 的成员检测为均摊 O(1)：

```python
valid_tokens = {"abc", "xyz", "123"}
if token in valid_tokens:
    ...
```

**集合运算**

```python
a = {1, 2, 3}
b = {2, 3, 4}

print(a | b)  # 并集: {1, 2, 3, 4}
print(a & b)  # 交集: {2, 3}
print(a - b)  # 差集: {1}
print(a ^ b)  # 对称差集: {1, 4}
```

**权限/标签管理**

```python
user_roles = {"admin", "editor"}
required_roles = {"editor"}

if required_roles.issubset(user_roles):
    print("有权限")
```

## tuple vs list vs dict vs set

| 特性           | tuple 元组 | list 列表     | dict 字典    | set 集合       |
| ------------ | -------- | ----------- | ---------- | ------------ |
| 可变性          | 不可变    | 可变        | 可变       | 可变         |
| 有序性          | 有序     | 有序        | 有序（3.7+） | 无序（逻辑上）    |
| 底层结构         | 定长数组     | 动态数组（可扩容）   | 哈希表        | 哈希表          |
| 是否可哈希 | 内部均为可哈希元素时可以 | 不可以       | 不可以      | 不可以        |
| 存储内容         | 仅值       | 仅值          | 键值对        | 仅键（本质是 dict） |
| 元素唯一性        | 可重复    | 可重复       | key 唯一   | 唯一         |
| 查找复杂度        | O(n)     | O(n)        | 均摊 O(1)    | 均摊 O(1)      |
| 插入复杂度        | 不支持    | 均摊 O(1)（尾部） | 均摊 O(1)    | 均摊 O(1)      |
| 删除复杂度        | 不支持    | O(n)        | 均摊 O(1)    | 均摊 O(1)      |
| 内存占用         | 最小     | 较大          | 更大         | 较大           |
