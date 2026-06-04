---
tags: [mongodb, database]
title: 基础概念
---

## 常用数据类型

| 类型 | 说明 |
|--------|--------|
| String | 字符串 |
| Integer | 整数 |
| Double | 双精度浮点数 |
| Boolean | 布尔值 |
| Date | 日期 |
| Null | 空值 |
| Array | 数组 |
| Object | 嵌套对象 |
| ObjectId | 文档唯一 ID |


## 比较运算符

| 运算符       | 说明      |
| --------- | ------- |
| `$eq`     | 等于      |
| `$ne`     | 不等于     |
| `$gt`     | 大于      |
| `$gte`    | 大于等于    |
| `$lt`     | 小于      |
| `$lte`    | 小于等于    |
| `$in`     | 在指定数组中  |
| `$nin`    | 不在指定数组中 |
| `$exists` | 字段是否存在  |

### 示例

年龄大于 25：

```
db.students.find({
  age: {
    $gt: 25
  }
})
```

年龄在 20~30：

```
db.students.find({
  age: {
    $gte: 20,
    $lte: 30
  }
})
```


## 逻辑运算符

| 运算符    | 说明 |
| ------ | -- |
| `$and` | 与  |
| `$or`  | 或  |
| `$not` | 非  |
| `$nor` | 非或 |

### 示例：AND

```
db.students.find({
  $and: [
    { age: { $gte: 20 } },
    { fullTime: true }
  ]
})
```

### 示例：OR

```
db.students.find({
  $or: [
    { age: 18 },
    { age: 30 }
  ]
})
```
