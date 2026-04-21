---
tags: [python, backend, django]
title: 视图管理
---

# 视图管理

视图函数是接受请求并返回相应的函数，负责处理用户的请求并返回响应。

在 playground 应用中，打开 `views.py` 文件，可以看到里面有一个默认的视图函数：

```python
from django.shortcuts import render

# Create your views here.
```

## 创建视图函数

在 `views.py` 文件中添加一个新的视图函数：

```python
from django.http import HttpResponse

def say_hello(request):
    return HttpResponse("Hello, World!")
```

现在我们需要将视图映射到 URL 上，才能通过浏览器访问它。

## 配置路由

在 `playground/` 目录下创建 `urls.py` 文件，并添加如下代码：

```python
from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.say_hello),
]
```

`urlpatterns` 是一个 URL 模式对象列表，这里用 `path` 函数定义 URL 模式对象。`path` 函数参数解析如下：  
1. URL 路由名称，字符串；不包含域名和参数部分
2. 视图函数，接收任意参数，返回一个 HttpResponse 对象

然后在 `storefront/urls.py` 中包含应用的路由，完整代码如下：

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('playground/', include('playground.urls')),
]
```

此时如果接收到客户端任意以 `playground/` 开头的 URL 请求，Django 就会去 `playground/urls.py` 中寻找匹配的 URL 模式对象，并调用对应的视图函数。

> 注意：
> 1. 在 `playground/urls.py` 中定义的 URL 模式对象是相对于 `storefront/urls.py` 中包含的 URL 模式对象的，所以访问 `say_hello` 视图函数的 URL 是 `http://localhost:<port>/playground/hello/`。
> 2. URL 路由名称必须以斜杠结尾，否则访问时会自动重定向到带斜杠的 URL，导致访问失败。

## 模板(template)管理

我们在 `playground` 目录下新建一个 `templates` 目录，在 `templates` 目录下新建一个 `hello.html` 文件，添加如下代码：

```html
<html>
    <body>
        <h1>Hello, {{ name }}!</h1>
    </body>
</html>
```

> 上述格式遵循 jinja2 模板语法，`{{ name }}` 是一个变量占位符，表示在渲染模板时会被替换成实际的值。

修改 `views.py` 中的 `say_hello` 视图函数，使用 `render` 函数渲染模板：

```python
from django.shortcuts import render

def say_hello(request):
    return render(request, 'hello.html', {'name': 'Today Red'})
```

`render` 函数参数解析如下：
1. 请求对象
2. 模板名称，字符串；相对于 `templates` 目录的路径
3. 模板上下文，字典；传递给模板的数据

访问 `http://localhost:<port>/playground/hello/`，能看到如下页面：

![img](02-view-manage/jinja-param.png)

修改 `hello.html` 模板文件，添加条件语句，如果 `name` 存在则显示 `Hello, <name>!`，否则显示 `Hello, World`：

```html
{% if name %}
    <h1>Hello, {{ name }}!</h1>
{% else %}
    <h1>Hello, World</h1>
{% endif %}
```

这样看可能非常奇怪，但对于 Django 来说这是个可以模块化的内容，因此可以轻松使用不同内容进行替换。

> 一般对于大型项目，不会操作实现模板，更多是实现 API 接口
