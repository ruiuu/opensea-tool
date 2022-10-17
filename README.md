# opensea-tools

opensea市值管理工具

## 安装和运行

```bash
npm i
npm run dev
open http://localhost:7001/
```

## pm2 部署
```bash
# 编译
npm run build
# 安装 pm2
npm install -g pm2
# pm2 部署
# --name 用于指定应用名
# -i 用于指定启动的实例数（进程）
pm2 start ./bootstrap.js --name maker -i 1

# 日志
pm2 log
# 查看应用运行状态
pm2 list

```