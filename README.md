# 云开发应用-今日热榜

## 作品介绍

今日热榜，使用第三方API获取热榜信息，存储到云数据库中，前端操作云数据库获取到信息并展示。

数据最多只有20条，9-21点每小时会更新一次，这使用了云函数以及触发器来实现。

热榜中的数据如果来自微博或者知乎，支持直接跳转到“微博热榜”或“知乎”小程序来浏览对应的具体信息，其他来源不支持跳转。

使用的第三方API是：[https://open.tophub.today/hot](https://open.tophub.today/hot)，相关API文档可参考：[https://open.tophub.today/](https://open.tophub.today/)


## 模块介绍

主要由两部分组成，一部分云函数充作后端，一部分是前端的页面。

### 云函数

使用js编写，请求第三方接口来获取原始热榜信息，并存储到云数据库中。第三方接口最多会返回100条数据，但由于云数据库的读写限制，我们每次只会存储前20条数据，并且使用触发器来限制请求频率，目前是9-21点每小时请求一次。
云函数默认的超时时间是3s，但由于第三方API以及数据库读写接口的不稳定性，建议将云函数的超时时间配置为5s。

数据目前存储在云数据库的 tophot 集合中，此外还有一个tophot\_bak的集合，里边的数据是用来搂底的，可以手工插入数据，也可以将tophot重命名为tophot\_bak，然后建一个新的tophot。

### 前端页面

前端使用列表页来展示数据库中的数据，并且支持微博和知乎小程序的跳转，这块使用了小程序提供的`navigateToMiniProgram`功能。

跳转其他小程序主要需要提供appid和path，前者可以在微信端查看小程序信息获取到，后者可以参考这篇文章：[复制任意微信小程序页面路径](https://developers.weixin.qq.com/community/develop/article/doc/0008066531c28043d2185a4d356813)

## 作品体验

首页
![首页](miniprogram/images/example-index.jpeg)

打开微博前
![打开微博前](miniprogram/images/example-weibo-pre.jpeg)

打开微博热搜小程序
![打开微博热搜](miniprogram/images/example-weibo.jpeg)

打开知乎前
![打开知乎前](miniprogram/images/example-zhihu-pre.jpeg)

打开知乎小程序
![打开知乎](miniprogram/images/example-zhihu.jpeg)
