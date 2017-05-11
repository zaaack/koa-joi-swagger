import send from 'koa-send'
import path from 'path'
import { debug } from './utils'
import swaggerV2UIHtml from './ui-html'
import swaggerV3UIHtml from './ui-html-v3'
const swaggerV2Path = path.dirname(require.resolve('swagger-ui/package.json')) + '/dist'
const swaggerV3Path = path.dirname(require.resolve('swagger-ui-dist/package.json'))
debug('swaggerV3Path', swaggerV3Path)
export default function(
  document, {
    pathRoot = '/swagger',
    skipPaths = [],
    UIHtml = swaggerV2UIHtml,
    UIAssetsPath = swaggerV2Path,
    swaggerConfig = '{}',
    sendConfig = { maxage: 3600 * 1000 * 24 * 30 },
    v3 = false,
  } = {}
) {
  if (v3) {
    if (UIHtml === swaggerV2UIHtml) {
      UIHtml = swaggerV3UIHtml
    }
    if (UIAssetsPath === swaggerV2Path) {
      UIAssetsPath = swaggerV3Path
    }
  }
  const pathPrefix = pathRoot.endsWith('/') ? pathRoot.substring(0, pathRoot.length - 1) : pathRoot
  const html = UIHtml(document, pathPrefix, swaggerConfig)

  return async (context, next) => {
    if (context.path.startsWith(pathRoot)) {
      const skipPath = skipPaths.some((path) => context.path.startsWith(path))
      if (context.path === pathRoot && context.method === 'GET') {
        context.type = 'text/html charset=utf-8'
        context.body = html
        context.status = 200
        return
      } else if (context.path.replace(/\.json$/, '') === (pathPrefix + '/api-docs') && context.method === 'GET') {
        context.type = 'application/json charset=utf-8'
        context.body = document
        context.status = 200
        return
      } else if (
        !skipPath &&
        context.path.startsWith(pathRoot + '/') &&
        context.method === 'GET'
      ) {
        const filePath = context.path.substring(pathRoot.length)
        await send(context, filePath, { root: UIAssetsPath, ...sendConfig })
        return
      }
    }
    return next()
  }
}
