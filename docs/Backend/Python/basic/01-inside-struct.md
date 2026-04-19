---
tags: [python, fundamental]
title: 内置库 struct
---

# 内置库 struct

`struct`是Python的内置标准库，不需要额外安装。它主要用于在Python的值与C语言结构体之间进行转换，常用于处理二进制数据。
以下是一些`struct`的基本用法：

```python
import struct  # 需要先导入，虽然是内置库但不会自动导入

# 基本用法示例
# pack: 将Python值转换为字节串
number = 12345
packed = struct.pack('<H', number)  # 转换为小端2字节无符号整数
print(packed)  # b'90\x00'

# unpack: 将字节串转换回Python值
unpacked = struct.unpack('<H', packed)[0]  # 从字节串转回数字
print(unpacked)  # 12345

# 常用格式符号：
# 'H' - 2字节无符号整数
# 'I' - 4字节无符号整数
# 'h' - 2字节有符号整数
# 'i' - 4字节有符号整数
# 'f' - 4字节浮点数
# 'd' - 8字节浮点数
# 'c' - 字符
# 's' - 字符串
```

字节序（Byte Order）标记：  
● `<` : 小端序（little-endian）  
● `>` : 大端序（big-endian）  
● `!` : 网络字节序（等同于大端序）  
● `@` : 本机字节序  
这个库在处理二进制协议、文件格式、网络通信等场景下非常有用。