import { Err, pageQuery, api, page, pageApi } from './utils'
import postSchema from './posts'
import joiSwagger from '../../src'
const { Joi } = joiSwagger

export default {
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
    ...postSchema,
  },
}
