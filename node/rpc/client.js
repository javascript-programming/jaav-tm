const WebSocket = require('ws');
const stringify = require('json-stable-stringify');
const uuidv1 = require('uuid/v1');
const TU = require('../common/transactionutils');

class RPCClient {

    constructor (rpcPort = 46657) {

        this.wsRpcUrl = 'ws://localhost:' + rpcPort + '/websocket';

        this.transactions = {};
    }

    connect () {

        return new Promise( (resolve, reject) => {

            try {
                this.ws = new WebSocket(this.wsRpcUrl);

                this.ws.on('open', () => {
                    this.setReady.bind(this)(resolve);
                });
            } catch (err) {
                reject(err.message);
            }
        });

    }

    send (tx) {

        return new Promise((resolve, reject) => {

            const id = uuidv1();

            let call = {
                "method" : "broadcast_tx_sync",
                "jsonrpc": "2.0",
                "params" : [TU.convertObjectToBase64(tx)],
                "id"     : id
            };

            this.transactions[id] = { resolve, reject };
            this.ws.send(stringify(call));
        });
    }

    query (path, data) {

        return new Promise((resolve, reject) => {

            const id = uuidv1();

            let call = {
                "method"    : "abci_query",
                "jsonrpc"   : "2.0",
                "params"    : [path, TU.convertObjectToHex(data), "1", false ],
                "id"        : id
            };

            this.transactions[id] = {
                resolve : (data) => {
                    const result = TU.parsePayload(data.result.response.value);
                    resolve(result);
                },
                reject : (data) => {
                    reject(data.result.response.log);
                }
            };
            this.ws.send(stringify(call));
        });
    }

    onMessage (data) {
        data = JSON.parse(data);

        let transaction = this.transactions[data.id];

        if (transaction) {

            if (data.result.code === 0 || (data.result.response && !data.result.response.code)) {
                transaction.resolve(data);
            } else {
                transaction.reject(data);
            }

           delete this.transactions[data.id];
        }
    }

    onClose () {
        this.ready = false;
        console.log('Websocket connection to tendermint rpc closed');
        this.connect();
    }

    setReady (cb) {
        console.log('Websocket connection to tendermint rpc established');
        this.ready = true;
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('close', this.onClose.bind(this));
        cb();
    }
}

module.exports = RPCClient;
