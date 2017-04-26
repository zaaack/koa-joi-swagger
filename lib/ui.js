'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (document, {
  pathRoot = '/swagger',
  skipPaths = [],
  UIHtml = _uiHtml2.default,
  swaggerConfig = '',
  sendConfig = { maxage: 3600 * 1000 * 24 * 30 }
} = {}) {
  const pathPrefix = pathRoot.endsWith('/') ? pathRoot : pathRoot + '/';
  const html = UIHtml(document, pathPrefix, swaggerConfig);

  return (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (context, next) {
      if (context.path.startsWith(pathRoot)) {
        const skipPath = skipPaths.some(function (path) {
          return context.path.startsWith(path);
        });
        if (context.path === pathRoot && context.method === 'GET') {
          context.type = 'text/html charset=utf-8';
          context.body = html;
          context.status = 200;
          return;
        } else if (context.path === pathPrefix + 'api-docs' && context.method === 'GET') {
          context.type = 'application/json charset=utf-8';
          context.body = document;
          context.status = 200;
          return;
        } else if (!skipPath && context.method === 'GET') {
          const filePath = context.path.substring(pathRoot.length);
          yield (0, _koaSend2.default)(context, filePath, (0, _extends3.default)({ root: _index2.default.dist }, sendConfig));
          return;
        }
      }
      return next();
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })();
};

var _koaSend = require('koa-send');

var _koaSend2 = _interopRequireDefault(_koaSend);

var _index = require('swagger-ui/index');

var _index2 = _interopRequireDefault(_index);

var _uiHtml = require('./ui-html');

var _uiHtml2 = _interopRequireDefault(_uiHtml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }