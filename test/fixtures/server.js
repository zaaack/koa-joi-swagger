import { toSwaggerDoc, ui, mixedValidate } from '../../src'
import mixedDoc from './mixed-doc'
import Koa from 'koa'
import DecRouter from 'koa-dec-router'
import bodyparser from 'koa-bodyparser'

const app = new Koa()

const decRouter = DecRouter({
  controllersDir: `${__dirname}/controllers`,
})

app.use(bodyparser())

const swaggerDoc = toSwaggerDoc(mixedDoc)
// debug('swaggerDoc', JSON.stringify(swaggerDoc, null, 2))
app.use(ui(swaggerDoc, {
  pathRoot: '/swagger',
  v3: process.env.V3 === '1',
  // Temporary fix https://github.com/swagger-api/swagger-ui/issues/3045
  swaggerConfig: `{
    configUrl: '/swagger-config'
  }`,
}))

app.use(async (ctx, next) => {
  if (ctx.path === '/swagger-config') {
    ctx.body = {
      url: ctx.origin + '/swagger/api-docs'
    }
  } else {
    await next()
  }
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (e.name === 'RequestValidationError') {
      ctx.status = 400
      ctx.body = {
        code: 1,
        message: e.message,
        data: e.data,
      }
    } else if (e.name === 'ResponseValidationError') {
      ctx.status = 500
      ctx.body = {
        code: 1,
        message: e.message,
        data: e.data,
      }
    }
  }
})

app.use(mixedValidate(mixedDoc, {
  onError: e => console.log(e.details, e._object),
}))

app.use(decRouter.router.routes())
app.use(decRouter.router.allowedMethods())

if (process.env.SERVE === '1') {
  const getPort = require('get-port')
  getPort(3456).then(port => {
    app.listen(port)
    console.log(`Listen at http://127.0.0.1:${port}`)
  })
}

export default app
