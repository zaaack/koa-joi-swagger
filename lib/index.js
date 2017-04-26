'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ui = exports.joiValidate = exports.mixedValidate = exports.toSwaggerDoc = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

var _utils = require('./utils');

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _assign2.default)(_globals2.default, {
  toSwaggerDoc: _utils.toSwaggerDoc,
  mixedValidate: _validate2.default,
  joiValidate: _validate.joiValidate,
  ui: _ui2.default
});

exports.default = _globals2.default;
exports.toSwaggerDoc = _utils.toSwaggerDoc;
exports.mixedValidate = _validate2.default;
exports.joiValidate = _validate.joiValidate;
exports.ui = _ui2.default;