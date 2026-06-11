---
tags: [sql, database]
title: 选择/筛选子句
---

# 选择/筛选子句

## 选择语句

本节将介绍如何在单一表格获取数据。在获取数据前，需要选中目标操作数据库：

```sql
USE database_name;
```

SQL 是不分大小写的语言，但一般习惯使用大写字母来编写 SQL 关键字，其他内容使用小写字母以提高可读性。

> 注意：当存在多条 SQL 语句时，每条语句需要以分号 `;` 结尾，以便正确解析和执行。

现在我们写一段查询来获取数据库中的数据：

```sql
SELECT column1, column2, ...
FROM table_name
```

也可以使用 `*` 来选择所有列：

```sql
SELECT *
FROM table_name
```

我们可以添加 WHERE 子句来过滤结果：

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition
```

如果不需要任何筛选，可以把 WHERE 子句删除或者注释掉：

```sql
SELECT column1, column2, ...
FROM table_name
-- WHERE condition
```

请注意，`FROM`、`WHERE` 等子句是可选的，但 `SELECT` 是必需的：

```sql
SELECT 1, 2
-- FROM table_name
-- WHERE condition
```

实际得到的结果是：

｜1 ｜2 ｜
|---|---|
｜1 ｜ 2 ｜

请注意，子句需要按照特定的顺序编写：

1. SELECT
2. FROM
3. WHERE
...

不能改变这些语句的顺序，否则会导致语法错误。换句话说，SQL 语句的语义语法或者结构不正确，就会无法执行。

## SELECT 子句

在上一节中，我们已经介绍了 `*` 能够选择所有列，或者我们可以指定列名来选择特定的列。当你的表格数据量非常大时，直接选择所有列可能会导致性能问题，甚至无法执行查询。因此，建议在实际开发中尽量避免使用 `SELECT *`，而是明确指定需要的列名，以提高查询效率和性能。

```sql
SELECT first_name, last_name
FROM customers
```

选择的顺序不同，结果的顺序也会不同：

```sql
SELECT last_name, first_name
FROM customers
```

此时 `last_name` 列会在 `first_name` 列之前显示。

我们可以在原有列基础上做运算：

```sql
SELECT last_name, first_name, points, points + 10
FROM customers
```

结果会多出一列，显示 `points` 列的值加上 10 的结果。除此之外还有 `*`、`/`、`-`、`%` 等运算符可以使用。运算顺序与数学中的运算顺序相同，可以使用括号来改变运算顺序：

```sql
SELECT last_name, first_name, points, (points + 10) * 100
FROM customers
```

执行后会先计算括号内的 `points + 10`，然后再将结果乘以 100，并且该列名为 `(points + 10) * 100`。此时我们可以使用 `AS` 关键字来给该列起一个别名：

```sql
SELECT last_name, first_name, points, (points + 10) * 100 AS points_score
FROM customers
```

结果中该列的列名就变成了 `points_score`，更具有可读性。如果起的别名包含空格或者特殊字符，需要使用引号括起来，单引号或双引号均可：

```sql
SELECT last_name, first_name, points, (points + 10) * 100 AS "points score"
FROM customers
```

如果我们想要选择不重复的值，可以使用 `DISTINCT` 关键字：

```sql
SELECT DISTINCT state
FROM customers
```

小练习：返回产品表中的名称（name）、单价（unit_price）、以及单价乘以 1.1 的结果，并且给计算结果起一个别名叫 `new_price`。

```sql
SELECT name, unit_price, unit_price * 1.1 AS "new_price"
FROM products
```

## WHERE 子句

在前面的小节中有提到过，`WHERE` 子句可以用来过滤结果。比方说我们只想得到积分高于 3000 的顾客：

```sql
SELECT *
FROM customers
WHERE points > 3000
```

`>` 符号是一个比较运算符，SQL 中还有其他的比较运算符：`>=`, `<`, `<=`, `=`, `!=` 或者 `<>`（不等于）。

假设我们只想得到位于 Virgina 州的顾客：

```sql
SELECT *
FROM customers
WHERE state = 'VA'
```

这里因为 `state` 列是一个字符串类型，所以我们需要使用单引号或者双引号将字符串值括起来，通常我们使用单引号。

如果想要获取不在 Virgina 州的顾客，可以使用 `!=` 或者 `<>`：

```sql
SELECT *
FROM customers
WHERE state != 'VA'
```

我们也可以把这些比较运算符用在日期上。假设想要得到在1990年1月1日之后出生的顾客：

```sql
SELECT *
FROM customers
WHERE birth_date > '1990-01-01'
```

即使日期不算是字符串，这里也用引号表示日期值，SQL 会自动将其解析为日期类型进行比较。日期的格式通常是 `YYYY-MM-DD`，也可以包含时间部分，如 `YYYY-MM-DD HH:MM:SS`。

小练习：返回2019年以后的所有订单，假设订单表格叫 `orders`，订单日期列叫 `order_date`。

```sql
SELECT *
FROM orders
WHERE order_date > '2019-01-01'
```

## AND/OR/NOT 运算符

本节将介绍如何使用 `AND`、`OR` 和 `NOT` 运算符来组合多个条件。假设我们想要得到所有在1990年以后出生且积分高于1000的顾客：

```sql
SELECT *
FROM customers
WHERE birth_date > '1990-01-01' AND points > 1000
```

这里必须同时满足：

1. 在1990年以后出生
2. 积分高于1000

两个条件才能返回结果。

如果我们修改 sql 语句如下：

```sql
SELECT *
FROM customers
WHERE birth_date > '1990-01-01' OR points > 1000
```

此时满足任意一个条件就会返回结果。

假设现在我们想要获取满足以下条件之一的所有顾客：

1. 在1990年以后出生
2. 积分高于1000并且位于 Virginia 州的顾客（假设使用 'VA' 表示 Virginia）

对应的 SQL 语句如下：

```sql
SELECT *
FROM customers
WHERE birth_date > '1990-01-01' OR points > 1000 AND state = 'VA'
```

这里会先计算 `points > 1000 AND state = 'VA'`，然后再将结果与 `birth_date > '1990-01-01'` 进行 OR 运算。事实上我们一般会使用括号来明确运算顺序：

```sql
SELECT *
FROM customers
WHERE birth_date > '1990-01-01' OR (points > 1000 AND state = 'VA')
```

假设我们想要获取不满足以下条件的顾客：

1. 在1990年以后出生
2. 积分高于1000

也即满足以下条件的顾客：

1. 在1990年以前出生
2. 积分不高于1000

对应的 SQL 语句如下：

```sql
SELECT *
FROM customers
WHERE NOT (birth_date > '1990-01-01' OR points > 1000)
```

也即：

```sql
SELECT *
FROM customers
WHERE birth_date <= '1990-01-01' AND points <= 1000
```

小练习：从订单项表（`order_items`）中返回订单编号为 6 且总价大于 30 的所有订单项。（注意：需要通过计算单价和数量得到总价）

```sql
SELECT *
FROM order_items
WHERE order_id = 6 AND unit_price * quantity > 30
```

## IN 运算符

假设我们想要获取位于 Virginia 州或者 Florida 州 或者 Georgia 州的顾客，这里假设使用 'VA' 表示 Virginia，'FL' 表示 Florida，'GA' 表示 Georgia，可以通过如下语句获取

```sql
SELECT *
FROM customers
WHERE state = 'VA' OR state = 'FL' OR state = 'GA'
```

也可以通过 `IN` 运算符来简化上述语句：

```sql
SELECT *
FROM customers
WHERE state IN ('VA', 'FL', 'GA')
```

如果想获取不位于 Virginia 州或者 Florida 州 或者 Georgia 州的顾客，可以使用 `NOT IN`：

```sql
SELECT *
FROM customers
WHERE state NOT IN ('VA', 'FL', 'GA')
```

小练习：获取产品表中现货库存数量（`quantity_in_stock`）为 49、38 或者 72 的所有产品。

```sql
SELECT *
FROM products
WHERE quantity_in_stock IN (49, 38, 72)
```

## BETWEEN 运算符

假设我们想要获取积分在 1000 到 3000 之间的顾客：

```sql
SELECT *
FROM customers
WHERE points >= 1000 AND points <= 3000
```

也可以使用 `BETWEEN` 运算符来简化上述语句：

```sql
SELECT *
FROM customers
WHERE points BETWEEN 1000 AND 3000
```

小练习：获取在1990年1月1日到2000年1月1日之间出生的顾客。

```sql
SELECT *
FROM customers
WHERE birth_date BETWEEN '1990-01-01' AND '2000-01-01'
```

## LIKE 运算符

本节内容将介绍如何查找遵循特定字符模式的行数据。假设我们想要获取姓氏以 ' B' 开头的顾客：

```sql
SELECT *
FROM customers
WHERE last_name LIKE 'B%'
```

这里 `%` 是一个通配符，表示任意数量的字符。`B%` 表示以 'B' 开头，后面可以跟任意数量的字符。这个通配符可以放在任意位置。假设我们想要搜寻姓氏中有 'B' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name LIKE '%B%'
```

假设我们想要获取姓氏以 'Y' 结尾的顾客：

```sql
SELECT *
FROM customers
WHERE last_name LIKE '%Y'
```

我们也可以使用 `_` 通配符来表示单个字符。假设我们想要获取姓氏第二个字母是 'a' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name LIKE '_a%'
```

这里总结一下 `LIKE` 模式匹配的通配符：

- `%`：表示任意数量的字符（包括零个字符）
- `_`：表示单个字符

事实上，有比`LIKE` 更强大的模式匹配运算符叫做 `REGEXP`，它支持正则表达式，可以实现更复杂的模式匹配。我们将在后面的小节中介绍 `REGEXP` 运算符。

小练习：

练习1：获取地址中包含 'TRAIL' 或者 'AVENUE'的顾客：

```sql
SELECT *
FROM customers
WHERE address LIKE '%TRAIL%' OR address LIKE '%AVENUE%'
```

练习2：获取电话以 '9' 结尾的顾客：

```sql
SELECT *
FROM customers
WHERE phone LIKE '%9'
```

补充：如果想要获取电话不以 '9' 结尾的顾客，可以使用 `NOT LIKE`：

```sql
SELECT *
FROM customers
WHERE phone NOT LIKE '%9'
```

## REGEXP 运算符

REGEXP 运算符支持正则表达式，可以实现更复杂的模式匹配。假设我们想要获取姓氏中有 'FIELD' 的顾客，使用 `LIKE` 运算符编写如下：

```sql
SELECT *
FROM customers
WHERE last_name LIKE '%FIELD%'
```

使用 `REGEXP` 运算符可以编写如下：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'FIELD'
```

在 `REGEXP` 模式中，`FIELD` 表示匹配包含 'FIELD' 的字符串。这里介绍一些常用的正则表达式符号：

- `^`：表示字符串的开头
- `$`：表示字符串的结尾
- `|`：表示逻辑 OR
- `[]`：表示字符集合
- `[-]`：表示字符范围

假设我们想要获取姓氏以 'FIELD' 开头的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP '^FIELD'
```

假设我们想要获取姓氏以 'FIELD' 结尾的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'FIELD$'
```

假设我们想要查询一些顾客，他们的姓氏包含 'FIELD' 或者 'MAC' 或者 'ROSE'：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'FIELD|MAC|ROSE'
```

假设我们想要查询满足以下条件的顾客：

1. 姓氏以 'FIELD' 开头
2. 姓氏中包含 'MAC'
3. 姓氏中包含 'ROSE'

```sql
SELECT *
FROM customers
WHERE last_name REGEXP '^FIELD|MAC|ROSE'
``` 

假设我们想要查询姓氏中确保字母 'e' 前要有字母 'g' 或者 'i' 的顾客。也即匹配了姓氏中包含 'ge' 或者 'ie' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP '[gi]e'
```

`[]` 可以放在任意位置。假设我们想要查询姓氏中确保字母 'e' 后要有字母 'f' 或者 'q' 的顾客。也即匹配了姓氏中包含 'ef' 或者 'eq' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'e[fq]'
```

假设我们想要查询姓氏中确保字母 'e' 前要有 'a' 到 'h' 任意字母的顾客。也即匹配了姓氏中包含 'ae'、'be'、'ce'、'de'、'ee'、'fe'、'ge'、'he' 的顾客，此时我们不需要列出所有的字母，而是可以使用 `-` 来表示一个范围：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP '[a-h]e'
```

小练习：

练习1：获取名中含有 'ELKA' 或者 'AMBUR' 的顾客：

```sql
SELECT *
FROM customers
WHERE first_name REGEXP 'ELKA|AMBUR'
```

练习2：获取姓氏以 'EY' 或者 'ON' 结尾的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'EY$|ON$'
```

练习3：获取姓氏中以 'MY' 开头或者包含 'SE' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP '^MY|SE'
```

练习4：获取姓氏中字母 'B' 后有字母 'R' 或者 'U' 的顾客：

```sql
SELECT *
FROM customers
WHERE last_name REGEXP 'B[RU]'
```

## IS NULL 运算符

如果我们想要获取电话号码为空的顾客：

```sql
SELECT *
FROM customers
WHERE phone IS NULL
```

假如我们想要获取电话号码不为空的顾客：

```sql
SELECT *
FROM customers
WHERE phone IS NOT NULL
```

小练习：获取还未发货的订单

```sql
SELECT *
FROM orders
WHERE shipped_date IS NULL
```

## ORDER BY 子句

本节将介绍如何对查询结果进行排序。表格默认按照主键列进行排序，我们也可以使用 `ORDER BY` 子句来指定排序的列和排序方式。

假设我们想要根据名字进行排序：

```sql
SELECT *
FROM customers
ORDER BY first_name
```

此时发现结果是按照名字的字母顺序进行升序排序。默认情况下，`ORDER BY` 是按照升序（ASC）进行排序的，我们也可以指定降序（DESC）：

```sql
SELECT *
FROM customers
ORDER BY first_name DESC
```

如果我们想要先按照州进行排序，如果州相同再按照名字进行排序：

```sql
SELECT *
FROM customers
ORDER BY state, first_name
```

我们也可以为不同的列指定不同的排序规则。例如，先按“州”降序排列；当“州”相同时，再按“名字”升序排列：

```sql
SELECT *
FROM customers
ORDER BY state DESC, first_name ASC
```

MYSQL 中对数据进行排序时，排序所依据的列不一定要包含在查询结果中。例如我们可以使用生日进行排序，而只返回姓氏和名字：

```sql
SELECT last_name, first_name
FROM customers
ORDER BY birth_date
```

这在其他数据库系统中可能会导致错误，因为有些数据库要求 `ORDER BY` 中的列必须出现在 `SELECT` 列表中。

SELECT语句中定义的列可以直接在 `ORDER BY` 子句中使用列名进行排序。 例如：

```sql
SELECT order_id, unit_price * quantity AS total_price
FROM orders
ORDER BY total_price DESC
```

小练习：在订单项表中返回订单编号为 2 的订单项，并按照单价乘以数量的结果降序排序。

```sql
SELECT *, unit_price * quantity AS total_price
FROM order_items
WHERE order_id = 2
ORDER BY total_price DESC
```

## LIMIT 子句

假如我们只想要获取前 5 个顾客：

```sql
SELECT *
FROM customers
LIMIT 5
```

如果 LIMIT 后的数字大于表格中的行数，那么就会返回表格中的所有行，而不会报错。

如果我们想要获取第 6 到第 10 个顾客，可以配合偏移量（OFFSET）使用：

```sql
SELECT *
FROM customers
LIMIT 5 OFFSET 5
```

或者使用逗号分隔的语法：

```sql
SELECT *
FROM customers
LIMIT 5, 5
```

这里的第一个数字 5 表示偏移量，第二个数字 5 表示返回的行数。也即跳过前 5 行，然后返回接下来的 5 行。

注意：LIMIT 子句永远应该放在 SQL 语句的最后面，不能放在 `WHERE`、`ORDER BY` 等子句之前，否则会导致语法错误。

小练习：获取排名前三的忠实顾客，假设忠实顾客是指积分最高的顾客。

```sql
SELECT *
FROM customers
ORDER BY points DESC
LIMIT 3
```

## 视频链接

- [The SELECT Statement](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=7)
- [The SELECT Clause](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=8)
- [The WHERE Clause](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=9)
- [The AND/OR/NOT Operators](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=10)
- [The IN Operator](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=11)
- [The BETWEEN Operator](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=12)
- [The LIKE Operator](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=13)
- [The REGEXP Operator](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=14)
- [The IS NULL Operator](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=15)
- [The ORDER BY Clause](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=16)
- [The LIMIT Clause](https://www.bilibili.com/video/BV1UE41147KC?spm_id_from=333.788.videopod.episodes&vd_source=8e3f5b7e9cf313d9ea63238d28816b11&p=17)