import joiSwagger from '../../src'
const { Joi } = joiSwagger

export function api(schema) {
  return Joi.object().keys({
    code: Joi.number().integer().required().description('code'),
    data: schema.description('data'),
  })
}

export function page(schema) {
  return Joi.object().keys({
    data: Joi.array().items(schema).required().description('page list'),
    total: Joi.number().integer().required().description('total item count'),
    start: Joi.number().integer().required().description('start item count'),
    limit: Joi.number().integer().required().description('item count per page'),
    page: Joi.number().integer().required().description('page number, starts with 1'),
  })
}

export function pageApi(schema) {
  return api(page(schema))
}

export const Err = Joi.object().json().keys({
  code: Joi.number().integer(),
  message: Joi.string(),
  data: Joi.object(),
})

export function pageQuery(schema = Joi.object()) {
  return Joi.object().keys({
    page: Joi.number().integer().optional().description('当前页数(starts with 1)'),
    limit: Joi.number().integer().optional().description('每页条数'),
  }).concat(schema)
}

export const errorResponse = {
  'default': {
    description: '出现错误(请求错误4xx)',
    schema: Err,
  },
}

export function querySchema(schema) {
  return schema
}
