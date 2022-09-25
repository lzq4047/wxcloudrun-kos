const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const cloud = require('wx-server-sdk');
const axios = require('axios');
const { init: initDB, Counter } = require("./db");

const router = new Router();
cloud.init({});

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
const URL_PREFIX = 'http://api.weixin.qq.com';

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  const { action } = request.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }

  ctx.body = {
    code: 0,
    data: await Counter.count(),
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.count();

  ctx.body = {
    code: 0,
    data: result,
  };
});

router.get('/api/weyek/proxy/openapi/subscribeMessage/getTemplateList', async ctx => {
  console.log(ctx.request.body);
  try {
    const result = await cloud.openapi.subscribeMessage.getTemplateList({});
    console.log('getTemplateList result', result);
    ctx.body = {
      code: 0,
      data: result,
    };
  } catch (error) {
    return error;
  }
})

router.get('/api/weyek/proxy/openapi/subscribeMessage/getTemplateList1', async ctx => {
  console.log(ctx.request.body);
  try {
    const result = await axios.get('http://api.weixin.qq.com/wxa/gettemplatelist', {

    });
    console.log('getTemplateList result', result.data);
    ctx.body = {
      code: 0,
      data: result.data,
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

router.post('/api/weyek/proxy', async ctx => {
  const requestHeaders = ctx.header;
  const {
    method = 'get',
    path = '/',
    query = {},
    data: requestData = {},
  } = ctx.body || {};
  console.log(ctx.body);
  try {
    const result = await axios({
      method,
      url: `${URL_PREFIX}${path}`,
      query,
      data: requestData
    });
  
    ctx.body = {
      code: 0,
      requestHeaders,
      query: ctx.query,
      data: result.data
    };
  } catch (error) {
    console.error(error);
    return error;
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
