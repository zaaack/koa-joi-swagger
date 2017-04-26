'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('./joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// using bundled joi for default, but you can set your own joi / extend bundled joi
exports.default = { Joi: _joi2.default };