const WS = require('ws');

class WebSocket {

    constructor (server, middleware) {
        this.server = server;
        this.middleware = middleware;
    }

    openSocket (client) {
        this.addListeners(new WS.Server({ server : this.server }), client);
    }

    addListeners (wss, client) {

        wss.on('connection', (ws) => {

            console.log('ws connection');

            ws.on('message', async (data) => {
                const request = JSON.parse(data);

                this.middleware[request.cmd].handler(...request.params).then(result => {
                    ws.send(JSON.stringify({
                        success : true,
                        id      : request.id,
                        result  : result
                    })).catch(err => {
                        ws.send(JSON.stringify({
                            success : false,
                            id      : request.id,
                            error   : err
                        }));
                    });
                });

            });

            ws.on('close', () => {
                console.log('ws disconnected');
            });
        });
    }
}

module.exports = WebSocket;
