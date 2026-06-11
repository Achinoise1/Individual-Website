---
tags: [sql, database]
title: CRUD 操作
---

# CRUD 操作

## 列属性

![alt text](crud/column-attr-show.png)

图中各列属性说明如下：

| 名称 | 全称 | 说明 |
| --- | --- | --- |
| `Column` | / | 列名称 |
| `DataType` | / | 对应的数据类型 |
| `PK` | Primary Key | 主键 |
| `NN` | Not Null | 非空 |
| `UQ` | Unique | 唯一 |
| `BIN` | Binary | 二进制存储，字符串比较时区分大小写（启用后以二进制方式存储和比较数据） |
| `UN` | Unsigned | 无符号，仅适用于数值类型，使该列只能存储非负数，取值范围从 0 开始，上限翻倍 |
| `ZF` | Zero Fill | 零填充，数值不足指定显示宽度时，在左侧自动补零（例如 `INT(5) ZEROFILL`，存储 42 时显示为 `00042`） |
| `AI` | Auto Increment | 自动递增，一般用于主键 |
| `G` | Generated | 生成列，该列的值由 MySQL 根据指定的表达式自动计算得出，不能手动插入或更新。分为两种模式：`VIRTUAL`（查询时实时计算，不占存储）和 `STORED`（写入时计算并持久化存储） |
| `Default/Expression` | Default / Expression | 列的默认值或默认表达式。若插入数据时未提供该列的值，MySQL 会使用此处定义的默认值或表达式（如 `0`、`'unknown'`、`CURRENT_TIMESTAMP` 等）填充 |

其中，`DataType` 有以下常用类型：

- `INT` 表示整数
- `VARCHAR` 表示可变字符串，括号内数字代表最大字符数，如果内容未到最大字符数，不做任何操作
- `Data` 表示日期
- `Char` 表示字符串，括号内代表最大字符数，如果内容为达到最大字符数，MySQL 为其自动填充空格（很浪费空间）

## INSERT

### 插入单行

插入单行语句书写方式如下：

```sql
INSERT INTO <table>(columns) VALUES (...)
```

假设对于如下表格，我们需要插入一行数据：

![alt text](crud/customers-table-attr.png)

```mermaid
erDiagram
    CUSTOMERS {
        int customer_id PK
        varchar first_name
        varchar last_name
        date birth_date
        varchar phone
        varchar address
        varchar city
        char state
        int points
    }
```

可以编写如下代码：

```sql
INSERT INTO customers
VALUES (
    DEFAULT,
    'John',
    'Smith',
    '1990-01-01',
    NULL,
    'address',
    'city',
    'CA',
    DEFAULT
)
```

但这种写法要求提供每个字段对应的值，并且必须严格按照表结构中的字段顺序填写。当表结构发生变化时，SQL 语句也需要同步调整，可维护性较差。

更推荐显式指定需要插入的字段：

```sql
INSERT INTO customers (
    first_name,
    last_name, 
    birth_date,
    address, 
    city, 
    state
)
VALUES (
    'John',
    'Smith',
    '1990-01-01',
    'address',
    'city',
    'CA'
)
```

这种写法只需为指定字段提供数据，未列出的字段会使用默认值或 `NULL`。字段顺序无需与表结构一致，只需与对应数据保持一致即可。即使表结构发生变化，通常也不会影响现有语句，因此更推荐使用。

执行成功后，会返回如下结果：

`1 row(s) affected`

### 插入多行

插入多行语句书写方式如下：

```sql
INSERT INTO <table>(columns) VALUES (...), (...) ...
```

假设对于如下表格，我们要操作插入多行数据：

![alt text](crud/shippers-table-attr.png)

可以编写如下语句实现：

```sql
INSERT INTO shippers (name) 
VALUES  ('shippers 1'),
        ('shippers 2'),
        ('shippers 3')
```

小练习：插入三行数据到产品表

![alt text](crud/products-table-attr.png)

<details>
<summary>答案</summary>

```sql
INSERT INTO products (name, unit_price)
VALUES  ('product1', 10, 10.1),
        ('product2', 10, 10.2),
        ('product3', 10, 10.3)
```
</details>

### 多表插入

一个订单通常包含多个订单项，因此在数据库设计中，订单表（orders）与订单项表（order_items）通常是一对多关系。

![alt text](crud/orders-table-attr.png)

![alt text](crud/orders-item-attr.png)

假设需要通过 SQL 一次创建一个订单，并同时插入多个订单项数据。由于订单项表依赖订单主键 order_id，因此通常需要先插入订单数据，再插入对应的订单项数据。

首先插入订单记录：

```sql
INSERT INTO orders (customer_id, order_date, status) 
VALUES (1, '2020-01-01', 1)
```

订单插入成功后，order_id 会由数据库自动生成。而在插入订单项时，需要使用该订单 ID 作为外键进行关联。

MySQL 提供了内置函数 LAST_INSERT_ID()，用于获取当前连接中最近一次自动生成的主键值，因此可以直接在后续插入语句中使用：

```sql
INSERT INTO orders (customer_id, order_date, status) 
VALUES (1, '2020-01-01', 1);

-- git-add-start
INSERT INTO order_items
VALUES  (LAST_INSERT_ID(), 1, 1, 1.1)
        (LAST_INSERT_ID(), 1, 2, 10.1)
        (LAST_INSERT_ID(), 1, 3, 100.1)
--git-add-end
```

这样，所有订单项都会自动关联到刚刚创建的订单记录，无需手动查询或填写 order_id。

> LAST_INSERT_ID() 返回的是当前数据库连接中最近一次执行 INSERT 语句所生成的自增主键值，因此在高并发场景下也不会获取到其他连接生成的 ID。

### 创建表的副本

假如我们需要创建订单表的副本做归档：

![alt text](crud/orders-archive-attr.png)

你可以通过 GUI 界面直接操作复制，也可以通过如下代码实现：

```sql
CREATE TABLE orders_archived AS
SELECT * FROM orders
```

执行后的表的列名称和数据是一样的，但打开表的设计模式，发现与原表格不同：

![alt text](crud/order-archived-design.png)

此时 order_archived 表的 order_id 不是主键，也没有自增操作。如果在这个表中添加数据，需要显式写数据。

如果我们只需要一部分数据存入到归档中，假设只归档 2020 年以前的订单数据，此时可以通过字句实现。先 TRUNCATE order_archived 表，然后执行：

```sql
INSERT INTO order_archived
SELECT * FROM orders
WHERE order_date < '2020-01-01'
```

小练习：创建发票归档表（invoice_archived），归档发票数据，并把客户 id 列换成客户名列

