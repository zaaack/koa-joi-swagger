'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let myJoi = _joi2.default.extend({
  base: _joi2.default.object(),
  name: 'object',
  language: {
    json: 'invalid json' // Used below as 'number.round'
  },
  coerce(value, state, options) {
    if (this._flags.json && value && typeof value.toJSON === 'function') {
      return value.toJSON();
    }
    return value;
  },
  pre(value, state, options) {
    return value;
  },
  rules: [{
    name: 'json',
    setup(params) {
      this._flags.json = true;
    }
  }]
});

myJoi = myJoi.extend({
  base: _joi2.default.string(),
  name: 'string',
  language: {
    force: 'force toString'
  },
  coerce(value, state, options) {
    if (this._flags.force) {
      if (value == null) {
        return '';
      }if (typeof value.toString === 'function') {
        return value.toString();
      }
    }
    return value;
  },
  pre(value, state, options) {
    return value;
  },
  rules: [{
    name: 'force',
    setup(params) {
      this._flags.force = true;
    },
    validate(params, value, state, options) {
      return value;
    }
  }]
});

myJoi = myJoi.extend({
  base: _joi2.default.number(),
  name: 'number',
  language: {
    force: 'force toNumber'
  },
  coerce(value, state, options) {
    if (this._flags.force && value && typeof value.toString === 'function') {
      return Number(value.toString());
    }
    return value;
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
      this._flags.force = true;
    },
    validate(params, value, state, options) {
      if ((0, _isNan2.default)(value)) {
        return this.createError('number.force shouldn\'t be NaN', { v: value }, state, options);
      }
      return value;
    }
  }]
});

myJoi.objectId = () => myJoi.object().objectId();
const _string = myJoi.string;
const _number = myJoi.number;
myJoi.string = (...args) => _string(...args).empty('');
myJoi.json = () => myJoi.object().json();

exports.default = myJoi;