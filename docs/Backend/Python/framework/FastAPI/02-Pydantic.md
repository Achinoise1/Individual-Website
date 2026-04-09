---
tags: [python, backend, fastapi]
title: Pydantic：校验、转换与序列化
---

# Pydantic：校验、转换与序列化

Pydantic 是基于 Python 类型注解的数据校验库，通过声明式的模型定义，自动完成数据校验、类型转换与序列化输出。FastAPI 深度依赖 Pydantic 来实现其核心的数据验证与解析能力。

## 为什么需要 Pydantic？

### 手动校验局限性

在不使用任何框架的情况下，处理来自外部的数据（如 HTTP 请求体、配置文件、数据库返回值）往往需要手动校验：

```python
def create_user(data: dict):
    if "name" not in data:
        raise ValueError("name 字段缺失")
    if not isinstance(data["age"], int):
        raise TypeError("age 必须是整数")
    if data["age"] < 0:
        raise ValueError("age 不能为负数")
    # ... 更多校验
```

这种命令式写法（告诉程序"怎么做"）存在明显缺陷：

- 冗长重复，每个接口都要写类似的校验逻辑
- 容易遗漏校验项，导致安全漏洞
- 难以复用和维护

### 使用 dataclass 的局限性

Python 的 `dataclass` 提供了简洁的语法来定义数据结构，但它没有内置的验证机制：

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
```

虽然 `dataclass` 让定义数据结构更简单，但它**不会自动验证字段的类型或约束条件，仍然需要手动编写验证逻辑**。

### 声明式写法

Pydantic 通过**声明式**（告诉程序"要什么"）的方式解决了这个问题：

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str
    age: int = Field(ge=0)
```

只需定义一个继承自 BaseModel 的类并添加类型注解，Pydantic 就会在实例化时自动完成所有校验。作为校验过程的副产品，Pydantic 还会自动进行类型转换（如字符串转数字）并提供序列化输出能力，极大地减少样板代码。

## 核心功能：校验

作为上述流程的第一步，校验是 Pydantic 最核心的能力。通过声明式的模型定义，Pydantic 在数据进入系统时就确保其符合预期格式。

### BaseModel

`BaseModel` 是 Pydantic 提供的核心基类，所有数据模型都通过继承它来定义。继承后，类上的**类型注解**会被 Pydantic 识别为字段声明，实例化时自动触发完整的验证流程。

#### 实例化时触发验证

与普通 Python 类不同，`BaseModel` 的子类在 `__init__` 时就进行了一次类型转换和约束检查。**对象成功创建后，此时的数据就是合法的，无需再次验证**：

```python
from pydantic import BaseModel

class Point(BaseModel):
    x: float
    y: float

p = Point(x=1.5, y=2)   
print(p.x, p.y)
```

输出：

```
1.5 2.0
```

实例化后，字段可通过普通属性访问，不需要任何特殊语法。

#### 赋值时默认触发校验

实例化后的修改默认不触发校验：

```python
from pydantic import BaseModel

class Point(BaseModel):
    x: float
    y: float

p = Point(x=1.5, y=2)   
print(p.x, p.y)            # 1.5  2.0
p.x = "hello"  
print(p)
```

输出：

```
x=1.0 y=2.0
x='hello' y=2.0
```

如果希望再次赋值时也触发校验，可以通过 `model_config` 启用 `validate_assignment`：

```python
from pydantic import BaseModel

class Point(BaseModel):
    x: float
    y: float

    model_config = {
        "validate_assignment": True
    }

p = Point(x=1.5, y=2)   
print(p.x, p.y)            # 1.5  2.0
p.x = "hello"  
print(p)
```

拓展：如果希望模型完全不可变，可以通过 `model_config` 启用 `frozen` 模式

```python
class Point(BaseModel):
    x: float
    y: float

    model_config = {
        "frozen": True
    }
```

如果试图修改，则出现报错 `pydantic_core._pydantic_core.ValidationError: 1 validation error... Instance is frozen`

#### 校验失败的处理

当数据不符合定义时，Pydantic 会抛出 ValidationError，并提供详细的错误信息：

```python
from pydantic import BaseModel, ValidationError

class User(BaseModel):
    name: str
    age: int

try:
    user = User(name="Alice", age=-5)
except ValidationError as e:
    print(e.json())
```

错误输出会明确指出哪个字段、什么原因导致校验失败：

```python
[
  {
    "type": "greater_than_equal",
    "loc": ["age"],
    "msg": "Input should be greater than or equal to 0",
    "input": -5
  }
]
```

### Field：精细校验的定义

基础的字段验证可以通过类型注解实现（如 str、int），更精细的约束（如范围、正则）需要使用 `Field` 配合。

#### 常用约束参数

Field 支持多种内置约束参数，适用于不同类型的字段：

| 参数 | 适用类型 |	说明 |
|------|------|------|
| gt / ge |	int, float	| 大于 / 大于等于|
| lt / le |	int, float	| 小于 / 小于等于|
| min_length / max_length |	str, list, dict	| 最小 / 最大长度|
| pattern |	str	| 正则表达式匹配|
| multiple_of |	int, float	| 必须是该数的倍数|

#### 基本用法

**有默认值、无约束**

如果类型只有默认值，不需要添加任何约束条件，可以直接在类型注解中设置默认值，无需使用 Field：

```python
from pydantic import BaseModel, Field

class Settings(BaseModel):
    host: str = "localhost"    
    port: int = 8080           
    debug: bool = False        
```

这里定义了一个配置类，默认主机地址 `host` 为 "localhost"，端口 `port` 为 8080，调试模式 `debug` 为关闭状态。

**有默认值、有约束**

当字段既有默认值，又需要添加约束（如范围、正则、长度限制等）时，必须将默认值通过 Field 的 default 参数来设置。

```python
from pydantic import BaseModel, Field

class Order(BaseModel):
    timeout: int = Field(default=30, gt=0, description="订单超时时间（分钟）")
    max_quantity: int = Field(default=10, ge=1, le=99, description="单笔订单最大购买数量")
    phone: str = Field(default=None, pattern=r"^1[3-9]\d{9}$", description="收货人手机号")
```

上述例子中：

- `timeout` 字段默认值为 30，必须是一个大于 0 的整数
- `max_quantity` 字段默认值为 10，必须是一个在 1 到 99 之间的整数
- `phone` 字段默认值为 None（可选），如果提供则必须匹配合法手机号的正则表达式

**无默认值、有约束**

```python
class Request(BaseModel):
    # 必填字段，但需要约束
    user_id: int = Field(gt=0, description="用户 ID 必须为正整数")
    email: str = Field(pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
```

上述例子中：

- `user_id` 是一个必填字段，必须是一个大于 0 的整数
- `email` 是一个必填字段，必须匹配合法邮箱的正则表达

**与类型注解的协作**

Field 与类型注解共同工作：类型注解定义字段的基础类型，Field 补充更精细的约束：

```python
from typing import List

class Product(BaseModel):
    # 类型注解：必须是字符串列表
    # Field：列表长度在 1 到 10 之间
    tags: List[str] = Field(min_length=1, max_length=10)
    
    # 类型注解：必须是正数
    # Field：额外限制在 0 到 100 之间
    discount: float = Field(ge=0, le=100)
```

#### 元数据参数

Field 支持元数据参数，用于生成 API 文档：

| 参数 | 说明 |
|------|------|
| description | 字段描述，用于生成 API 文档 |
| title | 字段标题，默认使用字段名 |
| examples | 示例值 |
| default | 默认值（与 Field 同时使用时必须显式指定） |


**在模型配置中使用**

Field 的元数据会被 model_json_schema() 捕获，用于生成 API 文档：

```python
print(User.model_json_schema())
```

得到输出，格式化后如下：

```json
{
    "properties": {
        "name": {
            "description": "用户名", 
            "maxLength": 50, 
            "minLength": 1, 
            "title": "Name", 
            "type": "string"
        }, 
        "age": {
            "description": "年龄", 
            "maximum": 150, 
            "minimum": 0, 
            "title": "Age", 
            "type": "integer"
        }, 
        "email": {
            "pattern": "^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$", 
            "title": "Email", 
            "type": "string"
        }
    }, 
    "required": ["name", "age", "email"], 
    "title": "User", 
    "type": "object"
}
```

这也是 FastAPI 能够自动生成交互式 API 文档的基础：FastAPI 读取 Pydantic 模型的 Field 信息，将其转换为 OpenAPI 规范中的参数描述。

## 核心功能：转换

校验确保数据符合规则，而转换则是将输入数据清洗为期望的类型。在数据校验的同时，Pydantic 会自动进行**宽松类型转换**，将外部输入的脏数据转换为模型声明的类型。

### 实例化时的自动类型转换

Pydantic 会尽可能将输入数据转换为声明的类型：

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    is_active: bool

# 即使传入字符串，也会被自动转换
user = User(name="Alice", age="30", is_active="true")

print(user.age)       # 30 (int)
print(user.is_active) # True (bool)
```

如果需要严格类型校验，可以使用 strict 模式或严格类型。

```python
from pydantic import BaseModel, StrictInt, StrictBool

class User(BaseModel):
    name: str
    age: StrictInt
    is_active: StrictBool

# 传入非严格类型会抛出 ValidationError
try:
    user = User(name="Alice", age="30", is_active="true")
except ValueError as e:
    print(e)
```

此时会抛出错误：

```
2 validation errors for User
age
  Input should be a valid integer [type=int_type, input_value='30', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/int_type
is_active
  Input should be a valid boolean [type=bool_type, input_value='true', input_type=str]
    For further information visit https://errors.pydantic.dev/2.12/v/bool_type
```

## 核心功能：序列化

当数据经过校验和转换，成功实例化为模型对象后，下一步往往是将这个内部对象输出到外部世界。Pydantic 模型可以方便地转换为字典、JSON 或其他格式，用于 API 响应、日志输出或数据存储。

### 模型转字典：model_dump()

```python
class User(BaseModel):
    name: str
    age: int

user = User(name="Alice", age=25)

# 基础用法
print(user.model_dump())  # {"name": "Alice", "age": 25}
```

### 常用内置转换方法

| 方法 | 说明 |
|------|------|
| `model_validate(data)` | 从字典或对象解析，等价于 `Model(**data)` 但更明确 |
| `model_dump()` | 序列化为字典 |
| `model_dump_json()` | 序列化为 JSON 字符串 |
| `model_copy(update={...})` | 浅拷贝并修改部分字段，原实例不变 |
| `model_fields` | 类属性，返回所有字段的元数据（`dict[str, FieldInfo]`） |
| `model_json_schema()` | 生成对应的 JSON Schema |


## 大致实现

掌握了 Pydantic 的核心功能后，了解其底层实现有助于更好地理解其性能优势和使用限制。Pydantic v2 的核心逻辑由 **Rust** 编写（`pydantic-core`），Python 层只负责收集类上的类型注解和字段定义。其大致流程如下：

```
定义 BaseModel 子类
        │
        ▼
收集类型注解（__annotations__）
+ 字段默认值 / Field() 配置
        │
        ▼
      构建 Schema
（描述每个字段的类型、约束、别名等）
        │
        ▼
   编译为验证器
（由 Rust 核心生成高性能验证函数）
        │
        ▼
   实例化时调用验证器
→ 类型转换 → 约束检查 → 赋值到模型实例
```

这种设计让 Pydantic v2 的性能比 v1 提升了约 **5~50 倍**，同时保持了 Python 侧友好的声明式 API。

## 实践

理解了 Pydantic 的工作原理，我们来看看在实际开发中如何灵活运用这些特性。

### 嵌套模型

现实中的数据往往是层次化的：用户包含地址，地址包含邮编；订单包含多个商品，每个商品包含名称和价格。Pydantic 支持模型嵌套，并会递归地对所有层级进行校验、转换和序列化。

**基础嵌套**

当模型的某个字段是另一个 BaseModel 子类时，Pydantic 会自动处理字典到模型实例的转换：

```python
from pydantic import BaseModel

class Address(BaseModel):
    city: str
    zip_code: str
    street: str

class User(BaseModel):
    name: str
    age: int
    address: Address

# 传入字典，Pydantic 自动将 address 字典转换为 Address 实例
user = User(
    name="张三",
    age=28,
    address={
        "city": "北京",
        "zip_code": "100000",
        "street": "朝阳路 10 号"
    }
)

print(user.address.city)      # 北京
print(user.address.street)    # 朝阳路 10 号
print(type(user.address))     # <class '__main__.Address'>
```

**多层嵌套**

嵌套层数没有限制，可以构建复杂的层次结构：

```python
from pydantic import BaseModel

class Address(BaseModel):
    city: str
    zip_code: str
    street: str

class Product(BaseModel):
    name: str
    price: float

class OrderItem(BaseModel):
    product: Product
    quantity: int

class Order(BaseModel):
    order_id: str
    items: list[OrderItem]          # 嵌套模型的列表
    shipping_address: Address       # 可复用的地址模型

order = Order(
    order_id="ORD-001",
    items=[
        {"product": {"name": "机械键盘", "price": 299.0}, "quantity": 2},
        {"product": {"name": "无线鼠标", "price": 89.0}, "quantity": 1}
    ],
    shipping_address={
        "city": "上海",
        "zip_code": "200000",
        "street": "南京东路 100 号"
    }
)

print(order.items[0].product.name)   # 机械键盘
print(order.items[0].quantity)       # 2
print(order.items[1].product.price)  # 89.0
```

### 自定义验证器

嵌套模型满足了大部分结构化数据的定义需求。当业务规则更复杂、无法用内置约束表达时，Pydantic 提供了**自定义验证器**来应对。使用 `@field_validator` 装饰器可以为某个字段添加自定义校验逻辑：

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name 不能为空字符串")
        return v.strip()

    @field_validator("age")
    @classmethod
    def age_must_be_adult(cls, v: int) -> int:
        if v < 18:
            raise ValueError("年龄必须大于等于 18")
        return v
```

如果需要在验证之前访问**多个字段**，可以使用 `@model_validator`：

```python
from pydantic import BaseModel, model_validator

class PasswordForm(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_must_match(self) -> "PasswordForm":
        if self.password != self.confirm_password:
            raise ValueError("两次输入的密码不一致")
        return self
```

嵌套模型可以组织复杂数据结构，自定义验证器能够实现更灵活的业务逻辑，Pydantic 能够覆盖从简单到复杂的各类数据校验场景。

### 在 FastAPI 中使用

FastAPI 会自动识别函数参数中的 Pydantic 模型，将请求体 JSON 解析为对应的模型实例：

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float = Field(gt=0)
    in_stock: bool = True

@app.post("/items/")
def create_item(item: Item):
    return {"received": item.model_dump()}
```

发送请求：

```bash
curl -X POST "http://localhost:8000/items/" \
     -H "Content-Type: application/json" \
     -d '{"name": "键盘", "price": 299.0}'
```

FastAPI 会：
1. 将请求体 JSON 传给 Pydantic，由 `Item` 模型进行解析和验证
2. 验证失败时自动返回 `422 Unprocessable Entity`，并附带详细错误信息
3. 验证通过后，将 `item` 实例注入到路由函数中

这也是为什么 FastAPI 能做到"**只需声明，无需手写校验**"的根本原因。

## 总结

Pydantic 本质上做了三件事：校验、转换、序列化，并将它们整合为一个统一的数据处理流程：

```
外部输入 → 数据校验 → 类型转换 → 内部模型 → 序列化输出
```

通过 BaseModel + 类型注解 + Field 的声明式方式，我们只需描述“数据应该是什么样”，而不再关心“如何一步步校验”。Pydantic 在模型实例化时自动完成所有验证与转换，并在需要时提供结构化的输出能力。

## 参考

- [Pydantic 官方文档](https://docs.pydantic.dev/)
- [BaseModel](https://docs.pydantic.org.cn/latest/api/base_model/)