## 更新日志

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
