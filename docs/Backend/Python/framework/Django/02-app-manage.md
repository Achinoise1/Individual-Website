---
tags: [python, backend, django]
title: 应用管理
---

# 应用管理

## 组件说明

Django 项目由一个或多个应用组成，每个应用负责特定功能模块。

点击 `settings.py`，可以看到里面有很多配置项，其中 `INSTALLED_APPS` 是一个列表，列出了项目中安装的应用：

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions', 
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
```

- **django.contrib.admin**：内置的 Admin 后台应用
- **django.contrib.auth**：用户认证系统
- **django.contrib.contenttypes**：内容类型框架
- **django.contrib.sessions**：会话管理，已经不使用了，可删除
- **django.contrib.messages**：消息框架，用于展示一次性通知
- **django.contrib.staticfiles**：静态文件管理

## 创建应用

使用 `startapp` 命令创建一个新的应用：

```bash
python manage.py startapp playground
```

此时发现项目目录下多了一个 `playground` 目录，里面包含了应用的基本文件：

```bash
├── playground
│   ├── migrations
│   │   └── __init__.py
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   └── views.py
```

不难发现，`playground` 目录和 `storefront` 目录结构相似，都是一个 Django 应用的基本结构。

- `migrations` 目录：用于存放数据库迁移文件
- `__init__.py`：标识这是一个 Python 包
- `admin.py`：定义这个应用程序的管理界面是什么样的
- `apps.py`：应用配置文件
- `models.py`：定义数据模型，使用模型类从数据库中提取数据，呈现给用户
- `tests.py`：编写测试用例
- `views.py`：定义视图函数或类视图

现在我们需要在整个项目注册这个应用，在 `settings.py` 中的 `INSTALLED_APPS` 列表中添加 `'playground'`：

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions', 
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'playground',  # 添加应用
]
```