const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');
const ContractHandler = require('../handlers/contract');

class StateManager {

    constructor (initialState) {
        this._state = initialState;
    }

    set chainInfo (value) {
        this._chainInfo = value;
    }

    get chainInfo () {
        return this._chainInfo;
    }

    get hash () {
        return TU.sha256(stringify(this._state));
    }

    get state () {
        return this._state;
    }

    getPathData (path) {

        let result = this.state;

        for (let i = 0; i < path.length; i++) {
            result = result[path[i]];
            if (!result) {
                throw new Error(`Data path ${path.join('/')} not found`);
            }
        }

        return result;
    }

    query (request) {

        const path = (request.path || '').split('/');

        let result = {
            height : this.chainInfo.height - 1,
            key   : path.join('/'),
            index : 0,
            code  : 1
        };

        try {
            const data = this.getPathData(path);
            const params = TU.parseJson(Buffer.from(request.data));

            if (params.fn) {
                result.value = ContractHandler.query_contract(this.state, params.account, data, params.fn, params.params);
            } else {
                result.value = data;
            }

            result.value = Buffer.from(stringify(result.value));

            result.proof = TU.sha256(result.value);
            result.code = 0;
        } catch (err) {
            result.log = err.message;
        }

        return result;
    }

}

module.exports = StateManager;
