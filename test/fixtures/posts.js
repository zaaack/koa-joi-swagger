import { Err, pageQuery, api, page, pageApi } from './utils'

import joiSwagger from '../../src'

const { Joi } = joiSwagger
import Debug from 'debug'

const debug = Debug('koa-joi-swagger:test')

const PostCreate = Joi.object().json().keys({
  title: Joi.string().required().description('标题'),
  author: Joi.string().required().description('作者'),
  summary: Joi.string().required().description('摘要'),
  pub_date: Joi.date(),
  content: Joi.string().required().description('内容(html)'),
}).description('Post')

const PostLite = PostCreate.concat(Joi.object().json().keys({
  _id: Joi.string().force().required().description('_id'),
  url: Joi.string().uri(),
  read_count: Joi.number().integer(),
}))

const Post = PostLite.concat(Joi.object().json().keys({
  content: Joi.string().required().description('内容(html)'),
}))

const pathId = (msg = 'path id') => Joi.object().keys({
  id: Joi.string().required().description(msg),
})

export default {
  '/posts': {
    get: {
      summary: '文章列表',
      tags: ['Post'],
      parameters: {
        query: pageQuery(),
      },
      responses: {
        '200': {
          schema: pageApi(PostLite),
        },
        'default': {
          description: '出现错误(请求错误4xx)',
          schema: Err,
        },
      }
    }
  },
  '/post/{id}': {
    get: {
      summary: '文章详情',
      description: '文章详情',
      tags: ['Post'],
      parameters: {
        pathParams: pathId(),
      },
      responses: {
        '200': {
          description: '文章详情',
          schema: api(Post),
        },
        'default': {
          description: '出现错误(请求错误4xx)',
          schema: Err,
        },
      },
    },
    put: {
      summary: 'Edit post',
      description: 'Edit post',
      tags: ['Post'],
      parameters: {
        pathParams: pathId(),
        body: Joi.object().keys({
          entity: PostCreate.required(),
        }),
      },
      responses: {
        '200': {
          description: '文章详情',
          schema: api(Post),
        },
        'default': {
          description: '出现错误(请求错误4xx)',
          schema: Err,
        },
      },
    },
  },
  '/post/create': {
    post: {
      summary: '创建文章',
      description: '创建文章',
      tags: ['Post'],
      parameters: {
        body: Joi.object().keys({
          entity: PostCreate.required(),
        }),
      },
      responses: {
        '200': {
          description: '文章详情',
          schema: api(Post),
        },
        'default': {
          description: '出现错误(请求错误4xx)',
          schema: Err,
        },
      },
    },
  },
}

export { PostLite }
