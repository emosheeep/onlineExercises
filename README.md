# exercises
这是我正式学习javascript的第一个项目，最初拿js写，后来用vue写，在后来使用小程序框架又写了一次。还是有不少收获的。
但当时没有构建的概念。随着学习的深入，最近终于学习到了webpack的优化，所以回过头来将之前的项目进行打包上的优化，
并部署到服务器上。

> 在线做题网站，Vue框架+Vuex状态管理

[后端仓库地址](https://github.com/1446445040/onlineExercisesServer)

[预览](http://app.biubiubius.com:8001)

## 截图
![加载](./screenshots/加载.png)
![界面](./screenshots/界面.png)
![答题卡](./screenshots/答题卡.png)

## 起步

``` bash
# 安装依赖
npm install

# 运行服务，端口可在config目录下index.js文件配置
npm run dev

# 构建项目并输出打包分析报告（构建项目需要运行在服务器上）
npm run build

```

### 可能的问题
运行过程中如果发现请求错误，请大家自行修改一下请求地址，位置如下：

 ```/src/api/api.js```
