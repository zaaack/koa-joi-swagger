import Joi from 'joi'

let myJoi = Joi.extend({
  base: Joi.object(),
  name: 'object',
  language: {
    json: 'invalid json', // Used below as 'number.round'
  },
  coerce(value, state, options) {
    if (this._flags.json &&
        typeof value.toJSON === 'function') {
      return value.toJSON()
    }
    return value
  },
  pre(value, state, options) {
    return value
  },
  rules: [{
    name: 'json',
    setup(params) {
      this._flags.json = true
    },
  }],
})

myJoi = myJoi.extend({
  base: Joi.string(),
  name: 'string',
  language: {
    force: 'force toString',
  },
  coerce(value, state, options) {
    if (this._flags.force) {
      if (value == null) {
        return ''
      } if (typeof value.toString === 'function') {
        return value.toString()
      }
    }
    return value
  },
  pre(value, state, options) {
    return value
  },
  rules: [{
    name: 'force',
    setup(params) {
      this._flags.force = true
    },
    validate(params, value, state, options) {
      return value
    },
  }],
})

myJoi = myJoi.extend({
  base: Joi.number(),
  name: 'number',
  language: {
    force: 'force toNumber',
  },
  coerce(value, state, options) {
    if (
      this._flags.force &&
      value &&
      typeof value.toString === 'function'
    ) {
      return Number(value.toString())
    }
    return value
  },
  // pre(value, state, options) {
  //   if (this._flags.force) {
  //     debug('forceString', value)
  //   }
  //   return value
  // },
  rules: [{
    name: 'force',
    setup(params) {
      this._flags.force = true
    },
    validate(params, value, state, options) {
      if (Number.isNaN(value)) {
        return this.createError('number.force shouldn\'t be NaN', { v: value }, state, options)
      }
      return value
    },
  }],
})

myJoi.objectId = () => myJoi.object().objectId()
const _string = myJoi.string
myJoi.string = (...args) => _string(...args).empty('')
myJoi.json = () => myJoi.object().json()

export default myJoi
