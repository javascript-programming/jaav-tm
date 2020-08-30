const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');
const ContractHandler = require('../handlers/contract');
const state = require('./state');

// https://cloud.mongodb.com/freemonitoring/cluster/S4CO3VG5OV6MG64NCWT5L4ZKZDJ3LNLF


class StateManager {

    constructor (mongo) {
        this.mongo = mongo;
        this.state = new State(mongo);
    }

    beginTransaction () {
        this.mongo.beginTransaction();
    }

    abortTransaction () {
        this.mongo.abortTransaction();
    }

    endTransaction () {
        this.mongo.endTransaction();
    }

    set chainInfo (value) {
        this._chainInfo = value;
    }

    get chainInfo () {
        return this._chainInfo;
    }

    get hash () {
        return TU.sha256(stringify(this.mongo.getHash()));
    }

    getPathData (path) {

        const collection = path[0];
        const id = path[1];

        if (!collection && !id) {
            throw new Error(`Collection ${path.join('/')} and id not set`);
        }

        let result = {};
        result[collection] = {};
        result[collection][id] = this.state.getRecord(id, collection);

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

            const params = TU.parseJson(Buffer.from(request.data));

            this.beginTransaction();
            if (params.fn) {
                result.value = ContractHandler.query_contract(this.state, params.account, this.getPathData(path), params.fn, params.params);
            } else {
                result.value = this.getPathData(path);
            }
            this.endTransaction();

            result.value = Buffer.from(stringify(result.value || {}));

            result.proof = TU.sha256(result.value);
            result.code = 0;
        } catch (err) {
            this.abortTransaction();
            result.log = err.message;
        }

        return result;
    }

}

module.exports = StateManager;
