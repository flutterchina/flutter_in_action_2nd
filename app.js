const koa = require('koa') ;
const Router = require('koa-router');
// 创建路由对象
var router = require('koa-router')() ;
const static = require('koa-static') ;
const path = require('path') ;

const app = new koa() ;

// 获取静态资源
app.use(static(path.join(__dirname,'docs'))) ;



// 启用路由
app.use(router.routes())
  .use(router.allowedMethods())

app.listen(9000,()=>{
  console.log('服务器已启动，9000端口监听中... ') ;
})
