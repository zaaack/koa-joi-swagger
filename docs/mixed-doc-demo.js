import { toSwaggerDoc } from '../src'
import Joi from 'joi'
import fs from 'fs'

const mixedDoc = {
  swagger: '2.0',
  info: {
    title: 'Test API',
    description: 'Test API',
    version: '1.0.0',
  },
  //  the domain of the service
  //  host: 127.0.0.1:3457
  //  array of all schemes that your API supports
  schemes: ['https', 'http'],
  //  will be prefixed to all paths
  basePath: '/api/v1',
  consumes: ['application/x-www-form-urlencoded'],
  produces: ['application/json'],
  paths: {
    '/posts': {
      get: {
        summary: 'Some posts',
        tags: ['Post'],
        parameters: {
          query: Joi.object().keys({
            type: Joi.string().valid(['news', 'article']),
          }),
        },
        responses: {
          '200': {
            description: 'Post list',
            schema: Joi.object().keys({
              lists: Joi.array().items(Joi.object().keys({
                title: Joi.string().description('Post title'),
                content: Joi.string().required().description('Post content'),
              }))
            }),
          },
          'default': {
            description: 'Error happened',
            schema: Joi.object().keys({
              code: Joi.number().integer(),
              message: Joi.string(),
              data: Joi.object(),
            }),
          },
        }
      }
    },
  },
}


const swaggerDoc = toSwaggerDoc(mixedDoc)
fs.writeFileSync('./docs/swagger-doc-from-mixed-doc.json', JSON.stringify(swaggerDoc, null, 2))
