---
tags: [python, backend, django]
title: ORM 进阶查询
---

# ORM 进阶查询

## 数据排序

数据模型管理器中其实有一个非常有用的方法叫做 `order_by()`，它可以用来对查询结果进行排序。例如我们想要按照产品标题来排序：

```python
queryset = Product.objects.order_by('title')
```

保存并刷新，得到如下内容：

![alt text](04-django-orm-advanced/order-by-title.png)

查看 SQL 执行情况：

![alt text](04-django-orm-advanced/order-by-title-sql-execution.png)

如果我们想要降序排序，可以在字段名前加上 `-`：

```python
queryset = Product.objects.order_by('-title')
```

也可以按多个字段排序，比如在按单价升序排序，单价相同的情况下按标题降序排序：

```python
queryset = Product.objects.order_by('unit_price', '-title')
```

事实上 queryset 对象还有一个 `reverse()` 方法可以用来反转排序顺序，例如：

```python
queryset = Product.objects.order_by('unit_price', '-title').reverse()
```

也就意味着上述查询返回的是按单价降序排序，单价相同的情况下按标题升序排序的结果。

> order_by 返回的 queryset 可以做进一步处理，详情参考：[QuerySet API reference](https://docs.djangoproject.com/en/6.0/ref/models/querysets/#order-by)。

这里我们可以获取单一集合的产品，然后按单价进行排序：

```python
queryset = Product.objects.filter(collection__id=1).order_by('unit_price')
```

有时我们想在排序后只获取第一个对象：

```python
product = Product.objects.order_by('unit_price')[0]
```

也可以通过以下方式实现按升序排序并返回第一个对象：

```python
product = Product.objects.earliest('unit_price')
```

或者按降序排序并返回第一个对象：

```python
product = Product.objects.latest('unit_price')
```

## 限制结果返回

假设我们有很多数据需要返回，我们可以分页返回，每页只显示 5 个结果，可以使用切片来限制返回的结果数量：

```python
queryset = Product.objects.all()[:5]
```

保存并刷新，得到如下内容：

![alt text](04-django-orm-advanced/query-first-five-product.png)

查看 SQL 执行情况：

![alt text](04-django-orm-advanced/query-first-five-product-sql-execution.png)

如果想要查看第二页的数据（第 6-10 个结果），可以使用：

```python
queryset = Product.objects.all()[5:10]
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/query-second-five-product.png)

## 查询子集

从前面的例子中我们不难看出，查询默认返回全部字段数据，但是有时候我们可能只需要查询部分字段数据，这时可以使用 `values()` 方法：

```python
queryset = Product.objects.values('id', 'title')
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/select-subfield-sql-execution.png)

同样的，我们也可以读取关联表中的字段：

```python
queryset = Product.objects.values('id', 'title', 'collection__title')
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/select-related-subfield-sql-execution.png)

在前面我们使用筛选等方式返回的查询集是一个包含模型实例的查询集，如果我们使用 `values()` 方法返回的查询集则是一个包含**字典**的查询集，每个字典对应一个对象，字典的键是字段名称，值是字段值。修改 `playground/templates/hello.html` 代码如下：

```html
<html>
    <body>
        {% if name %}
        <h1>Hello {{ name }}</h1>
        {% else %}
        <h1>Hello, World</h1>
        {% endif %}
        <ul>
            {% for product in products %}
            //git-delete-start
            <li>{{ product.title }}</li>
            //git-delete-end
            // git-add-start
            <li>{{ product }}</li>
            // git-add-end
            {% endfor %}
        </ul>
    </body>
</html>
```

保存并刷新，得到如下内容：

![alt text](04-django-orm-advanced/select-related-subfield-dict.png)

如果将 python 代码中的 `values()` 方法替换成 `values_list()` 方法：

```python
queryset = Product.objects.values_list('id', 'title', 'collection__title')
```

保存并刷新，得到如下内容：

![alt text](04-django-orm-advanced/select-related-subfield-tuple.png)

> 小练习：获取已订购的产品，并按标题进行排序

```python
from django.shortcuts import render
from store.models import Product, OrderItem

def say_hello(request): 
    queryset = Product.objects.filter(id__in=OrderItem.objects.values('product_id').distinct()).order_by('title')

    return render(request, 'hello.html', {'name': 'Today Red', 'products': list(queryset)})
```

## 延迟字段

django 中的查询集默认会返回所有字段数据，但有时候我们可能只需要查询部分字段数据，这时可以使用 `only()` 方法：

```python
queryset = Product.objects.only('id', 'title')
```

`only()` 函数与 `values()` 函数的区别在于，`only()` 返回的查询集仍然包含模型实例，但这些实例只有指定的字段被加载，其他字段是延迟加载的。当访问未加载的字段时，Django 会自动执行一个新的查询来获取该字段的数据。

![alt text](04-django-orm-advanced/lazy-fields.png)

使用这个方法的时候需要注意，如果访问了未加载的字段，Django 会执行一个新的查询来获取该字段的数据，这可能会导致 N+1 问题等性能相关问题。因此，在使用 `only()` 方法时，应该确保只访问那些被指定的字段，以避免不必要的数据库查询。

修改 `playground/templates/hello.html` 代码如下：

```html showLineNumbers
<html>
    <body>
        {% if name %}
        <h1>Hello {{ name }}</h1>
        {% else %}
        <h1>Hello, World</h1>
        {% endif %}
        <ul>
            {% for product in products %}
            // git-delete-start
            <li>{{ product.title }}</li>
            // git-delete-end
            // git-add-start
            <li>{{ product.title }} - {{ product.unit_price }}</li>
            // git-add-end
            {% endfor %}
        </ul>
    </body>
</html>
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/load-extra-fields-sql-execution-1.png)

![alt text](04-django-orm-advanced/load-extra-fields-sql-execution-2.png)

由于我们在查询集中使用了 `only()` 方法来指定只加载 `id` 和 `title` 字段，当我们在模板中额外访问 `unit_price` 字段时，Django 会自动执行新的查询来获取该字段的数据，因此产生大量的查询，进而导致耗时增加。

如果存在上述需求：也即在查询集中只加载部分字段，但又可能需要访问其他字段的数据，我们可以使用 `defer()` 方法来指定哪些字段不被加载。假设产品描述字段不需要立即加载：

```python
queryset = Product.objects.defer('description')
```

但同样需要注意的是，如果后续访问了被 `defer()` 方法指定的字段，Django 也会逐个执行新的查询来获取该字段的数据。

## 选择关联对象

有时我们需要预先加载一堆对象。修改 `playground/views.py` 代码如下：

```python
def say_hello(request):
    queryset = Product.objects.all()
    return render(request, 'hello.html', {'name': 'Today Red', 'products': list(queryset)})
```

修改 `playground/templates/hello.html` 代码如下：

```html
<html>
    <body>
        {% if name %}
        <h1>Hello {{ name }}</h1>
        {% else %}
        <h1>Hello, World</h1>
        {% endif %}
        <ul>
            {% for product in products %}
            <li>{{ product.title }} - {{ product.collection.title }}</li>
            {% endfor %}
        </ul>
    </body>
</html>
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/direct-select-sql-execution.png)

由于我们在模板中访问了 `product.collection.title`，Django 会为每个产品执行一个新的查询来获取其所属集合的标题，这可能会导致 N+1 查询问题。为了避免这个问题，我们可以使用 `select_related()` 方法来预加载关联对象：

```python
queryset = Product.objects.select_related('collection').all()
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/select-related-sql-execution.png)

还有一种方式是使用 `prefetch_related()` 方法来预加载关联对象：

```python
queryset = Product.objects.prefetch_related('promotions').all()
```

修改 `playground/templates/hello.html` 代码如下：

```html
<html>
    <body>
        {% if name %}
        <h1>Hello {{ name }}</h1>
        {% else %}
        <h1>Hello, World</h1>
        {% endif %}
        <ul>
            {% for product in products %}
            // git-delete-start
            <li>{{ product.title }} - {{ product.collection.title }}</li>
            // git-delete-end
            // git-add-start
            <li>{{ product.title }}</li>
            // git-add-end
            {% endfor %}
        </ul>
    </body>
</html>
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/prefetch_related-sql-execution.png)

两者的区别在于，`select_related()` 使用 SQL 的 JOIN 来一次性获取相关对象的数据，而 `prefetch_related()` 则会执行两个独立的查询来获取相关对象的数据，并在 Python 代码中进行关联。`select_related()` 适用于多对一或一对一，`prefetch_related()` 适用于多对多或一对多。

如果同时需要获取一对一关系和多对多关系的数据，可以链式使用 `select_related()` 和 `prefetch_related()`，调用的先后顺序不会影响结果获取：

```python
queryset = Product.objects.select_related('collection').prefetch_related('promotions').all()
```

保存并刷新，查看 SQL 执行情况：

![alt text](04-django-orm-advanced/both-related-sql-execution.png)

> 小练习：获取最近的 5 个订单和订单对应的用户，并获取对应的订单项和相关的产品数据：

```python
queryset = Order.objects.prefetch_related('orderitem_set__product').select_related('customer').order_by('-placed_at')[:5]
```

## 聚合

假设需要对产品进行计算，修改 `playground/views.py` 代码如下：

```python
from django.shortcuts import render
# git-add-start
from django.db.models import Count, Min, Max, Avg, Sum
# git-add-end
from store.models import Product

def say_hello(request): 
    result  = Product.objects.aggregate(Count('id'))
    
    # git-delete-start
    return render(request, 'hello.html', {'name': 'Today Red', 'products': list(queryset)})
    # git-delete-end
    # git-add-start
    return render(request, 'hello.html', {'name': 'Today Red', 'result': list(result)})
    # git-add-end
```

修改 `playground/templates/hello.html` 代码如下：

```html
<html>
    <body>
        {% if name %}
        <h1>Hello {{ name }}</h1>
        {% else %}
        <h1>Hello, World</h1>
        {% endif %}
        // git-delete-start
        <ul>
            {% for product in products %}
            <li>{{ product.placed_at }} - {{ product.payment_status }}</li>
            {% endfor %}
        </ul>
        // git-delete-end
        // git-add-start
        {{ result }}
        // git-delete-end
    </body>
</html>
```

保存并刷新网页：

![alt text](04-django-orm-advanced/aggregate-count.png)

我们可以修改键名：

```python
result  = Product.objects.aggregate(count=Count('id'))
```

保存并刷新网页：

![alt text](04-django-orm-advanced/aggregate-count-change-key.png)

除此之外我们还可以进行其他的聚合计算，例如：

```python
result  = Product.objects.aggregate(count=Count('id'), min_price=Min('unit_price'))
```

保存并刷新网页：

![alt text](04-django-orm-advanced/aggregate-count-min-price.png)

可以看到 `min_price` 是具有值的十进制对象。

`aggregate()` 方法返回一个字典，并且可以在任何有查询集的地方调用。因此我们可以在筛选后的查询集上调用 `aggregate()` 方法来计算满足特定条件的对象的聚合值，例如：

```python
result  = Product.objects.filter(unit_price__gt=20).aggregate(count=Count('id'), min_price=Min('unit_price'))
```

## 注释

有时候我们希望在查询集中添加一些注释来帮助调试或者记录一些额外的信息，Django 提供了 `annotate()` 方法来实现这个功能。例如我们想要在查询集中添加一个注释字段来计算每个产品的订单数量：

```python
queryset = Customer.objects.annotate(is_new=True)
```

保存并刷新：

![alt text](04-django-orm-advanced/annotate-is-new.png)

此时提示报错， `annotate()` 接受了非表达式类型的参数 `is_new`。

Django 中提供了一个表达式基类 `Expression`，该类派生出了一系列的表达式类，例如 `F()`、`Func()`、`Value()`、`Aggregate()` 等等，这些表达式类可以用来构建复杂的查询和注释。

也就是说我们不能直接传递布尔值，而是需要传递一个表达式对象。我们可以使用 `Value()` 函数来将其转换为表达式：

```python
from django.db.models import Value
# highlight-next-line
queryset = Customer.objects.annotate(is_new=Value(True))
```

保存并刷新，此时没有报错，查看 sql 执行情况：

![alt text](04-django-orm-advanced/annotate-value-sql-execution.png)

此时每个客户对象都会有一个名为 `is_new` 的新字段，并且值为 `True`。

还是以上面的例子为基础，我们可以使用 `F()` 函数来构造一个新 id 字段：

```python
from django.db.models import F
# highlight-next-line
queryset = Customer.objects.annotate(new_id=F('id'))
``` 

保存并刷新，查看 sql 执行情况：

![alt text](04-django-orm-advanced/annotate-f-sql-execution.png)

我们还可以在此基础上进行运算：

```python
from django.db.models import F
# highlight-next-line
queryset = Customer.objects.annotate(new_id=F('id') + 1000)
```

保存并刷新，查看 sql 执行情况：

![alt text](04-django-orm-advanced/annotate-calc-f-sql-execution.png)

## 调用数据库函数

Django 提供了一个 `Func()` 函数来调用数据库函数，例如我们想要在查询集中添加一个注释字段来显示用户完整名称：

```python
from django.db.models import Func
# highlight-next-line
queryset = Customer.objects.annotate(full_name=Func(F('first_name'), Value(' '), F('last_name'), function='CONCAT'))
```

保存并刷新，查看 sql 执行情况：

![alt text](04-django-orm-advanced/annotate-func-sql-execution.png)

![alt text](04-django-orm-advanced/annotate-func-sql-execution-result.png)

当然，由于 Django 已经内置了 `Concat()` 函数，我们也可以直接使用它来实现同样的功能：

```python
from django.db.models import Concat, Value
# highlight-next-line
queryset = Customer.objects.annotate(full_name=Concat('first_name', Value(' '), 'last_name'))
```

这里可以不使用 `F()` 函数来引用字段，因为 `Concat()` 函数已经内置了对字段的处理。但是还是需要使用 `Value()` 函数来将常量字符串转换为表达式，否则会将常量字符串识别成要拼接的字段。

> 完整的内置数据库函数列表可以参考：[Database Functions](https://docs.djangoproject.com/en/6.0/ref/models/database-functions/)。这里显示的函数是数据库通用函数，而每个数据库引擎会有特定的函数，需要使用 `Func()` 函数来调用。

## 数据分组




## 视频参考

- [Sorting](https://www.bilibili.com/video/BV1eX4y1f7Pz/?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=89#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Sorting,-03%3A50)
- [Limiting Results](https://www.bilibili.com/video/BV1eX4y1f7Pz/?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=89#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Limiting_Results,-01%3A24)
- [Selecting Fields to Query](https://www.bilibili.com/video/BV1eX4y1f7Pz/?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=89#:~:text=Selecting_Fields_to_Query)
- [Deferring Fields](https://www.bilibili.com/video/BV1eX4y1f7Pz/?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=89#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Deferring_Fields,-03%3A16)
- [Selecting Related Objects](https://www.bilibili.com/video/BV1eX4y1f7Pz?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=31#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Selecting_Related_Objects,-09%3A14)
- [Aggregating Objects](https://www.bilibili.com/video/BV1eX4y1f7Pz?buvid=YE475CE25E5DEE6C4D489CF6BE7345D3A0FA&is_story_h5=false&mid=s7e7OMeFxsQ0%2BaceMEAs0g%3D%3D&plat_id=114&share_from=ugc&share_medium=iphone&share_plat=ios&share_source=COPY&share_tag=s_i&timestamp=1776864904&unique_k=33AN7Dk&up_id=35923455&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&spm_id_from=333.788.videopod.episodes&p=31#:~:text=%E3%80%90Django-,ORM,-%E3%80%91Aggregating_Objects)
- [Annotating Objects](https://www.bilibili.com/video/BV1eX4y1f7Pz/?p=33&spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=8e3f5b7e9cf313d9ea63238d28816b11#:~:text=%E3%80%90Django%20ORM%E3%80%91-,Annotating_Objects,-03%3A37)
- [Calling Database Functions](https://www.bilibili.com/video/BV1eX4y1f7Pz/?p=33&spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=8e3f5b7e9cf313d9ea63238d28816b11#:~:text=Calling_Database_Functions)