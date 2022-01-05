//tophot.js
const app = getApp()

Page({
  data: {
    openid:'',
    imgmap:{
      's.weibo.com':'../../images/tophot-weibo.png',
      'daily.zhihu.com':'../../images/tophot-daily-zhihu.png',
      'mp.weixin.qq.com':'../../images/tophot-weixin.png',
      '52pojie.cn':'../../images/tophot-52pojie.png',
      'zhihu.com':'../../images/tophot-zhihu.png',
      '36kr.com':'../../images/tophot-36kr.png',
      'bbs.hupu.com':'../../images/tophot-hupu.png',
      'post.smzdm.com':'../../images/tophot-smzdm.png',
      'jandan.net':'../../images/tophot-jandan.png',
      'ithome.com':'../../images/tophot-ithome.png',
      'huxiu.com':'../../images/tophot-huxiu.png',
    },
    miniproinfo:{
      'zhihu.com':{
        'appid':'wxeb39b10e39bf6b54',
        'path':'zhihu/question?id=' //id
      },
      's.weibo.com':{
        'appid':'wxf1b97b2df301a1c8',
        'path':'pages/comprehensiveSearch/index?page_from=hot&q=' // title
      },
    }
  },

  /**
   * 将更新时间戳转为“xx分钟更新前”这样的提示
   * @param {number} update_time 
   * @return {string} 返回的人性化更新时间提示
   */
  humanDate: function(update_time) {
    let MINUTE = 1000*60
    let HOUR = 60*MINUTE
    let DAY = 24*HOUR
    
    let now = new Date().getTime()
    let diff = now - update_time
    let human_str = '刚刚更新'
    if (diff <= 0) {
      return human_str
    }

    let minute_diff = Math.floor(diff / MINUTE)
    let hour_diff = Math.floor(diff / HOUR)
    let day_diff = Math.floor(diff / DAY)
    let week_diff = Math.floor(diff /(7*DAY))

    if (week_diff >= 1) {
      human_str = week_diff.toString()+'周前更新'
    }
    else if (day_diff >= 1) {
      human_str = day_diff.toString()+'天前更新'
    }
    else if (hour_diff >= 1) {
      human_str = hour_diff.toString()+'小时前更新'
    }
    else if (minute_diff > 1) {
      human_str = minute_diff.toString()+'分钟前更新'
    } else {
      human_str = '刚刚更新'
    }
    return human_str
  },

  onLoad: function () {
    const db = wx.cloud.database()
    db.collection('tophot').get({
      success: res => {
        if (res.data.length > 0) {
          this.setData({
            queryResult: this.parseItems(res.data)
          })
          console.log('[数据库] [查询记录] 成功: ', res)   
        } else { // 去备份库里边取搂底数据
          db.collection('tophot_bak').get({
            success: res=>{
              this.setData({
                queryResult:this.parseItems(res.data)
              })
              console.log('[数据库] [查询数据] [搂底] 成功:', res)
            }
          })
        }   
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 跳转到其他小程序，目前仅支持“微博热榜”和“知乎”
   * @param {*} event 
   */
  toOtherMini: function(event){
    console.log(event)
    let target = this.getNaviTarget(
      event.currentTarget.dataset.source,
      event.currentTarget.dataset.url,
      event.currentTarget.dataset.title,
      )
    if (!target) {
      return
    }

    wx.navigateToMiniProgram({
      appId: target.appid,
      path: target.path,
      envVersion: 'release',
      success(res) {
        // 打开成功
        console.log('open success')
      }
    })
  },

  /**
   * 根据传入的参数确定要跳转的小程序信息，目前仅支持“微博热榜”和“知乎”
   * @param {string} source 来源，对应sitename字段
   * @param {string} url 原始url
   * @param {string} title 标题
   */
  getNaviTarget: function(source, url, title) {
    if (!this.data.miniproinfo[source]) {
      return null
    }

    let appid=this.data.miniproinfo[source].appid
    let path = this.data.miniproinfo[source].path // prefix
    if (source === 'zhihu.com') {
      //get id from url
      let parts = url.split('/')
      let id = parts.pop()
      path = path+id
    } else if (source === 's.weibo.com') {
      path = path+title
    } else {
      return null
    }

    return {
      appid:appid,
      path:path,
    }
  },

  parseItems: function(items) {
    for (let i = 0, len = items.length; i < len; i++) {
      items[i].image_url = this.data.imgmap[items[i].sitename]
      items[i].update_time_str = this.humanDate(items[i].update_time)
      if (items[i].description.length == 0) {
        items[i].description = items[i].title
      }
    }
    return items
  }
})