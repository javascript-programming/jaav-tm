/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client.js":
/*!***********************!*\
  !*** ./src/client.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class WebClient {\n\n    constructor (host) {\n        this.host = host;\n        this.nonce = 0;\n        this.ready = false;\n        this.requests = {};\n    }\n\n    fromHex (hex) {\n        return hex.toString().match(/.{1,2}/g).map(function(v){\n            return String.fromCharCode(parseInt(v, 16));\n        }).join('');\n    }\n\n    connect () {\n\n        return new Promise ((resolve, reject) => {\n            this.ws = new WebSocket(this.host);\n            const ws = this.ws;\n\n            ws.onopen = () => {\n                this.ready = true;\n                resolve();\n            };\n\n            ws.onmessage = (message) => {\n                const response = JSON.parse(message.data);\n                const request = this.requests[response.id];\n\n                if (request) {\n                    if (response.success) {\n\n                        if (response.result.data) {\n                            response.result.data = JSON.parse(this.fromHex(response.result.data));\n                        }\n\n                        request.resolve(response.result);\n\n                    } else {\n                        request.reject(response.error);\n                    }\n                }\n\n                delete this.requests[response.id];\n            };\n        });\n    }\n\n    makeRequest (cmd, ...params) {\n\n        return new Promise ((resolve, reject) => {\n            const id = this.nonce++;\n            const request = {\n                cmd : cmd,\n                id  : id,\n                params : params\n            };\n\n            this.requests[id] = {\n                resolve : resolve,\n                reject  : reject\n            };\n\n            this.ws.send(JSON.stringify(request));\n        });\n    }\n\n    getAccounts () {\n        return this.makeRequest('accounts');\n    }\n\n    getBalance (account) {\n        return this.makeRequest('getBalance', account);\n    }\n\n    async createAccount (password) {\n        const result = await this.makeRequest('createAccount', password);\n        return result.data;\n    }\n\n    async transfer (account, to, amount, message, password) {\n        const result = await this.makeRequest('transfer', account, to, amount, message, password);\n        return result.data;\n    }\n\n    changePassword (account, oldPassword, newPassword) {\n        return this.makeRequest('changePassword', account, oldPassword, newPassword);\n    }\n}\n\n!window.devmode && (module.exports = WebClient);\n\n\n//# sourceURL=webpack:///./src/client.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.WebClient = __webpack_require__(/*! ./client */ \"./src/client.js\");\n\n\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });