import test from 'ava'
import app from './fixtures/server'
import supertest from 'supertest'
import getPort from 'get-port'

let agent
let date = new Date()

const postCreate = {
  title: 'Some title',
  author: 'Some author',
  summary: 'Some summary',
  pub_date: date,
  content: '<div>balabala</div>',
}

const post = {
  title: 'Some title',
  author: 'Some author',
  summary: 'Some summary',
  pub_date: date.toJSON(),
  content: '<div>balabala</div>',
  _id: '1',
  url: 'http://127.0.0.1:3456/post/1',
  read_count: 0,
}

const notFound = {
  code: 1,
  data: {},
  message: 'not_found',
}

async function createPost() {
  let res = await agent.post('/api/v1/post/create').send({ entity: postCreate })
  return res.body.data;
}

test.before(async () => {
  const port = await getPort(3457).then(port => {
    app.listen(port)
    console.log(`Listen at: http://127.0.0.1:${port}`)
  })
  agent = supertest(app.listen())
})

test('success', async t => {
  let res = await agent.get('/api/v1/posts').expect(200)
  t.deepEqual(res.body, {
    'code': 0,
    'data': {
      'start': 0,
      'limit': 10,
      'page': 1,
      'data': [],
      'total': 0,
    },
  })
  res = await agent.post('/api/v1/post/create')
   .send({
     entity: postCreate,
   })
   .expect(200)
  let createdPost = res.body.data;

  t.deepEqual(res.body, {
    code: 0,
    data: post,
  })
  res = await agent.get(`/api/v1/post/${createdPost._id}`).expect(200)
  t.deepEqual(res.body, {
    code: 0,
    data: createdPost,
  })
})

test('error', async t => {
  let res = await agent.get('/api/v1/post/666').expect(404)
  t.deepEqual(res.body, notFound)
})

test('remove more field', async t => {
  let createdPost = await createPost();
  let res = await agent
    .get(`/api/v1/post/${createdPost._id}`)
    .query({
      okMore: true,
    })
    .expect(200)
  t.deepEqual(res.body, {
    code: 0,
    data: createdPost,
  })

  res = await agent
    .get('/api/v1/post/666')
    .query({
      failMore: true,
    })
    .expect(404)
  t.deepEqual(res.body, notFound)
})

test('error type', async t => {
  let createdPost = await createPost();
  let res = await agent
    .get(`/api/v1/post/${createdPost._id}`)
    .query({
      okMatch: true,
    })
    .expect(500)

  t.deepEqual(res.body, {
    code: 1,
    message: 'response.body:child "data" fails because [child "read_count" fails because ["read_count" must be a number]]',
    data: {
      code: 0,
      data: {
        ...createdPost,
        read_count: 'stringType',
        //more_field: 'more_field',
      },
    },
  })
})

test('request validation', async t => {
  let res = await agent
    .post('/api/v1/post/create')
    .send({
      entity: {
        _id: '123',
        title: 'aaa',
      },
    })
    .expect(400)
  t.deepEqual(res.body, {
    code: 1,
    message: 'request.body:child "entity" fails because [child "author" fails because ["author" is required]]',
    data: {
      entity: {
        _id: '123',
        title: 'aaa',
      },
    },
  })
})


test('do not cache different methods with same path', async t => {
  let createdPost = await createPost();
  let res = await agent.get(`/api/v1/post/${createdPost._id}`)
    .expect(200)
  t.deepEqual(res.body, {
    code: 0,
    data: createdPost,
  })

  res = await agent
    .put(`/api/v1/post/${createdPost._id}`)
    .expect(400)

  t.deepEqual(res.body, {
    code: 1,
    data: {},
    message: 'request.body:child "entity" fails because ["entity" is required]',
  })
})
