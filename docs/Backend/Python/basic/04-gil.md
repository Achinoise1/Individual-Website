---
tags: [python, fundamental]
title: 全局解释器锁（GIL）
---

import { RoughNotation } from "react-rough-notation";

# 全局解释器锁（Global Interpreter Lock）

## 背景

Python 诞生之初，多核 CPU 尚不普及，简单高效地实现解释器是首要目标。  
CPython 使用 **引用计数（Reference Counting）** 作为主要垃圾回收机制，每个对象都维护一个计数值：

- 有新引用指向该对象：计数 +1
- 某个引用消失：计数 -1
- 计数降为 0：立即释放内存

这套机制在单线程下运转完美，但**引用计数本身不是线程安全的**。

假设两个线程同时对同一个对象做 `+1` 操作：

```ascii
时间 ─────────────────────────────────►

线程1:  [读取:1] → [计算:2] → [写入:2]    结束
                         ↘
线程2:       [读取:1] → [计算:2] → [写入:2]

内存:    1              1        2        2
                                   ↑
                             期望是3，实际是2
```

1. 线程1读取计数 = 1
2. 线程2也读取计数 = 1（线程1还没写回）
3. 线程1写入 2
4. 线程2也写入 2

本该是 `1 → 2 → 3`，结果却是 `1 → 2`。

这种现象被称为**竞争条件（Race Condition）**：

<div className="alert alert--info"> 
    <span>**竞争条件** 不是"线程冲突"，而是多线程环境下，代码逻辑依赖于执行顺序，而执行顺序不可控。</span> 
</div>

如果放任竞争条件，会引发两类严重问题：

**引用计数错误**：正确计数应该是 N+2，实际变成 N+1，导致对象被提前释放，而另一个线程还在持有它。

```
期望: N+2 → N+1 → 对象仍然存活 ✅
实际: N+1 → N   → 被提前回收  ❌
```

**Use-After-Free（释放后使用）**：

```ascii
错误情况：
[应为2，实际为1] → [一个引用消失] → [计数=0] → [提前释放]
                                               ↓
                                [另一个线程还在使用] → 💥 崩溃
```

这类问题在 C 层（CPython 解释器的底层实现代码）是灾难级别的。  
为了根治这个问题，CPython 引入了 GIL。

## 技术概述

GIL（Global Interpreter Lock，全局解释器锁）是 **CPython 解释器**（最主流的 Python 实现）中的一种机制，它规定：

> 在同一时刻，一个 Python 解释器进程中只能有一个线程执行 Python 字节码。

也就是说：即使创建了 10 个线程，在执行 Python 代码时，也必须先抢到 GIL 才能运行。

GIL 像一个全局执行令牌：

* 谁拿到谁执行
* 其他线程必须等待

执行过程如下：

线程 A 拿到 GIL → 执行一段时间 → 释放 GIL  
线程 B 再拿到 GIL → 执行 → 再释放  

它们是 **轮流运行（concurrent）**，而不是 **真正并行（parallel）**。

## 原理解析

GIL 通过保证"同一时刻只有一个线程执行 Python 字节码"，彻底消除了引用计数的竞争问题：

```ascii
持有GIL ─────────────────────────────────────►
线程1:  [读取:1] → [计算:2] → [写入:2] → 释放GIL

等待GIL → 持有GIL ────────────────────────►
线程2:                           [读取:2] → [计算:3] → [写入:3]

内存:    1              2                   3
                                   ✅ 正确
```

**GIL 的释放时机**：

- 执行了一定数量的字节码指令后（由 `sys.getswitchinterval()` 控制，默认 5ms）
- 线程发起 I/O 操作（网络、文件读写）时，**主动释放** GIL，让其他线程得以运行
- 调用 C 扩展时，若该扩展不需要访问 Python 对象，可以手动释放 GIL（NumPy、OpenCV 等均如此）

牺牲了并行能力，换来了：

* 实现简单
* 内存安全
* 单线程性能高

## 实践示例

### CPU 密集型：多线程 vs 多进程

```python
import threading
import multiprocessing
import time

def cpu_task(n=50_000_000):
    """纯计算任务，模拟 CPU 密集型"""
    count = 0
    for _ in range(n):
        count += 1
    return count

# ── 多线程（受 GIL 限制）──
start = time.perf_counter()
threads = [threading.Thread(target=cpu_task) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(f"多线程耗时: {time.perf_counter() - start:.2f}s")

# ── 多进程（绕过 GIL）──
start = time.perf_counter()
with multiprocessing.Pool(4) as pool:
    pool.map(cpu_task, [50_000_000] * 4)
print(f"多进程耗时: {time.perf_counter() - start:.2f}s")
```

> 在 4 核机器上，多进程的耗时约为多线程的 1/4，差距显著。

### I/O 密集型：多线程依然有效

```python
import threading
import time
import urllib.request

urls = [
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/delay/1",
]

def fetch(url):
    urllib.request.urlopen(url)

# ── 串行 ──
start = time.perf_counter()
for url in urls:
    fetch(url)
print(f"串行耗时: {time.perf_counter() - start:.2f}s")   # ~4s

# ── 多线程（I/O 等待时自动释放 GIL）──
start = time.perf_counter()
threads = [threading.Thread(target=fetch, args=(url,)) for url in urls]
for t in threads: t.start()
for t in threads: t.join()
print(f"多线程耗时: {time.perf_counter() - start:.2f}s")  # ~1s
```

### 释放 GIL 的 C 扩展（NumPy）

```python
import numpy as np
import threading
import time

def numpy_task():
    """NumPy 的底层 C 代码会释放 GIL"""
    a = np.random.rand(10_000_000)
    np.sum(a ** 2)

start = time.perf_counter()
threads = [threading.Thread(target=numpy_task) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(f"NumPy 多线程耗时: {time.perf_counter() - start:.2f}s")
# NumPy 会主动释放 GIL，多线程仍能获得并行加速
```

## 优缺点

GIL 的存在是一种工程权衡：

| 维度             | 说明                                       |
| ---------------- | ------------------------------------------ |
| ✅ 实现简单       | 无需为每个对象单独加锁，解释器代码大幅简化 |
| ✅ 内存安全       | 彻底消除引用计数竞争，避免崩溃和内存泄漏   |
| ✅ 单线程性能高   | 减少了锁的开销，单线程场景下运行更快       |
| ✅ C 扩展开发友好 | 扩展库作者无需担心大多数线程安全问题       |
| ❌ 无法多核并行   | CPU 密集型任务无法通过多线程利用多核       |
| ❌ 线程切换开销   | 多线程争抢 GIL 会产生额外调度开销          |

与细粒度锁方案的对比：

| 方案     | 优点           | 缺点               |
| -------- | -------------- | ------------------ |
| 细粒度锁 | 并行度高       | 实现复杂、容易死锁 |
| GIL      | 实现简单、安全 | 无法多核并行       |

## 适用场景

### 对 CPU 密集型任务的影响

<table>
<tr><td>特点</td><td>CPU 一直满负荷计算、很少等待</td></tr>
<tr><td>瓶颈</td><td>CPU 主频、核心数量</td></tr>
<tr><td>例子</td><td>视频编解码、图像处理、科学计算、机器学习训练、数据压缩</td></tr>
</table>

<div className="alert alert--info"> 
    <span>CPU 密集型任务无法真正利用多核，多线程反而可能因频繁争抢 GIL 而比单线程更慢。</span> 
</div>

### 对 I/O 密集型任务的影响

<table>
<tr><td>特点</td><td>大量时间在等待 I/O 响应</td></tr>
<tr><td>例子</td><td>网络爬虫、Web 服务、数据库查询、文件读写</td></tr>
</table>

当线程等待 I/O 时，会**主动释放 GIL**，此时其他线程可以运行，多线程依然有效。

### 如何选择并发方案？

| 场景             | 推荐方式                    | 原因                       |
| ---------------- | --------------------------- | -------------------------- |
| CPU 密集型       | 多进程（`multiprocessing`） | 每个进程独立 GIL，真正并行 |
| I/O 密集型       | 多线程 / `asyncio`          | I/O 等待时释放 GIL，开销小 |
| 需要共享大量数据 | 多线程                      | 进程间通信代价高           |
| 追求真正并行     | 多进程                      | 突破 GIL 限制              |

## 常见问题

**Q：Python 3.13 的"No-GIL"模式是什么？**

Python 3.13 引入了实验性的自由线程模式（Free-threaded，`--disable-gil`），允许在没有 GIL 的情况下运行多线程。但目前仍处于实验阶段，生态兼容性有限，生产环境不建议启用。

**Q：`threading.Lock()` 和 GIL 有什么区别？**

GIL 保护的是 CPython 解释器内部的引用计数等底层结构；`threading.Lock()` 是应用层的同步工具，用于保护用户代码中的共享状态（如共享列表、字典等）。两者都需要，不可相互替代。

**Q：使用 `multiprocessing` 有什么代价？**

进程间通信（IPC）需要序列化数据（通过 `pickle`），启动子进程也有额外开销。适合任务粒度较大、数据量适中的场景；对于大量小任务，`asyncio` 或线程池通常更合适。

**Q：NumPy / PyTorch 不受 GIL 影响吗？**

这些库的核心计算在 C/C++ 层完成，可以在调用期间主动释放 GIL，让其他线程同时运行 Python 代码。因此搭配多线程使用时，仍能获得一定的并行加速。

## 总结

GIL 的本质是：

> 用"牺牲多核并行能力"换取"解释器实现简单和内存安全"。

核心记忆点：

* **I/O 密集型任务** → 多线程依然高效（I/O 等待时主动释放 GIL）
* **CPU 密集型任务** → 使用多进程（`multiprocessing`）绕过 GIL
* **科学计算** → NumPy / PyTorch 等库在 C 层释放 GIL，多线程也能加速
* **未来趋势** → Python 3.13+ 正在探索 No-GIL 方案，但尚未成熟