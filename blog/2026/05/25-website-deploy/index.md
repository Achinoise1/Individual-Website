---
slug: website-deploy
title: 网站一键部署指南
authors:
  name: Achinoise1
  title: Website Owner
  url: https://github.com/Achinoise1
  image_url: https://github.com/Achinoise1.png
tags: [linux, deploy, docusaurus]
---

# 网站一键部署指南

本篇指南将介绍如何在开发服务器上连接到部署服务器，一键完成部署 Docusaurus 网站，涵盖从安装依赖到配置服务的完整流程。

<!--truncate-->

## 缘起

起因是个人在 macOS 开发编写个人网站，在 Ubuntu 部署个人网站时，发现每次部署都需要重复执行一系列命令。而且时间一长，很容易忘记具体命令该怎么用。为了提高效率并减少人为错误，我决定编写一个一键部署脚本，自动化整个流程，解放双手。

想要实现自动化，首先需要捋清楚手动如何操作，然后将这些操作步骤转化为脚本命令。如果想直接获取可用脚本，可以直接跳转到 [完整部署脚本](#完整部署脚本) 部分。

## 旧想法：npm run serve + Nginx 反向代理

最开始没有了解到 Nginx 可以全权代理，因此最先的想法是直接使用 `npm run serve`（即 `docusaurus serve`）命令进行部署。

以下是我在部署过程中总结的关键步骤：

```
本地 build → tar 打包 → scp 传输 → 远程解压
                                    ↓
                          systemd 守护 npm run serve
                                    ↓
                          Nginx 反向代理 :80 → :3000
```

接下来，我们把上述流程拆解成一步步的具体操作。需要说明的是，个人更习惯使用 zsh 作为默认 shell，所以下面的示例都会以 zsh 来演示。文章末尾会附上对应的 bash 版本部署脚本，提供给使用 bash 的读者。

### 首次部署

按照部署流程，首次部署需要完成以下步骤：

1. 本地执行 `npm run build`
2. 传输构建产物到部署服务器并解压
3. 配置 systemd 服务
4. 配置 Nginx 反向代理
5. 在目标服务器上 serve 服务

**本地执行 `npm run build`**

首先，在本地 Docusaurus 环境中执行构建，生成静态文件。Docusaurus 官方提供了 `docusaurus build` 命令，而在实际项目中我们通常通过 npm scripts 来调用它。建议在构建之前先清理上一次的产物：

```bash
npm run clear
npm run build
```

执行 `npm run build` 后，会在当前项目根目录下生成一个 build 文件夹，所有构建产物都会输出到这个目录中。结构大致如下：

```
your-website-project/
├── build/
│   ├── assets/
│   ├── blog/
│   ├── docs/
│   ├── en/
│   ├── img/
│   ├── markdown-page/
│   ├── index.html
│   ├── 404.html
│   └── ...
├── src/          (等其他源码目录)
└── package.json
```

**传输构建产物到部署服务器并解压**

接下来我们需要将其传输到目标服务器上。最直接的方式是使用 `scp` 命令：

```bash
scp -r build/ user@server:/path/to/deploy/
```

不过直接传输整个目录往往比较慢，尤其是文件数量较多时。更高效的做法是：先打包，再传输，最后在服务器上解压。具体步骤如下：

1. 在本地将 build 文件夹打包为 tar 文件

```bash
tar -czf build.tar.gz build/
```

2. 使用 scp 将打包后的 tar 文件传输到目标服务器

```bash
scp build.tar.gz user@server:/path/to/deploy/
```

3. 删除本地的压缩包，节省空间

```bash
rm build.tar.gz
```

4. 在部署服务器上解包 tar 文件到指定目录，完成后删除 tar 文件。

这里使用非交互式远程执行，不需要 ssh 登录到服务器后再执行命令： 

```bash
ssh user@server "tar -xzf /path/to/deploy/build.tar.gz -C /path/to/deploy/"
ssh user@server "rm /path/to/deploy/build.tar.gz"
```

现在 build 产物已经完成传输和解压，接下来我们通过配置 systemd 系统服务，让 `npm run serve` 在守护进程中运行。

**配置 systemd 服务**

在 `/etc/systemd/system/` 目录下创建一个 `.service` 文件，例如 `your-service-name.service`，内容如下：

```
[Unit]
Description=Frontend Development Server
After=network.target

[Service]
User=root
WorkingDirectory=/path/to/deploy/
Environment=your_environment_variables
ExecStart=/path/to/npm run serve
Restart=always

[Install]
WantedBy=multi-user.target
```

几个关键配置项说明：

- `User`：运行该服务的用户
- `WorkingDirectory`：服务的工作目录，即部署路径
- `Environment`：服务所需的环境变量
- `ExecStart`：服务启动时执行的命令，这里是 `npm run serve`
- `Restart`：服务在异常退出时的重启策略，设为 `always` 表示退出后自动重启

编写完成后，保存并退出编辑器。执行以下命令完成两项操作：一是重新加载 systemd 的配置文件，二是将服务设为开机自启动：

```bash
ssh user@server "sudo systemctl daemon-reload"
ssh user@server "sudo systemctl enable your-service-name.service"
```

日常管理中，可以用下面这些命令来启动、停止或重启服务：

```bash
ssh user@server "sudo systemctl start your-service-name.service"
ssh user@server "sudo systemctl stop your-service-name.service"
ssh user@server "sudo systemctl restart your-service-name.service"
```

需要提醒的是：现在先不要启动服务，等 Nginx 配置完成后再启动。否则直接访问网站时会出现 502 Bad Gateway 错误，因为 Nginx 还没有配置好反向代理。

**配置 Nginx 反向代理**

下面来配置 Nginx。在 `/etc/nginx/conf.d/` 下新建一个配置文件，比如 `your-site.conf`：

```
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

保存退出后，运行这条命令让 Nginx 重新加载配置：

```bash
ssh user@server "sudo nginx -s reload"
```

**在目标服务器上 serve 服务**

启动服务：

```bash
ssh user@server "sudo systemctl start your-service-name.service"
```

此时打开浏览器并访问 `http://your-domain.com`，如果一切顺利，你应该能看到网站正常运行。

### 更新部署

后续更新就简单多了。由于 systemd 服务和 Nginx 配置已经在首次部署时完成，后续更新只需要三步：

1. 本地执行 `npm run build`

```bash
npm run clear
npm run build
```

2. 传输构建产物到部署服务器并解压

```bash
tar -czf build.tar.gz build/
scp build.tar.gz user@server:/path/to/deploy/
ssh user@server "tar -xzf /path/to/deploy/build.tar.gz -C /path/to/deploy/"
ssh user@server "rm /path/to/deploy/build.tar.gz"
rm build.tar.gz
```

3. 重启 systemd 服务

```bash
ssh user@server "sudo systemctl restart your-service-name.service"
```

Tips：事实上，可以通过编辑 `~/.zshrc` 文件，添加一个别名来简化后续更新部署的操作。例如：

```bash
alias rstmyweb='systemctl restart your-service-name.service'
```

然后通过以下命令调用（注意需要 -i -c 参数来加载 zsh 配置）：

```bash
ssh user@server "zsh -i -c 'rstmyweb'"
```

### 小结

以上是使用 `npm run serve` + Nginx 反向代理的部署方式。非常简单直接，也有两个明显的缺点：

1. 依赖 Node.js 环境：服务器必须安装 Node.js 和 npm，并且要维护相关版本
2. 资源占用偏高：npm run serve 会常驻一个 Node 进程，这个进程只托管静态文件，有些“杀鸡用牛刀”

## 新想法：Nginx 全权代理

在了解到可以使用 Nginx 全权代理后，我决定将部署方式改为直接使用 Nginx 托管。此时：

- 仅依赖 Nginx  
- 不需要启动一个常驻进程
- 资源占用较低

对应大致的部署流程如下：

```
本地 build → tar 打包 → scp 传输 → 远程解压 → Nginx 直接托管静态文件目录
```

### 首次部署

由于不需要使用 `npm run serve`，因此首次部署只需要完成以下步骤：

1. 使用 build 进行构建
2. 将构建产物传输到目标服务器上并解压
3. 配置 Nginx 静态文件服务

**使用 build 进行构建**

执行如下命令，清理上一次构建产物并重新构建：

```bash
npm run clear
npm run build
```

**将构建产物传输到目标服务器上并解压**

执行如下命令，将构建产物打包并传输目标服务器上：

```bash
tar -czf build.tar.gz build/
scp build.tar.gz user@server:/path/to/deploy/
rm build.tar.gz
```

执行如下命令，在目标服务器上解压构建产物：

```bash
ssh user@server "tar -xzf /path/to/deploy/build.tar.gz -C /path/to/deploy/"
ssh user@server "rm /path/to/deploy/build.tar.gz"
```

需要注意的是，这里要给 Nginx 服务配置的目录权限，确保 Nginx 可以访问到构建产物：

```bash
ssh user@server "chown -R www-data:www-data /path/to/deploy/build"
```

其中，`www-data` 代表 Nginx 运行的用户和组。

**配置 Nginx 静态文件服务**

在 `/etc/nginx/conf.d/` 目录下创建一个新的配置文件，例如 `your-site.conf`，内容如下：

```
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/deploy/build;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

需要注意的是：

- `root`：指定网站的根目录，这里是构建产物所在的目录
- `error_page 404 /404.html`：指定 404 错误页面的路径，这里是构建产物中的 404.html 文件
- `location /assets/`：指定静态资源的缓存策略，这里设置为一年，并添加 Cache-Control 头部，表示资源是公共的且不可变的

编写完成后，保存并退出编辑器，然后执行以下命令使 Nginx 重新加载配置文件：

```bash
ssh user@server "sudo nginx -s reload"
```

此时打开浏览器并访问 `http://your-domain.com`，如果一切顺利，你应该能看到网站正常运行。

### 更新部署

使用 nginx 全权代理的更新更是简洁：

1. 使用 build 进行构建
2. 将构建产物传输到目标服务器上并解压

详细操作参见上一节 [首次部署](#首次部署-1)。

## 提示输出

如果仅有执行命令操作是不够的，自动化操作应当有提示输出，方便用户了解当前部署进度。可以在脚本中添加一些提示信息，例如：

```bash
echo "正在清理上一次构建产物..."
```

在此基础上，可以使用颜色和符号来区分不同类型的提示信息，例如：

```bash
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
RESET=$(tput sgr0)

info() { echo "${GREEN}[✓]${RESET} $*"; }
step()  { echo "${YELLOW}[→]${RESET} $*"; }

step "构建项目中..."
npm run build
info "构建完成，正在传输构建产物..."
```

### tput

tput 是一个用于控制终端行为的命令。可以设置文字颜色/加粗文本等样式，例如 `tput setaf 2` 代表：

- `setaf`：设置前景色（set foreground color）
- `2`：颜色代码，代表绿色

执行后，终端后续输出都会变成绿色，直到执行 `tput sgr0` 恢复默认样式。但请注意，一般 Linux 服务器自带 tput，但不是所有的服务器都一定支持 tput，因此在使用时需要考虑兼容性问题：

```bash
GREEN=$(tput setaf 2 2>/dev/null || echo "")
```

- `2>/dev/null`：将错误输出重定向到 /dev/null，避免在不支持 tput 的终端中输出错误信息
- `|| echo ""`：如果 tput 执行失败，则输出空字符串，表示使用默认样式。保证脚本不会因为 tput 不支持而中断执行。

## 完整部署脚本参考

### Nginx 全权代理部署脚本

<details>
<summary>完整部署 bash 脚本</summary>

```bash
#!/bin/bash
set -e

# ── Colors (tput with graceful fallback) ──────────────────────────────────────
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

# ── Logging helpers ───────────────────────────────────────────────────────────
info()  { echo "${BOLD}${GREEN}[✓]${RESET} $*"; }
step()  { echo "${BOLD}${YELLOW}[→]${RESET} $*"; }
error() { echo "${BOLD}${RED}[✗]${RESET} $*" >&2; }

# ── Cleanup on error ──────────────────────────────────────────────────────────
cleanup() {
  error "Deployment failed. Cleaning up temporary files..."
  [[ -f build.tar.gz ]] && rm -f build.tar.gz
  ssh $REMOTE "rm -f /tmp/build.tar.gz" 2>/dev/null || true
}
trap cleanup ERR

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE=user@server
REMOTE_DIR=/path/to/deploy

# ── Build ─────────────────────────────────────────────────────────────────────
step "Clearing previous build..."
npm run clear

step "Building project..."
npm run build
info "Build complete."

# ── Package & Transfer ────────────────────────────────────────────────────────
step "Packaging build files..."
tar czf build.tar.gz build/

step "Transferring build to remote server..."
scp build.tar.gz $REMOTE:/tmp/
rm build.tar.gz
info "Build files transferred."

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ $1 == "--init" ]]; then
  step "Creating remote directory..."
  ssh $REMOTE "mkdir -p $REMOTE_DIR"

  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"

  step "Setting up nginx configuration..."
  scp your-site.conf $REMOTE:/etc/nginx/conf.d/your-site.conf
  ssh $REMOTE "chmod 644 /etc/nginx/conf.d/your-site.conf && nginx -t && systemctl reload nginx"
  info "Nginx configured."
else
  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"
  ssh $REMOTE "systemctl reload nginx"
fi

info "Deployment complete. Your website should now be live."

```
</details>

<details>
<summary>完整部署 zsh 脚本</summary>

```bash
#!/bin/zsh
set -e

# ── Colors (tput with graceful fallback) ──────────────────────────────────────
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
RED=$(tput setaf 1 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

# ── Logging helpers ───────────────────────────────────────────────────────────
info()  { echo "${BOLD}${GREEN}[✓]${RESET} $*"; }
step()  { echo "${BOLD}${YELLOW}[→]${RESET} $*"; }
error() { echo "${BOLD}${RED}[✗]${RESET} $*" >&2; }

# ── Cleanup on error ──────────────────────────────────────────────────────────
cleanup() {
  error "Deployment failed. Cleaning up temporary files..."
  [[ -f build.tar.gz ]] && rm -f build.tar.gz
  ssh $REMOTE "rm -f /tmp/build.tar.gz" 2>/dev/null || true
}
trap cleanup ERR

# ── Config ────────────────────────────────────────────────────────────────────
REMOTE=user@server
REMOTE_DIR=/path/to/deploy

# ── Build ─────────────────────────────────────────────────────────────────────
step "Clearing previous build..."
npm run clear

step "Building project..."
npm run build
info "Build complete."

# ── Package & Transfer ────────────────────────────────────────────────────────
step "Packaging build files..."
tar czf build.tar.gz build/

step "Transferring build to remote server..."
scp build.tar.gz $REMOTE:/tmp/
rm build.tar.gz
info "Build files transferred."

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ $1 == "--init" ]]; then
  step "Creating remote directory..."
  ssh $REMOTE "mkdir -p $REMOTE_DIR"

  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"

  step "Setting up nginx configuration..."
  scp your-site.conf $REMOTE:/etc/nginx/conf.d/your-site.conf
  ssh $REMOTE "zsh -i -c 'chmod 644 /etc/nginx/conf.d/your-site.conf && nginx -t && systemctl reload nginx'"
  info "Nginx configured."
else
  step "Deploying build files..."
  ssh $REMOTE "tar xzf /tmp/build.tar.gz -C $REMOTE_DIR && rm /tmp/build.tar.gz"
  ssh $REMOTE "chown -R www-data:www-data $REMOTE_DIR"
fi

info "Deployment complete. Your website should now be live."

```
</details>