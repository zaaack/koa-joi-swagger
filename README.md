# koa-joi-swagger

* Using joi schema to validate request & response, and generate swagger document to create beautiful API documents.


[![Build Status](https://travis-ci.org/zaaack/koa-joi-swagger.svg?branch=master)](https://travis-ci.org/zaaack/koa-joi-swagger) [![npm](https://img.shields.io/npm/v/koa-joi-swagger.svg)](https://www.npmjs.com/package/koa-joi-swagger) [![npm](https://img.shields.io/npm/dm/koa-joi-swagger.svg)](https://www.npmjs.com/package/koa-joi-swagger)

## Feature

* Router agnostic.
* Using your favorite library for validation, and generate swagger document for develop.
* Serving Swagger UI in your koa project.
* ...

## Install

```sh
npm i -g koa-joi-swagger

```

or

```sh
yarn add koa-joi-swagger
```
## Demo

app.js
```js
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
// mount swagger ui in `/swagger`
app.use(ui(swaggerDoc, {pathRoot: '/swagger'}))

// handle validation errors
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

// validate request and response by mixedDoc
app.use(mixedValidate(mixedDoc, {
  onError: e => console.log(e.details, e._object),
}))

// koa-dec-router
app.use(decRouter.router.routes())
app.use(decRouter.router.allowedMethods())

app.listen(3456)
```

> "I see the api is simple, but how to write the joi schema and the swagger document?"

That's the point, you don't need to write a joi schema to validation and a swagger document to create API documents.

> "Oh, no, Should I learn a new schema?"

Of cause not, I hate new schemas, too, especially those made by someone or some company without long support, it's just a waste of time and my brain cell.

Therefore, to make this library simple and reliable, I just mixed joi and swagger document, and using [joi-to-json-schema](https://github.com/lightsofapollo/joi-to-json-schema/) to transform joi schema to swagger schema. You don't have to learn a new schema, just replace the JSON schema in your swagger document to joi schema, then let this library to do the rest.

I call it mixed document, here is an example.

```js
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
            x: 'Post list',
            schema: Joi.object().keys({
              lists: Joi.array().items(Joi.object().keys({
                title: Joi.string().description('Post title'),
                content: Joi.string().required().description('Post content'),
              }))
            }),
          },
          'default': {
            description: 'Error happened',
            schema: Joi.object().json().keys({
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
```

You can see the differences between this and the real swagger document, just replace `parameters` and `responses` to joi schema instead of JSON schema,

[Here is the swagger document that generate from mixed document above](docs/swagger-doc-from-mixed-doc.json).

## API

```js
import JoiSwagger, {
  toSwaggerDoc, mixedValidate, joiValidate, ui
} from 'koa-joi-swagger'
import Koa from 'koa'

const app = new Koa()
/*

JoiSwagger = {
  toSwaggerDoc,
  mixedValidate,
  joiValidate,
  ui,
  Joi,
}
 */

const mixedDoc = require('./mixed-doc')

const swaggerDoc = toSwaggerDoc(mixedDoc) // parse mixed document to swagger document for swagger-ui


//
// const defaultResJoiOpts = {
//   stripUnknown: true,
//   convert: true,
// }
app.use(mixedValidate(mixedDoc, {
  reqOpts: {
    stripUnknown: false,
    convert: true,
  }, // optional, ctx.request joi validation options, here is default
  resOpts: { // optional, ctx.response joi validation options, here is default
    stripUnknown: true, // this would remove additional properties
    convert: true, // this would convert field types
  },
  onError: err => console.error(err), // Do something with the error, the error would throw anyway.
}))

app.use(ui(swaggerDoc, {
  pathRoot: '/swagger', // optional, swagger path
  skipPaths = [], // optional, skip paths
  UIHtml = defaultUIHtml, // optional, get ui html
  swaggerConfig = '', // optional, something like, `{ <field>: <value>, .... }` to display in html for overriding swagger ui options.
  sendConfig = { maxage: 3600 * 1000 * 24 * 30 }, // optional, config for koa-send, default maxage is 1 month.
}))

// joiValidate // the internal joi validation function used by mixedValidate, in case you need one.
// JoiSwagger.Joi // The joi used to validate, with some opinionated extension, you can override it or using it.

```

## Q & A

#### 1. Why not using [ajv](https://github.com/epoberezkin/ajv) to validate by swagger document directly?

I have think it before, but hit some problems like validating javascript date object, remove additionalProperties, etc. And writing JSON schema is too verbose. Joi is the best validation library in NodeJS, we should take the advantage.

#### 2. Why not using YAML?

YAML is not easy to reuse, although JSON schema can reuse model, and how to reuse shared properties between models? I can't find a way. Pure javascrip can easily reuse or wrap model schema, and you can wrap each final schema with a function, don't feel pain when adding properties for each request schema in the future.

#### 3. You extended Joi, why?

Sorry, joi's philosophy is too strict for me, I really don't need to explicit declare the string could be empty, so I override the original `Joi.string()` to make `Joi.string().empty('')` is a default behavior.

Also, add a `.force()` method for string/number type, to coerce the field to string/number regardless of the original type, it's really useful when validating some bson type like Long, Deciaml or Custom object.


Added a `Joi.object().json()` to coerce object with `toJSON` method to a plain JSON object. This would useful when validation some ORM/ODM's model object (like mongorito).

[See the code](src/joi.js)

And I highly recommend using this extended joi to write your schemas, and adding your extension if you need.

You can also using other version of Joi to validate.

```js
import JoiSwagger from 'koa-joi-swagger'
import myJoi from './myJoi'

// using
export const Joi = JoiSwagger.Joi

// override
JoiSwagger.Joi = myJoi

```
