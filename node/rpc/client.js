const WebSocket = require('ws');
const stringify = require('json-stable-stringify');
const uuidv1 = require('uuid/v1');
const TU = require('../common/transactionutils');

class RPCClient {

    constructor (rpcPort = 46657) {
        this.wsRpcUrl = 'ws://localhost:' + rpcPort + '/websocket';
        this.transactions = {};
        this.subscriptions = {};
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

    subscribe (contract, handler, clientSocket) {
        return new Promise((resolve, reject) => {

            const id = uuidv1();

            const subscribeFn = (ws) => {
                let call = {
                    "jsonrpc": "2.0",
                    "method" : "subscribe",
                    "id"     : id,
                    "params" : {
                        "query": "tm.event = 'Tx' AND jv.contract = '" + contract + "'"
                    }
                };
                ws.send(stringify(call));
            };

            this.subscriptions[id] = { resolve, handler, subscribeFn, client : clientSocket };
            subscribeFn(this.ws);

            clientSocket.on('close', () => {
                delete this.subscriptions[id];
                //todo and unsubscribe from tendermint
            });
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

        const transaction = this.transactions[data.id];

        if (transaction) {

            if (data.result && (data.result.code === 0 || (data.result.response && !data.result.response.code))) {
                transaction.resolve(data);
            } else {
                transaction.reject(data);
            }

           delete this.transactions[data.id];
        }

        const subscription = this.subscriptions[data.id.replace('#event', '')];

        if (subscription) {
            if (subscription.resolve) {
                subscription.resolve(data);
                //todo handle reject
                delete subscription.resolve;
            } else {
                subscription.handler(data, subscription.client);
            }
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
        Object.keys(this.subscriptions).forEach(key => {
            this.subscriptions[key].subscribeFn(this.ws);
        }, this);

        cb();
    }
}

module.exports = RPCClient;
