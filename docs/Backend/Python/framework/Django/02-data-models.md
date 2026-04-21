---
tags: [python, backend, django]
title: 数据模型
---

# 数据模型

## 实例引入

在电子商务领域，产品（product）是一个核心实体，一个产品可能包含以下属性：

- 产品名称
- 产品描述
- 产品价格
- 产品库存

而产品一般会进行归类，每个分类（collection）也有自己的属性，例如：

- 分类名称

现在这两个实体是独立的关系，需要连接起来。假设产品和分类之间是多对一的关系，即一个分类下可以有多个产品，但一个产品只能属于一个分类。

> 关系可以是一对一、一对多、多对多等，具体关系类型取决于业务需求。

现在还需要一个购物车（cart）实体：

- 创建时间（可以进行清理，例如超过30天仍未结算的购物车） 
  
由于购物车和产品之间是多对多的关系，即一个购物车可以包含多个产品，一个产品也可以出现在多个购物车中，因此需要一个关联实体（购物物品-cart item）来连接它们。

- 一个购物车包含多个购物物品，一个购物物品只属于一个购物车
- 一个购物物品对应一个产品，但一个产品可以对应多个购物物品

由于我们需要允许用户在未登录情况下也能使用购物车，因此购物车暂时不与用户进行关联。

一个用户（user）实体通常包括以下属性：

- 用户名
- 邮箱
...

简单起见先保留用户名和邮箱属性。一个用户可以有多个订单（order），对于订单实体，目前只关心**下单时间**。

由于产品和订单之间也存在多对多的关系，因此需要一个关联实体（订单项-order item）来连接它们。

- 一个订单包含多个订单项，一个订单项只属于一个订单
- 一个订单项对应一个产品，但一个产品可以对应多个订单项
  
在此基础上，我们还可以添加一个标签（tag）实体，产品和标签之间是多对多的关系，在后续再详细展开说明。

## 管理数据模型

由于一个 django 项目下有多个应用，每个应用都可以定义自己的数据模型，这里将探究使用不同的方式来管理数据模型。

**方式一：使用一个 app 存放所有实体**

- 优点：django 中的应用程序可以进行分发，因此不需要重复定义相同的数据模型。
- 缺点：当项目变得庞大时，单个应用程序可能会变得臃肿，难以维护。

**方式二：使用多个 app 存放所有实体**

我们在设计时应当遵循一个原则：Do one thing and do it well。每个应用程序应该专注于一个特定的功能模块，这样可以提高代码的可维护性和可扩展性。

上述的数据实体中，可以分为四个 app：

- 应用：product，包含产品、分类和标签实体
- 用户：customer，包含用户实体
- 购物车：cart，包含购物车和购物物品实体
- 订单：order，包含订单和订单项实体

每个应用程序都专注于一个特定的功能模块，相比方案一代码更清晰，易于维护。

但这存在一个问题：由于这些实体之间存在关联关系，因此需要在不同应用程序之间进行引用和连接，这可能会增加代码的复杂性和耦合度。并且需要下载每一个 app。

**方式三：使用一个 app 存放所有实体，其他 app 进行引用**

由于tag实体不仅限于电子商务功能，其他功能模块也可能需要使用标签，因此可以将标签实体单独放在一个 app 中，其他 app 进行引用。

这样既能确保每个应用程序专注于一个特定的功能模块，又能避免过多的应用程序之间的耦合。

## 实操

### 创建 store 和 tags 应用

使用 `startapp` 命令创建一个新的应用：

```bash
python manage.py startapp store
python manage.py startapp tags
```

并更新 `settings.py` 中的 `INSTALLED_APPS`：

```python
INSTALLED_APPS = [
    # ...
    'store',
    'tags',
]
```

在 `store/models.py` 文件中定义产品、分类、购物车、订单等实体

```python
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)     
    description = models.TextField()            
    price = models.DecimalField(max_digits=6, decimal_places=2)
    inventory = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)

class Customer(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=255)
    birth_date = models.DateField(null=True)
```

可用的字段类型有很多，例如 `CharField`、`TextField`、`DecimalField`、`IntegerField` 等等，具体使用哪种字段类型取决于数据的性质和需求。详细见[field-types](https://docs.djangoproject.com/en/6.0/ref/models/fields/#field-types)

不同的字段类型中有通用的可选参数，例如 `max_length`、`null`、`blank` 等等，具体使用哪些参数取决于数据的需求和约束。详细见[field-options](https://docs.djangoproject.com/en/6.0/ref/models/fields/#field-options)

字段类型特定的通用参数详见对应字段类型下的说明，以 `CharField` 为例，除了通用参数外，还有 `max_length`、`db_collection`。详细见[CharField](https://docs.djangoproject.com/en/6.0/ref/models/fields/#charfield)

> 注意：Django 会自动为每个模型类添加一个名为 `id` 的主键字段，类型为 `AutoField`，并且会自动递增。因此在定义模型类时不需要显式地定义主键字段，除非你想使用不同类型的主键或者自定义主键名称。

在 `tags/models.py` 文件中定义标签实体。

