# 部署说明

一番赏“纯开车”H5应用 - 勇者部署手册

欢迎来到次元工厂！这份代码为您提供了一个完整的一番赏“开车模式”原型。

🚀 快速开始

环境准备：

确保您的电脑安装了 Node.js。

打开终端，创建一个新文件夹：mkdir kuji-app && cd kuji-app。

初始化项目：

执行 npm init -y。

将 package.json 的内容覆盖到本地。

安装依赖：npm install。

放置代码：

在项目根目录创建 index.html。

创建 src 文件夹，将 App.jsx 放入其中。

确保 index.html 中正确引用了 src/App.jsx。

本地预览：

执行 npm run dev。

打开浏览器访问 http://localhost:5173。

☁️ 云端发布 (Vercel)

GitHub 准备：

将您的代码推送到一个新的 GitHub 仓库。

连接 Vercel：

登录 Vercel。

点击 Add New Project。

导入您的 GitHub 仓库。

框架预设选择 Vite，直接点击 Deploy。

完成：

部署完成后，您将获得一个全球可访问的 xxx.vercel.app 链接。

⚠️ 开发者提示

数据持久化：当前应用使用 useState 进行模拟，刷新页面数据会重置。建议下一步连接 Firebase 或 Supabase。

二次元风格：通过修改 tailwind.config.js 中的 boxShadow.brutal 可以调整硬阴影的粗细。

祝您的探险一切顺利！