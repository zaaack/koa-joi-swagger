'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponseValidationError = exports.RequestValidationError = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// babel don't support extends built-in class
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
// http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
function ErrorWrapper(msg) {
  var rawErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (msg instanceof Error) {
    rawErr = msg;
    msg = null;
  }
  (0, _setPrototypeOf2.default)(this, this.constructor.prototype);
  this.name = this.constructor.name;
  this.message = (msg ? msg + ':' : '') + rawErr.message;
  this.stack = rawErr.stack;
  if (!this.stack) {
    Error.captureStackTrace(this, this.constructor);
  }
}

ErrorWrapper.prototype = (0, _create2.default)(Error.prototype);
ErrorWrapper.prototype.constructor = ErrorWrapper;

var RequestValidationError = exports.RequestValidationError = function (_ErrorWrapper) {
  (0, _inherits3.default)(RequestValidationError, _ErrorWrapper);

  function RequestValidationError() {
    (0, _classCallCheck3.default)(this, RequestValidationError);
    return (0, _possibleConstructorReturn3.default)(this, (RequestValidationError.__proto__ || (0, _getPrototypeOf2.default)(RequestValidationError)).apply(this, arguments));
  }

  return RequestValidationError;
}(ErrorWrapper);

var ResponseValidationError = exports.ResponseValidationError = function (_ErrorWrapper2) {
  (0, _inherits3.default)(ResponseValidationError, _ErrorWrapper2);

  function ResponseValidationError() {
    (0, _classCallCheck3.default)(this, ResponseValidationError);
    return (0, _possibleConstructorReturn3.default)(this, (ResponseValidationError.__proto__ || (0, _getPrototypeOf2.default)(ResponseValidationError)).apply(this, arguments));
  }

  return ResponseValidationError;
}(ErrorWrapper);