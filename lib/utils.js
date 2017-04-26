'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.toSwaggerParams = toSwaggerParams;
exports.toSwaggerDoc = toSwaggerDoc;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _joiToJsonSchema = require('joi-to-json-schema');

var _joiToJsonSchema2 = _interopRequireDefault(_joiToJsonSchema);

var _cloneDeepWith = require('lodash/cloneDeepWith');

var _cloneDeepWith2 = _interopRequireDefault(_cloneDeepWith);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = exports.debug = (0, _debug2.default)('joi-swagger');

const ctx2paramMap = {
  'pathParams': 'path',
  'query': 'query',
  'headers': 'header',
  'body': 'formData'
};

const joiKey = 'jsonSchema';

function toSwaggerParams(joiMap) {
  let params = [];
  (0, _keys2.default)(joiMap).forEach(key => {
    const fullJsonSchema = (0, _joiToJsonSchema2.default)(joiMap[key]);
    for (let name in fullJsonSchema.properties) {
      const jsonSchema = fullJsonSchema.properties[name];
      const paramType = ctx2paramMap[key];
      const param = {
        name,
        allowEmptyValue: true,
        in: paramType,
        required: fullJsonSchema.required && fullJsonSchema.required.indexOf(name) >= 0
      };
      if (paramType === 'body') {
        param.schema = jsonSchema;
      } else {
        (0, _assign2.default)(param, jsonSchema);
      }
      params.push(param);
    }
  });
  params[joiKey] = joiMap;
  return params;
}

function toSwaggerDoc(mixedSchema) {
  const swaggerDoc = (0, _cloneDeepWith2.default)(mixedSchema, value => {
    if (typeof value === 'object' && value.isJoi === true) {
      return value.clone();
    }
  });
  for (let path in swaggerDoc.paths) {
    const pathInfo = swaggerDoc.paths[path];
    for (let method in pathInfo) {
      const methodInfo = pathInfo[method];
      methodInfo.parameters = toSwaggerParams(methodInfo.parameters);
      for (let status in methodInfo.responses) {
        const resInfo = methodInfo.responses[status];
        if (resInfo.schema && resInfo.schema.isJoi) {
          resInfo.schema = (0, _joiToJsonSchema2.default)(resInfo.schema);
        }
      }
    }
  }
  return swaggerDoc;
}