# BOXZY Start

BOXZY 官网启动页静态前端。项目使用原生 HTML、JavaScript 和 Tailwind CSS，不需要单独的前端框架运行时。

## 环境要求

- Node.js 18+
- npm
- 邮件订阅后端服务

所有环境统一使用：

```text
https://gateway.boxzy.io
```

订阅接口会自动追加以下路径：

```text
/api/email-subscription/subscribe
```

## 安装依赖

在项目根目录执行：

```bash
npm install
```

## 本地运行

启动本地静态文件服务器：

```bash
npm run dev
```

`npm run dev` 只启动静态文件服务器，不会修改订阅接口配置。

启动后访问：

```text
http://127.0.0.1:4173
```

邮件订阅请求始终发送到：

```text
https://gateway.boxzy.io/api/email-subscription/subscribe
```

如果只修改了 `src/styles.css`，可以使用 Tailwind 监听模式：

```bash
npm run watch
```

监听模式只重新生成 CSS。

## 构建

### 构建 CSS

```bash
npm run build
```

只有修改 `src/styles.css` 时才需要执行构建。接口配置固定在 `signup-config.js` 中，不需要通过环境变量注入。

## 自定义开发端口

静态服务器默认使用 `4173` 端口，可以通过 `PORT` 修改：

```bash
PORT=4174 npm run dev
```

## 项目结构

```text
index.html              页面结构
signup.js               邮件订阅交互
signup-config.js        订阅接口配置
scripts/dev-server.cjs  本地静态文件服务器
src/styles.css          Tailwind CSS 源文件
style.css               构建后的 CSS
assets/                 图片、字体和社交媒体资源
emails/                 邮件模板和邮件集成说明
```
