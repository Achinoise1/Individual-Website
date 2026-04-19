## 更新日志

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
