import pify from 'pify'
import pathToRegexp from 'path-to-regexp'
import globals from './globals'
import { debug } from './utils'

const errorNameMap = {
  request: 'RequestValidationError',
  response: 'ResponseValidationError'
}

async function validateFields(obj, schema, opts) {
  const promises = []
  debug('schema', schema)
  const pValidate = pify(globals.Joi.validate)
  for (let key in schema) {
    if (!schema[key].isJoi) {
      debug('skip', key, schema)
      continue
    }
    promises.push(
      pValidate(obj[key], schema[key], opts.joiOpts)
        .then(ret => {
          debug('set ctx', key, ret, obj[key], schema[key].describe())
          obj[key] = ret
        })
        .catch(err => {
          debug('set ctx catch', err, key, obj[key], schema[key].describe())
          const error = new Error()
          Object.assign(error, {
            details: err.details,
            _object: err._object,
          })
          error.message = `${opts.errorType}.${key}:${err.message}`
          // error.stack = err.stack
          error.data = err._object
          error.type = error.name = errorNameMap[opts.errorType]
          throw error
        })
    )
  }
  await Promise.all(promises)
}
/**
 * [joiValidate description]
 * @param  {[type]} schema e.g.
 * {
 *   req: {
 *     query: <joiSchema>,
 *     headers: <joiSchema>,
 *     params: <joiSchema>,
 *   },
 *   res: {
 *    '200': <joiSchema>,
 *    'default': <joiSchema>
 *    // or
 *    // 'default': {
 *    //    schema: <joiSchema>
 *    // }
 *   },
 * }
 * @return {[type]}        [description]
 */
export function joiValidate(schema) {
  const {
    getReqSchema = sm => sm.req,
    getResSchema = (sm, ctx) => {
      debug('ctx.status', ctx.status)
      const resObj = sm.res[ctx.status + ''] || sm.res.default
      const resSchema = resObj.schema || resObj
      return { body: resSchema }
    }
  } = schema
  return async function (ctx, next) {
    await validateFields(ctx.request, getReqSchema(schema, ctx), {
      joiOpts: schema.reqOpts,
      errorType: 'request',
    })
    debug('validateRequest')
    await next()
    await validateFields(ctx.response, getResSchema(schema, ctx), {
      joiOpts: schema.resOpts,
      errorType: 'response',
    })
    debug('validateResponse')
  }
}

const defaultReqJoiOpts = {
  stripUnknown: false,
  convert: true,
}

const defaultResJoiOpts = {
  stripUnknown: true,
  convert: true,
}

export default function mixedValidate(document, opts = {}) {
  opts = {
    reqOpts: defaultReqJoiOpts,
    resOpts: defaultResJoiOpts,
    onError: null,
    ...opts,
  }
  const schemaInfos = Object.keys(document.paths).map(p => {
    const keys = []
    return {
      path: p,
      keys,
      pathRe: pathToRegexp(p.replace(/{(\w+)}/g, ':$1'), keys),
      fullPath: document.basePath + p,
      schema: document.paths[p],
    }
  })
  function matchPath(si, ctx) {
    const path = ctx.path.replace(new RegExp(`^${document.basePath}`), '')
    const match = path.match(si.pathRe)
    return match && (ctx.method.toLowerCase() in si.schema) && si.keys.reduce((params, key, i) => {
      params[key.name] = match[i + 1]
      return params
    }, {})
  }
  const cache = {}
  return async (ctx, next) => {
    let pathParams
    let schemaInfo = schemaInfos.find(
      si => (pathParams = pathParams || matchPath(si, ctx)))
    ctx.request.pathParams = pathParams;
    if (!schemaInfo) return next()
    const method = ctx.method.toLowerCase()
    const key = method + schemaInfo.path
    let validate = cache[key]
    if (!validate) {
      debug('schemaInfo', method, schemaInfo.schema)
      const schema = schemaInfo.schema[method]
      const joiValidateSchema = {
        req: schema.parameters,
        res: schema.responses,
        ...opts,
      }
      validate = cache[key] = joiValidate(joiValidateSchema)
    }
    try {
      await validate(ctx, next)
      debug('ctx', ctx)
    } catch (e) {
      opts.onError && opts.onError(e)
      debug('body', typeof ctx.body)
      throw e
    }
  }
}
