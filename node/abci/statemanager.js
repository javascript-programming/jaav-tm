const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');

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

    query (request) {

        const path = request.path || '';
        const prove = request.prove;
        const params = TU.parsePayload(request.data);

        let result = {
            height : this.chainInfo.height - 1,
            proof : '',
            key   : '',
            index : 0,
            code  : 1,
            log   : 'Query failed'
        };

        switch (path) {
            case 'account':

                const account = this.state.accounts[params.account];

                if (account) {
                    result.value = Buffer.from(stringify(account));
                    result.code = 0;
                } else {
                    result.log = 'Account not found';
                }

                break;

            case 'state':
                result.value = Buffer.from(stringify(this.state));
                result.code = 0;
                break;
        }

        result.code === 0 && (result.log = '');
        return result;
    }

}

module.exports = StateManager;
