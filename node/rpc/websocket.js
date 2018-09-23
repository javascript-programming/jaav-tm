const WS = require('ws');

class WebSocket {

    constructor (server, middleware) {
        this.server = server;
        this.middleware = middleware;
    }

    openSocket (client) {
        this.client = client;
        this.addListeners(new WS.Server({ server : this.server }), client);
    }

    addListeners (wss, client) {

        const me = this;

        wss.on('connection', (ws) => {

            console.log('ws connection');

            ws.on('message', async (data) => {
                const request = JSON.parse(data);

                let handler, client = null;

                if (request.cmd === 'subscribe') {
                    handler = this.handler.bind(me);
                    client = ws;
                }

                this.middleware[request.cmd].handler(...request.params, handler, client).then(result => {
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

    handler (message, ws) {

    }
}

module.exports = WebSocket;
