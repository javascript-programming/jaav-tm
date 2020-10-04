const WS = require('ws');
const TU = require('../common/transactionutils');

class WebSocket {

    constructor (http, https, middleware) {
        this.http = http;
        this.https = https;
        this.middleware = middleware;
    }

    openSocket (client) {
        this.client = client;
        this.addListeners(new WS.Server({ server : this.http }), client);
        this.addListeners(new WS.Server({ server : this.https }), client);
    }

    addListeners (wss, client) {

        const me = this;

        wss.on('connection', (ws) => {

            console.log('ws connection');

            ws.on('message', async (data) => {
                const request = JSON.parse(data);

                const additionalParams = [];

                if (request.cmd === 'subscribe') {
                    additionalParams.push(this.subscriptionHandler.bind(me), ws);
                }

                this.middleware[request.cmd].handler(...request.params, ...additionalParams).then(result => {
                    ws.send(JSON.stringify({
                        success : true,
                        id      : request.id,
                        result  : result.result || result
                    }))
                }).catch(err => {
                    ws.send(JSON.stringify({
                        success : false,
                        id      : request.id,
                        message : err.message || err
                    }));
                });
            });

            ws.on('close', () => {
                console.log('ws disconnected');
            });
        });
    }

    subscriptionHandler (message, ws) {

        const response = {
            success : false
        };

        try {

            const txResult = message.result.data.value.TxResult;
            const contractResult = TU.parsePayload(txResult.result.data);
            const transaction = TU.parsePayload(txResult.tx);

            const data = TU.convertObjectToHex({
                caller  : transaction.account,
                fn      : transaction.params.fn,
                params  : transaction.params.params,
                height  : txResult.height,
                result  : contractResult,
                address : transaction.to
            });

            response.success = true;
            response.id = transaction.to;
            response.result = {
                data: data
            };

            ws.send(TU.stringify(response));

        } catch (err) {
            response.message = err.message || err;
            ws.send(TU.stringify(response));
        }
    }
}

module.exports = WebSocket;
