---
tags: [mongodb, database]
title: 数据库/集合相关语句
---

## 数据库操作

### 查看当前数据库

```
db
```

### 查看所有数据库

```
show dbs
```

### 切换数据库

```
use <database_name>
```

> 数据库不存在时会自动创建，但只有插入数据后才会出现在 `show dbs` 中。

### 删除当前数据库

```
db.dropDatabase()
```

返回：

```json
{
  "dropped": "<database_name>",
  "ok": 1
}
```

## 集合（Collection）操作

### 查看所有集合

```
show collections
```

### 创建集合

```
db.createCollection("<collection_name>")
```

返回：

```json
{
  "ok": 1
}
```

### 删除集合

```
db.<collection_name>.drop()
```

### 创建固定大小集合（Capped Collection）

按容量限制：

```
db.createCollection(
  "logs",
  {
    capped: true,
    size: 100000
  }
)
```

按文档数量限制：

```
db.createCollection(
  "logs",
  {
    capped: true,
    size: 100000,
    max: 1000
  }
)
```


## 统计

### 统计文档数量

```
db.students.countDocuments()
```

### 条件统计

```
db.students.countDocuments({
  fullTime: true
})
```

### 查看集合大小

```
db.students.stats()
```

## 索引（Index）

### 创建升序索引

```
db.students.createIndex({
  name: 1
})
```

### 创建降序索引

```
db.students.createIndex({
  name: -1
})
```

### 创建联合索引

```
db.students.createIndex({
  age: 1,
  name: 1
})
```

### 查看索引

```
db.students.getIndexes()
```

### 删除索引

```
db.students.dropIndex({
  name: 1
})
```

### 删除所有索引

```
db.students.dropIndexes()
```


## 查看执行计划

```
db.students.find(filter).explain("executionStats")
```

重点关注：

| 类型       | 说明   |
| -------- | ---- |
| IXSCAN   | 使用索引 |
| COLLSCAN | 全表扫描 |

