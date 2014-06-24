lights资源聚合平台app 
=====================

## 介绍
fis-cloud-app-repos是[lights](http://lightjs.duapp.com)包管理工具对应的服务端。

## 功能
* 默认集合在[fis-cloud](http://solar.baidu.com)云平台上
* 与lights包管理工具交互，实现资源的存储查询等操作
* 提供资源聚合网站，展示资源信息
* 此平台已经开源，直接访问[lights](http://lightjs.duapp.com)

## 使用开源

* 下载lights命令行客户端

```bash
    npm install lights -g
    lights -h //查看lights命令行帮助
    lights install pc-demo //从服务端下载demo到本地
```
* 访问[lights](http://lightjs.duapp.com)网站

## 搭建私有fis-cloud

* 需要安装[mongodb](http://www.mongodb.org/)数据库
* 安装fis-cloud

```bash
    npm install fis-cloud 
    cd fis-cloud/doc
    sh mongoStart.sh //启动数据库
    sh cloudStart.sh //启动fis-cloud
```

浏览器访问：http://localhost:8889/repos/component

## 详细搭建文档
* https://github.com/lily-zhangying/fis-cloud/wiki



