'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let validateFields = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* (obj, schema, opts) {
    const promises = [];
    (0, _utils.debug)('schema', schema);
    const pValidate = (0, _pify2.default)(_globals2.default.Joi.validate);
    for (let key in schema) {
      if (!schema[key].isJoi) {
        (0, _utils.debug)('skip', key, schema);
        continue;
      }
      promises.push(pValidate(obj[key], schema[key], opts.joiOpts).then(function (ret) {
        (0, _utils.debug)('set ctx', key, ret, obj[key], schema[key].describe());
        obj[key] = ret;
      }).catch(function (err) {
        (0, _utils.debug)('set ctx catch', err, key, obj[key], schema[key].describe());
        const error = new Error();
        (0, _assign2.default)(error, {
          details: err.details,
          _object: err._object
        });
        error.message = `${opts.errorType}.${key}:${err.message}`;
        // error.stack = err.stack
        error.data = err._object;
        error.type = error.name = errorNameMap[opts.errorType];
        throw error;
      }));
    }
    yield _promise2.default.all(promises);
  });

  return function validateFields(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();
/**
 * [joiValidate description]
 * @param  {[type]} schema e.g.
 * {
 *   req: {
 *     query: <joiSchema>,
 *     headers: <joiSchema>,
 *     params: <joiSchema>,
 *   },
 *   res: {
 *    '200': <joiSchema>,
 *    'default': <joiSchema>
 *    // or
 *    // 'default': {
 *    //    schema: <joiSchema>
 *    // }
 *   },
 * }
 * @return {[type]}        [description]
 */


exports.joiValidate = joiValidate;
exports.default = mixedValidate;

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const errorNameMap = {
  request: 'RequestValidationError',
  response: 'ResponseValidationError'
};

function joiValidate(schema) {
  const {
    getReqSchema = sm => sm.req,
    getResSchema = (sm, ctx) => {
      (0, _utils.debug)('ctx.status', ctx.status);
      const resObj = sm.res[ctx.status + ''] || sm.res.default;
      const resSchema = resObj.schema || resObj;
      return { body: resSchema };
    }
  } = schema;
  return (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (ctx, next) {
      yield validateFields(ctx.request, getReqSchema(schema, ctx), {
        joiOpts: schema.reqOpts,
        errorType: 'request'
      });
      (0, _utils.debug)('validateRequest');
      yield next();
      yield validateFields(ctx.response, getResSchema(schema, ctx), {
        joiOpts: schema.resOpts,
        errorType: 'response'
      });
      (0, _utils.debug)('validateResponse');
    });

    return function (_x4, _x5) {
      return _ref2.apply(this, arguments);
    };
  })();
}

const defaultReqJoiOpts = {
  stripUnknown: false,
  convert: true
};

const defaultResJoiOpts = {
  stripUnknown: true,
  convert: true
};

function mixedValidate(document, opts = {}) {
  opts = (0, _extends3.default)({
    reqOpts: defaultReqJoiOpts,
    resOpts: defaultResJoiOpts,
    onError: null
  }, opts);
  const schemaInfos = (0, _keys2.default)(document.paths).map(p => {
    const keys = [];
    return {
      path: p,
      keys,
      pathRe: (0, _pathToRegexp2.default)(p.replace(/{(\w+)}/g, ':$1'), keys),
      fullPath: document.basePath + p,
      schema: document.paths[p]
    };
  });
  function matchPath(si, ctx) {
    const path = ctx.path.replace(new RegExp(`^${document.basePath}`), '');
    const match = path.match(si.pathRe);
    return match && ctx.method.toLowerCase() in si.schema && si.keys.reduce((params, key, i) => {
      params[key.name] = match[i + 1];
      return params;
    }, {});
  }
  const cache = {};
  return (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (ctx, next) {
      let pathParams;
      let schemaInfo = schemaInfos.find(function (si) {
        return pathParams = pathParams || matchPath(si, ctx);
      });
      ctx.request.pathParams = pathParams;
      if (!schemaInfo) return next();
      const method = ctx.method.toLowerCase();
      const key = method + schemaInfo.path;
      let validate = cache[key];
      if (!validate) {
        (0, _utils.debug)('schemaInfo', method, schemaInfo.schema);
        const schema = schemaInfo.schema[method];
        const joiValidateSchema = (0, _extends3.default)({
          req: schema.parameters,
          res: schema.responses
        }, opts);
        validate = cache[key] = joiValidate(joiValidateSchema);
      }
      try {
        yield validate(ctx, next);
        (0, _utils.debug)('ctx', ctx);
      } catch (e) {
        opts.onError && opts.onError(e);
        (0, _utils.debug)('body', typeof ctx.body);
        throw e;
      }
    });

    return function (_x6, _x7) {
      return _ref3.apply(this, arguments);
    };
  })();
}