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

/***/ "./src/base.js":
/*!*********************!*\
  !*** ./src/base.js ***!
  \*********************/
/*! exports provided: ClientBase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ClientBase\", function() { return ClientBase; });\nclass ClientBase {\n\n    constructor (host) {\n        this.host = host;\n        this.nonce = 0;\n        this.ready = false;\n        this.requests = {};\n        this.contracts = {};\n    }\n\n    fromHex (hex) {\n        return hex.toString().match(/.{1,2}/g).map(function(v){\n            return String.fromCharCode(parseInt(v, 16));\n        }).join('');\n    }\n\n    getListenerName (string) {\n        return 'on' + string.charAt(0).toUpperCase() + string.slice(1);\n    }\n\n    onClose () {\n        console.log(\"WebSocket is closed. Reconnecting\");\n        this.connect().then(() => {\n            Object.keys(this.contracts).forEach((key) => {\n                this.registerContract(this.contracts[key]);\n            }, this)\n        }).catch(err => {\n           console.log('Unable to reconnect, server not reachable');\n        });\n    }\n\n    registerContract (contract) {\n\n        return new Promise ((resolve, reject) => {\n            !this.contracts[contract._address] && (this.contracts[contract._address] = contract);\n            this.makeRequest('subscribe', contract._address).then(response => {\n                resolve(contract);\n            });\n        });\n    }\n\n    unregisterContract (contract) {\n\n        const me = this;\n        delete this.contracts[contract._address];\n        //todo make unsubscribe call\n        // this.makeRequest('unsubscribe', contract._address).then(response => {\n        //     delete this.contracts[contract._address];\n        //     resolve(contract);\n        // });\n    }\n\n    connect () {\n\n        const me = this;\n\n        return new Promise ((resolve, reject) => {\n\n            try {\n                me.ws = new WebSocket(this.host);\n            } catch (err)  {\n                reject(err);\n                return;\n            }\n\n            const ws = me.ws;\n\n            ws.onopen = () => {\n                me.ready = true;\n                resolve();\n            };\n\n            ws.onclose = me.onClose.bind(me);\n\n            ws.onmessage = (message) => {\n\n                const response = JSON.parse(message.data);\n                const request = me.requests[response.id];\n\n                if (response.success) {\n\n                    if (response.result.data) {\n                        response.result.data = JSON.parse(me.fromHex(response.result.data));\n                    }\n\n                    if (request) {\n\n                        request.resolve(response.result);\n                        delete this.requests[response.id];\n\n                    } else {\n                        const contract = me.contracts[response.id];\n\n                        if (contract) {\n                            me.handleSubscriptionCall(contract, response.result.data);\n                        }\n                    }\n                } else {\n                    request && request.reject(response);\n                }\n            };\n        });\n    }\n\n    handleSubscriptionCall (contract, data) {\n\n        const listenerName = this.getListenerName(data.fn);\n\n        if (contract[listenerName]) {\n            const self = contract._account === data.caller;\n            contract[listenerName](data.result, {\n                caller : data.caller,\n                self   : self,\n                params : data.params,\n                height : data.height\n            });\n        }\n    }\n\n    makeRequest (cmd, ...params) {\n\n        return new Promise ((resolve, reject) => {\n            const id = this.nonce++;\n            const request = {\n                cmd : cmd,\n                id  : id,\n                params : params\n            };\n\n            this.requests[id] = {\n                resolve : resolve,\n                reject  : reject\n            };\n\n            this.ws.send(JSON.stringify(request));\n        });\n    }\n}\n\n\n\n\n//# sourceURL=webpack:///./src/base.js?");

/***/ }),

/***/ "./src/client.js":
/*!***********************!*\
  !*** ./src/client.js ***!
  \***********************/
/*! exports provided: WebClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WebClient\", function() { return WebClient; });\n/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ \"./src/base.js\");\n/* harmony import */ var _contract_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contract.js */ \"./src/contract.js\");\n\n\n\nclass WebClient extends _base_js__WEBPACK_IMPORTED_MODULE_0__[\"ClientBase\"] {\n\n    constructor (host) {\n        super(host);\n    }\n\n    getAccounts () {\n        return this.makeRequest('accounts');\n    }\n\n    getBalance (account) {\n        return this.makeRequest('getBalance', account);\n    }\n\n    createAccount (password) {\n        const fn = async () => {\n            const result = await this.makeRequest('createAccount', password);\n            return result.data;\n        };\n        return fn();\n    }\n\n    createNamedAccount (password, name) {\n        const fn = async () => {\n            const result = await this.makeRequest('createAccount', password, name);\n            return result.data;\n        };\n        return fn();\n    }\n\n    getAccount (name, password) {\n        return this.makeRequest('getAccount', name, password);\n    }\n\n    unlockAccount (account, password) {\n        return this.makeRequest('unlockAccount', account, password);\n    }\n\n    transfer (account, to, amount, message, password) {\n        const fn = async () => {\n            const result = await this.makeRequest('transfer', account, to, amount, message, password);\n            return result.data;\n        };\n        return fn();\n    }\n\n    changePassword (account, oldPassword, newPassword) {\n        return this.makeRequest('changePassword', account, oldPassword, newPassword);\n    }\n\n    getContracts () {\n        return this.makeRequest('contracts');\n    }\n\n    compile () {\n        return this.makeRequest('compile');\n    }\n\n    upload (cls) {\n        return this.makeRequest('upload', cls.toString());\n    }\n\n    deploy (account, password, contract) {\n        const fn = async () => {\n            const result = await this.makeRequest('deploy', account, password, contract);\n            return result.data;\n        };\n        return fn();\n    }\n\n    getContract (address, account) {\n        const fn = async () => {\n            const abi = await this.makeRequest('abi', address);\n            return await this.registerContract(new _contract_js__WEBPACK_IMPORTED_MODULE_1__[\"ClientContract\"](this, address, abi, account));\n        };\n\n        return fn();\n    }\n}\n\n\n\n\n//# sourceURL=webpack:///./src/client.js?");

/***/ }),

/***/ "./src/contract.js":
/*!*************************!*\
  !*** ./src/contract.js ***!
  \*************************/
/*! exports provided: ClientContract */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ClientContract\", function() { return ClientContract; });\n\nclass ClientContract {\n\n    constructor (client, address, abi, account) {\n\n        this._client = client;\n        delete abi.constructor;\n        this._address = address;\n        this._account = account;\n\n        const generateFunction = (target, fn, params) => {\n            const body = {};\n            let method, initialParams = [account, address, fn].map(item => \"'\" + item + \"'\");\n            const isCall = !fn.startsWith('get');\n\n            if (!isCall) {\n                method = 'queryContract';\n            } else {\n                method = 'callContract';\n                initialParams.push(0);\n                initialParams.splice(1, 0, 'password');\n            }\n\n            eval(`body[fn] = function (${params.join(', ')} ${ isCall ? ', password' : '' }) {\n                return this._client.makeRequest('${method}', ${ initialParams.join(',') }, ${ params.join(',') });\n             }`);\n\n            Object.assign(target, body);\n        };\n\n        Object.keys(abi).forEach(function(key) {\n            generateFunction(this, key, abi[key]);\n        }, this);\n\n    }\n}\n\n\n\n\n//# sourceURL=webpack:///./src/contract.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _client_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./client.js */ \"./src/client.js\");\n\n\nwindow.WebClient = _client_js__WEBPACK_IMPORTED_MODULE_0__[\"WebClient\"];\n\n\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });