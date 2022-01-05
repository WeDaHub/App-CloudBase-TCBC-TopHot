// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  "env":"cloud1-5gkoxa0pe1011c03"
})
const db = cloud.database()

legal_sites={
  's.weibo.com':true,
  'zhihu.com':true
}

// 云函数入口函数
exports.main = async (event, context) => {
  let url = 'https://open.tophub.today/hot'

  // 请求第三方API获取数据
  axios.get(url)
  .then(function(res){
    let items = res.data.data.items
    let MAX_ITEM = 20
    let len = items.length
    let update_time = new Date().getTime()
    for (let i = 0, count = 0; i < len && count < MAX_ITEM; i++) {
      let item = items[i]
      if (!isLegalSite(item.sitename)) {
        console.log('skip site:',item.sitename, ', title:', item.title )
        continue
      }
      item.update_time = update_time
      count++
      // 防止超过云数据库接口限制，这里需要设置超时时间，300ms即可
      setTimeout(function(){
        console.log('start to add item ', i)
        // 如果添加一条新数据成功，就尝试删除旧数据
        // 这是为了尽可能防止添加数据失败时删除成功（也可以promise all之后再调用删除
        addRecord('tophot', item)
        .then( res => {
          console.log('[新增记录] 成功， 记录 _id: ', res._id)
          if (i == 0) {
            console.log('删除旧数据，小于该时间戳的记录会被删除: ', update_time)
            removeOldRecords(update_time)
          }
        })
        .catch( err => {
          console.log('[新增记录] '+i+' 失败: ', err)
        })
       }, 300*i)
    }
  })
  .catch(function(err){
    console.log("err:"+err)
  });
  return
}

// return a promise 
function addRecord(collection_name, data) {
  return db.collection(collection_name).add({
    data:data,
  })
}

function removeOldRecords(update_time) {
  const _ = db.command
  db.collection('tophot').where({
    update_time: _.lt(update_time)
  }).remove()
}

function isLegalSite(site_name) {
  return legal_sites[site_name]
}