const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');
const ContractHandler = require('../handlers/contract');
const State = require('./state');

// https://cloud.mongodb.com/freemonitoring/cluster/S4CO3VG5OV6MG64NCWT5L4ZKZDJ3LNLF


class StateManager {

    constructor (state, oracle) {
        this.stateDb = state;
        this.oracleDb = oracle;
    }

    get state () {
        return new State(this.stateDb, this.oracleDb);
    }

    connect () {
        return new Promise((resolve, reject) => {
            this.stateDb.connect().then(()=> {
                if (this.oracleDb) {
                    this.oracleDb.connect(false).then(()=>{
                        resolve();
                    }).catch(err => {
                        reject();
                    });
                } else {
                    resolve();
                }
            }).catch(err => {
                reject();
            });
        });
    }

    beginTransaction (state) {
        this.stateDb.beginTransaction(state);
    }

    abortTransaction (state) {
        return this.stateDb.abortTransaction(state);
    }

    endTransaction (state) {
        return this.stateDb.endTransaction(state);
    }

    set chainInfo (value) {
        this._chainInfo = value;
    }

    get chainInfo () {
        return this._chainInfo;
    }

    get hash () {
        return new Promise ((resolve, reject) => {
            this.stateDb.getHash().then(hash => {
                resolve(TU.sha256(stringify(hash)));
            }).catch(reject);
        });
    }

    getPathData (path, state) {
        return new Promise((resolve, reject) => {
            const collection = path[0];
            const id = path[1];

            if (!collection && !id) {
                reject(`Collection ${path.join('/')} and id not set`);
                return;
            }

            let result = {};
            result[collection] = {};
            state.getRecord(false,{_id: id }, collection).then(record => {
                result[collection][id] = record;
                for (let i = 0; i < path.length; i++) {
                    result = result[path[i]];
                    if (!result) {
                        reject(`Data path ${path.join('/')} not found`);
                        return;
                    }
                }
                resolve(result);
            }).catch(reject);
        });
    }

    query (request) {

        const path = (request.path || '').split('/');

        let result = {
            height : this.chainInfo.height - 1,
            key   : path.join('/'),
            index : 0,
            code  : 1
        };

        return new Promise(async (resolve, reject) => {
            const state = this.state;
            try {
                const params = TU.parseJson(Buffer.from(request.data));
                const data = await this.getPathData(path, state);
                if (params.fn) {
                    result.value = await ContractHandler.query_contract(state, params.account, data, params.fn, params.params);
                } else {
                    result.value = data;
                }
                result.value = Buffer.from(stringify(result.value || {}));
                result.proof = TU.sha256(result.value);
                result.code = 0;
                resolve(result);

            } catch (err) {
                //this.abortTransaction(state);
                result.log = err;
                resolve(result);
            }
        });
    }

}

module.exports = StateManager;
