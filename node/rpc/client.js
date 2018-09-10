const WebSocket = require('ws');
let stringify = require('json-stable-stringify');

class RPCClient {

    constructor (rpcPort = 46657) {

        this.wsRpcUrl = 'ws://localhost:' + rpcPort + '/websocket';

        this.ws = new WebSocket(this.wsRpcUrl);

        this.ws.on('open', this.setReady.bind(this));
        this.ws.on('message',this.onMessage.bind(this));

        this.transactions = {};
    }

    set console (console) {

        const me = this;

        console.setFunction('send', {
            params : ['value'],
            handler : (value) => {
                me.sendTx(value);
            }
        });
    }

    sendTx (value) {

        if (!value)
            return;

        let tx = stringify({
            account : 'terence',
            to : 'balabla',
            value : value,
            arr : [1, 2, 3, 'a'],
            bool : true
        });


        let call = {
            "method"    : "broadcast_tx_sync",
            "jsonrpc"   : "2.0",
            "params"    : [ Buffer.from(tx).toString('base64')],
            "id"        : "test"
        };

        this.transactions[call.id] = tx;
        this.ws.send(stringify(call));
    }

    onMessage (data) {
        console.log(data);
    }

    setReady () {
        console.log('Websocket connection to tendermint rpc established');
        this.ready = true;
    }

}

module.exports = RPCClient;
