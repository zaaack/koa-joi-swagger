import Debug from 'debug'
import joi2jsonSchema from 'joi-to-json-schema'
import cloneDeepWith from 'lodash/cloneDeepWith'
export const debug = Debug('joi-swagger')

const ctx2paramMap = {
  'pathParams': 'path',
  'query': 'query',
  'headers': 'header',
  'body': 'formData',
}

const joiKey = 'jsonSchema'

export function toSwaggerParams(joiMap) {
  let params = []
  Object.keys(joiMap).forEach(key => {
    const fullJsonSchema = joi2jsonSchema(joiMap[key])
    for (let name in fullJsonSchema.properties) {
      const jsonSchema = fullJsonSchema.properties[name]
      const paramType = ctx2paramMap[key]
      const param = {
        name,
        allowEmptyValue: true,
        in: paramType,
        required: fullJsonSchema.required && fullJsonSchema.required.indexOf(name) >= 0,
      }
      if (paramType === 'body') {
        param.schema = jsonSchema
      } else {
        Object.assign(param, jsonSchema)
      }
      params.push(param)
    }
  })
  params[joiKey] = joiMap
  return params
}

export function toSwaggerDoc(mixedSchema) {
  const swaggerDoc = cloneDeepWith(mixedSchema, value => {
    if (typeof value === 'object' && value.isJoi === true) {
      return value.clone()
    }
  })
  for (let path in swaggerDoc.paths) {
    const pathInfo = swaggerDoc.paths[path]
    for (let method in pathInfo) {
      const methodInfo = pathInfo[method]
      methodInfo.parameters = toSwaggerParams(methodInfo.parameters)
      for (let status in methodInfo.responses) {
        const resInfo = methodInfo.responses[status]
        if (resInfo.schema && resInfo.schema.isJoi) {
          resInfo.schema = joi2jsonSchema(resInfo.schema)
        }
      }
    }
  }
  return swaggerDoc
}
