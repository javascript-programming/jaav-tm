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

            if (!this.subscriptions[contract]) {

                const subscribeFn = (ws) => {
                    let call = {
                        "jsonrpc": "2.0",
                        "method" : "subscribe",
                        "id"     : contract,
                        "params" : {
                            "query": "tm.event = 'Tx' AND jv.contract = '" + contract + "'"
                        }
                    };
                    ws.send(stringify(call));
                };

                this.subscriptions[contract] = {
                    subscriber : { resolve, reject },
                    handler,
                    subscribeFn,
                    clients    : [ clientSocket ]
                };

                subscribeFn(this.ws);

            } else {
                this.subscriptions[contract].clients.push(clientSocket);
                resolve({
                    success : true
                });
            }

            clientSocket.on('close', () => {
                TU.removeItem(this.subscriptions[contract].clients, clientSocket);
                //todo and unsubscribe from tendermint
            });
        });
    }

    send (tx, commit) {

        return new Promise((resolve, reject) => {

            const id = uuidv1();

            let call = {
                "method" : commit ? "broadcast_tx_commit" : "broadcast_tx_sync",
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

            if (data.result.deliver_tx) {
                const code = data.result.check_tx.code || 0;

                if (code === 0) {
                    data.result = data.result.deliver_tx;
                    try {
                        data.result.data = TU.convertObjectToHex(TU.parsePayload(data.result.data));
                    } catch(err) {}
                } else {
                    data.result = data.result.check_tx;
                }
                data.result.code = code;
            }

            if (data.result && (data.result.code === 0 || (data.result.response && !data.result.response.code))) {
                transaction.resolve(data);
            } else {
                transaction.reject(data);
            }

           delete this.transactions[data.id];

        } else {

            const subscription = this.subscriptions[data.id.replace('#event', '')];

            if (subscription) {

                if (!data.error) {
                    if (subscription.subscriber) {
                        subscription.subscriber.resolve({ success : true });
                        delete subscription.subscriber;
                    } else {

                        for (let i = 0; i < subscription.clients.length; i++) {
                            subscription.handler(data, subscription.clients[i]);
                        }

                    }
                } else {
                    subscription.subscriber && subscription.subscriber.reject({ success : false, message : data.error.data });
                }
            }
        }
    }

    onClose () {
        this.ready = false;
        console.log('Websocket connection to tendermint rpc closed');
        this.connect().catch(err => console.log(err.message));
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
