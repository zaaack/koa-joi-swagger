import { controller, get, post } from 'koa-dec-router'
import BaseCtrl from './Base'

const posts = []

class Post {
  constructor(data) {
    const _id = String(posts.length + 1)
    const post = {
      ...data,
      _id,
      url: `http://127.0.0.1:3456/post/${_id}`,
      read_count: 0,
    }
    this.data = post
  }

  get(field) {
    return this.data[field]
  }

  set(field, value) {
    this.data[field] = value
  }

  toJSON() {
    return this.data
  }
}

function savePost(entity) {
  const post = new Post(entity)
  posts.push(post)
  return post
}

@controller('/post')
export default class PostCtrl extends BaseCtrl {

  @get('s')
  async list(ctx) {
    const { page = 1, limit = 10 } = ctx.query
    const start = (page - 1) * limit
    ctx.body = {
      code: 0,
      data: {
        start,
        limit,
        page,
        data: posts.slice(start, page * limit),
        total: posts.length,
      },
    }
  }

  @get('/:id')
  async get(ctx) {
    console.log(ctx)
    const { okMore, okMatch, errorMore } = ctx.query
    const { id } = ctx.params
    const post = posts.find(p => p.get('_id') === id)
    if (!post) {
      ctx.status = 404
      ctx.body = {
        code: 1,
        message: 'not_found',
        data: {},
      }
      if (errorMore) {
        ctx.body.more_field = 'more_field'
      }
      return
    }
    if (okMore) {
      post.set('more_field', 'more_field')
    }
    if (okMatch) {
      post.set('read_count', 'stringType')
    }
    ctx.body = {
      code: 0,
      data: post.data,
    }
  }

  @post('/create')
  async create(ctx) {
    const { entity } = ctx.request.body
    ctx.body = {
      code: 0,
      data: savePost(entity),
    }
  }
}
