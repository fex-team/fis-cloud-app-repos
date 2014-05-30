##介绍
	fis component is your package manager。

##安装
	$npm install fis-command-component
	
fis component 被发布为一套 npm包，对它对环境的要求是：

+ 操作系统：任何能安装 nodejs 的操作系统
+ **安装fis component之前要先安装fis噢~**

##使用	

### install  下载资源  

	fis component install <name>@<version>

+ fis component install 下载资源以及资源的所有依赖到当前目录。
+ 不输入version时，默认下载最新版本
+ 当前目录已经存在该资源的，提示已经存在，不会覆盖，需要手动删除才能继续下载。

###search  搜索资源  
	$fis component search <key>

+ 通过关键字搜索资源。

### 分享资源

#### adduser
	添加注册用户

+ 通过用户名，密码，email创建用户。
+ 发布资源前需要添加用户噢

#### publish
发布资源到fis component

	 fis component publish <folder>

+ < folder >: 一个包含package.json的文件夹

+ 如果包名（name）或者版本（version）已经存在，会发布失败. 
+ 可以添加 --force 参数来强行覆盖已存在的版本。

#### package.json

`资源必须包括package.json文件`

	{
	  "name": "myproject",
	  "version": "0.0.1",
	  "description": "An example Node.js project",
	  "dependencies": {
	  	"jquery" : "1.7.1",
	  	"underscore": null
	  },
	  "repository": {
	    "type": "git",
	    "url": "https://github.com/myproject"
  	  },
	  "keywords": [
	    "myproject",
	    "jquery"
	  ],
  	  "author": "me",
  	  "license": "MIT",
	}

####README.md
	为资源添加介绍，会在网站上显示噢

#### unpublish

	fis component unpublish <name>[@<version>]

1.	删除资源。如果不设定版本，会删除此资源的所有版本。

#### owner
管理已发布资源的维护人。

	fis component owner ls <package name>
	fis component owner add <user> <package name>
	fis component owner rm <user> <package name>

1.	**ls**: 列出对资源有修改权限的维护人。
1.	**add**: 对资源添加维护人。
1.	**rm**: 删除资源的维护人。

注意：所有资源的操作权限只有两种。可修改与不可修改。

##找到我们
	有任何使用问题和建议，可以发邮件给 zhangying05@baidu.com
	会及时回复，谢谢~