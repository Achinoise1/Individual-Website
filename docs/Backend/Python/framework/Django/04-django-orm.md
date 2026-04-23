---
tags: [python, backend, django]
title: ORM
---

# ORM

## 简介

ORM（Object-Relational Mapping）是一种将关系型数据库中的数据表映射为面向对象编程语言中的类和对象的技术。它允许开发者使用面向对象的方式来操作数据库，而不需要直接编写 SQL 语句。

如果不使用 ORM，我们需要手动操作把数据库的行数据映射成对象，耗时且重复：

```python
sql = "SELECT * FROM product"
result = cursor.execute(sql)

for row in result:
    product = Product()
    product.title = row[1]
    product.price = row[2]
    # 其他字段...
```

而使用 ORM 后，我们可以直接通过类和对象来操作数据库：

```python
products = Product.objects.all()
for product in products:
    print(product.title, product.price)
```

但这并不意味着 ORM 是万能的，在某些复杂查询或性能要求较高的场景下，直接编写 SQL 可能更高效。因此，了解 ORM 的原理和使用场景非常重要。总体来说，ORM：

- 降低代码的复杂性，使其更易读和维护
- 提高开发效率，减少重复代码

> 过早的优化是万恶之源，先使用 ORM 来快速开发和迭代，等到性能成为瓶颈时再考虑直接编写 SQL 来优化特定查询。

Django 的 迁移（migration）就是很好的例子，我们执行迁移后，这些表格和字段的创建、修改等操作通过 ORM 来即刻实现，我们不需要关心底层 SQL 如何执行。实际上，迁移也是 ORM 的一部分。

也许你可能也注意到了，现有的数据模型都是通过继承 Django 的 `models.Model` 来定义的，这也是 ORM 的核心设计之一。通过继承 `models.Model`，我们可以利用 Django 提供的各种字段类型、查询接口和迁移工具来管理数据库中的数据模型。


## 视频参考

- [Django ORM](https://www.bilibili.com/video/BV1eX4y1f7Pz/?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=89#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Django_ORM,-03%3A23)