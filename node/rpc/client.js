const WebSocket = require('ws');
const stringify = require('json-stable-stringify');
const uuidv1 = require('uuid/v1');
const TU = require('../common/transactionutils');

class RPCClient {

    constructor (rpcPort = 46657) {

        this.wsRpcUrl = 'ws://localhost:' + rpcPort + '/websocket';

        this.ws = new WebSocket(this.wsRpcUrl);

        this.ws.on('open', this.setReady.bind(this));
        this.ws.on('message',this.onMessage.bind(this));

        this.transactions = {};
    }

    send (tx) {

        return new Promise((resolve, reject) => {

            if (!TU.verifyTx(tx))
               reject('Transaction not signed properly');

            const id = uuidv1();

            let call = {
                "method"    : "broadcast_tx_sync",
                "jsonrpc"   : "2.0",
                "params"    : [ Buffer.from(tx).toString('base64')],
                "id"        : id
            };

            this.transactions[id] = tx;
            this.ws.send(stringify(call));
            resolve();
        });
    }

    onMessage (data) {
        console.log(data);
        debugger
    }

    setReady () {
        console.log('Websocket connection to tendermint rpc established');
        this.ready = true;
    }
}

module.exports = RPCClient;
