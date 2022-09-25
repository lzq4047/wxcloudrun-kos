const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const cloud = require('wx-server-sdk');
const request = require('request');
const { init: initDB, Counter } = require("./db");

const router = new Router();
cloud.init();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
// router.post("/api/count", async (ctx) => {
//   const { request } = ctx;
//   const { action } = request.body;
//   if (action === "inc") {
//     await Counter.create();
//   } else if (action === "clear") {
//     await Counter.destroy({
//       truncate: true,
//     });
//   }

//   ctx.body = {
//     code: 0,
//     data: await Counter.count(),
//   };
// });

// // 获取计数
// router.get("/api/count", async (ctx) => {
//   const result = await Counter.count();

//   ctx.body = {
//     code: 0,
//     data: result,
//   };
// });

router.post('/api/weyek/proxy/openapi/subscribeMessage', async ctx => {
  const {
    method,
    params = {}
  } = ctx.request.body || {};
  console.log(ctx.request.body);
  try {
    const result = await cloud.openapi.subscribeMessage[method](params);
    ctx.body = {
      code: 0,
      data: result,
    };
  } catch (error) {
    return error;
  }
})

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

// 
router.get("/api/weyek/echo", async ctx => {
  const { text } = ctx.request.query || {};
  ctx.body = {
    code: 0,
    data: text
  };
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  // await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
