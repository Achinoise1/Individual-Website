## 更新日志

### VUnreleased

#### docs: Django ORM 文档补全数据操作与泛型关系章节

**文档**
- 新增数据分组章节：介绍通过 annotate() 结合 Count 统计关联对象数量
- 新增表达式装饰器章节：介绍 ExpressionWrapper 解决复杂表达式输出类型问题
- 新增查询泛型关系章节：通过 ContentType 模型安全获取内容类型 ID 并筛选泛型外键数据
- 新增查询集缓存章节：说明 Django 缓存机制及其对查询次数的影响
- 新增创建、更新、删除对象章节：覆盖 save()、create()、update()、delete() 的使用方式及注意事项
- 新增事务章节：介绍 @transaction.atomic 装饰器与 with transaction.atomic() 上下文管理器的用法
- 统一 ORM 系列文档视频参考链接格式，去除追踪参数，改为简短分集参数格式

### VUnreleased

#### docs: Django ORM 进阶文档新增注释与数据库函数章节

**文档**
- 新增 annotate() 注释用法：介绍为查询集添加自定义字段，以及 Value()、F() 表达式的使用与运算
- 新增调用数据库函数章节：介绍 Func() 的使用方式，以及内置 Concat() 函数的快捷用法

### VUnreleased

#### refactor: 拆分 Django ORM 文档为三个独立页面

**文档**
- 将单一 ORM 文档按主题拆分为三个页面：基础概念（简介/管理器/检索）、筛选（字段/字符串/日期/Q对象/F对象）、进阶查询（排序/分页/子集/延迟字段/关联加载/聚合）
- 各文档图片目录随文件拆分迁移，路径保持一致

**构建/配置**
- 侧边栏新增「ORM 筛选」和「ORM 进阶查询」两个文档入口

### VUnreleased

#### docs: 新增 Django ORM 高级查询与关联加载章节

**文档**
- 新增 Q 对象章节：介绍使用 `|`、`&`、`~` 构建 OR / AND / NOT 复合条件查询
- 新增 F 对象章节：介绍在筛选条件中直接引用数据库字段值及跨关联表字段
- 新增排序章节：涵盖 `order_by()`、`reverse()`、`earliest()`、`latest()` 的用法
- 新增分页限制章节：通过切片实现分页，按偏移量返回指定数量结果
- 新增查询子集章节：使用 `values()` 和 `values_list()` 精确选取字段，并支持跨关联表字段
- 新增延迟字段章节：对比 `only()` 与 `defer()` 的行为差异，说明懒加载对 N+1 问题的影响
- 新增关联对象预加载章节：对比 `select_related`（JOIN）与 `prefetch_related`（独立查询）的适用场景及链式用法
- 新增聚合计算章节：介绍 `Count`、`Min`、`Max`、`Avg`、`Sum` 在查询集上的使用方式
- 补充视频参考链接，覆盖上述所有新增章节

### VUnreleased

#### docs: 新增 Django ORM 高级查询章节配图

**文档**
- 新增筛选对象章节配图：覆盖复杂条件、OR 查询、F 表达式引用字段等查询的 SQL 执行截图
- 新增排序与分页章节配图：展示按标题排序及前后五条记录的查询结果与对应 SQL
- 新增选取字段章节配图：涵盖懒加载字段、加载额外字段及选择关联模型子字段的 SQL 执行截图

### VUnreleased

#### docs: 规范视频参考格式并补充 ORM 查询内容

**文档**
- 将「设置数据库」文档中分散在各节的参考视频链接整合为文末统一的「视频参考」章节
- 新增 Django ORM 管理器与查询集详解，覆盖三种触发查询计算的场景及链式调用说明
- 新增检索对象章节，介绍 get()、filter()、first()、exists() 等方法的使用方式与异常处理

### VUnreleased

#### docs: 新增 Django ORM 介绍文档

**文档**
- 新增 Django ORM 章节：介绍 ORM 核心概念、相比手动 SQL 的优势以及在 Django 中的应用方式

**构建/配置**
- 侧边栏新增 Django ORM 文档入口

### VUnreleased

#### docs: 新增 Django 自定义 SQL 与测试数据生成教程

**文档**
- 新增通过空迁移执行自定义 SQL 语句的方法，包含正向与撤销 SQL 的写法示例
- 新增使用 Mockaroo 生成测试数据并导入 MySQL 数据库的完整流程说明
- 修正 MySQL 章节中链接显示文本和措辞错误

### VUnreleased

#### feat: 代码块 diff 符号自动渲染

**前端组件**
- 通过 CSS `::before` 伪元素在 diff 行左侧自动显示 `+`/`-` 符号，无需在 Markdown 中手动添加
- 修复 diff 高亮行与普通行的左侧缩进对齐问题，补偿 3px 左边框宽度
- 通过 swizzle wrap `CodeBlock/Line` 组件实现扩展，升级兼容性更好

#### docs: 新增 Django 连接 MySQL 教程

**文档**
- 新增 Django 使用 MySQL 数据库的完整配置步骤，推荐使用 pymysql 替代 mysqlclient 以避免编译问题
- 修正数据库设置文档中两处标题层级错误

### VUnreleased

#### docs: 重构 Django 文档结构并新增数据库迁移章节

**文档**
- Django 文档重组：将视图管理和调试内容整合到快速入门章节，文档结构更清晰
- 数据模型文档新增模型关系设计：涵盖一对多、多对多、循环依赖及泛化关系的实现方法
- 新增数据库配置章节：介绍 Django 迁移工作流，涵盖创建迁移、字段变更追踪及连接 MySQL

**构建/配置**
- 侧边栏新增 Django 数据库配置、Flask 生命周期入口，并引入 AI 基础（RAG）分类

### VUnreleased

#### docs: 新增 Django 系列基础文档

**文档**
- 更新 Django 快速搭建指南：补充虚拟环境配置步骤，完善项目目录结构说明，优化项目创建与启动流程
- 新增 Django 应用管理：介绍应用结构组成、创建命令及在项目中注册应用的方式
- 新增 Django 视图管理：涵盖视图函数创建、URL 路由配置与 Jinja2 模板渲染
- 新增 Django 数据模型：介绍 ORM 模型设计、字段类型选择及多应用数据模型管理策略
- 新增 Django 调试指南：介绍 VS Code 调试配置及 Django Debug Toolbar 安装与使用

**构建/配置**
- 侧边栏新增 Django 框架下的应用管理、视图管理、数据模型和调试页面入口

### VUnreleased

#### feat: 新增 struct 文档与 ICP 备案号

**文档**
- 新增 Python 内置库 struct 使用说明，涵盖二进制数据打包/解包与字节序说明

**构建/配置**
- 页脚新增 ICP 备案号展示，并更新版权年份格式

#### fix: 修复 struct 文档侧边栏路径

**构建/配置**
- 修正侧边栏中 struct 文档的引用路径，确保导航正常

#### chore: 更新依赖与命令配置

**构建/配置**
- `docusaurus` 与 `serve` 命令添加 `--no-open` 参数，避免自动打开浏览器
- 更新 `@swc/core` 及相关平台包至 1.15.30
