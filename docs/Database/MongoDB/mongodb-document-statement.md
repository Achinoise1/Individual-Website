---
tags: [mongodb, database]
title: 文档（Document）相关语句
---

## 插入数据（Insert）

### 插入单条数据

```
db.students.insertOne({
  name: "Spongebob",
  age: 30,
  gpa: 3.5
})
```

### 插入多条数据

```
db.students.insertMany([
  {
    name: "Patrick",
    age: 38,
    gpa: 3.0
  },
  {
    name: "Sandy",
    age: 27,
    gpa: 3.8
  }
])
```

> 集合不存在时会自动创建。


## 查询（Read）

### 查询所有文档

```
db.students.find()
```

### 美化输出

```
db.students.find().pretty()
```

### 查询一条文档

```
db.students.findOne()
```

## 筛选

### 返回指定字段

```
db.students.find(
  {},
  {
    name: 1,
    age: 1
  }
)
```

排除 `_id`：

```
db.students.find(
  {},
  {
    name: 1,
    age: 1,
    _id: 0
  }
)
```

### 条件查询

```
db.students.find({
  name: "Spongebob"
})
```

### 排序

升序：

```
db.students.find().sort({
  name: 1
})
```

降序：

```
db.students.find().sort({
  name: -1
})
```

### 限制返回数量

```
db.students.find().limit(10)
```

### 跳过指定数量（分页）

```
db.students.find().skip(20)
```

结合 limit 可以实现分页查询：

```
db.students.find()
  .skip(20)
  .limit(10)
```

### 排序 + 分页

```
db.students.find()
  .sort({ age: -1 })
  .skip(20)
  .limit(10)
```

### 数组查询

**包含指定值**

```
db.students.find({
  hobbies: "game"
})
```

类似于：

```
WHERE hobbies CONTAINS 'game'
```

**包含多个值**

```
db.students.find({
  hobbies: {
    $all: ["game", "music"]
  }
})
```

**数组长度**

```
db.students.find({
  hobbies: {
    $size: 3
  }
})
```

## 更新（Update）

### 更新单条文档

```
db.students.updateOne(
  {
    name: "Spongebob"
  },
  {
    $set: {
      fullTime: true
    }
  }
)
```

### 更新多条文档

```
db.students.updateMany(
  {},
  {
    $set: {
      fullTime: false
    }
  }
)
```

### 更新不存在字段

```
db.students.updateMany(
  {
    fullTime: {
      $exists: false
    }
  },
  {
    $set: {
      fullTime: true
    }
  }
)
```

### 删除字段

```
db.students.updateOne(
  {
    name: "Spongebob"
  },
  {
    $unset: {
      fullTime: ""
    }
  }
)
```

### 自增字段

```
db.students.updateOne(
  {
    name: "Spongebob"
  },
  {
    $inc: {
      age: 1
    }
  }
)
```

## 删除（Delete）

### 删除一条文档

```
db.students.deleteOne({
  name: "Patrick"
})
```

### 删除多条文档

```
db.students.deleteMany({
  fullTime: false
})
```

### 删除全部文档

```
db.students.deleteMany({})
```

> 不删除集合，仅清空数据。