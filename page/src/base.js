class ClientBase {

    constructor (host) {
        this.host = host;
        this.nonce = 0;
        this.ready = false;
        this.requests = {};
    }

    fromHex (hex) {
        return hex.toString().match(/.{1,2}/g).map(function(v){
            return String.fromCharCode(parseInt(v, 16));
        }).join('');
    }

    connect () {

        return new Promise ((resolve, reject) => {
            this.ws = new WebSocket(this.host);
            const ws = this.ws;

            ws.onopen = () => {
                this.ready = true;
                resolve();
            };

            ws.onmessage = (message) => {
                const response = JSON.parse(message.data);
                const request = this.requests[response.id];

                if (request) {
                    if (response.success) {

                        if (response.result.data) {
                            response.result.data = JSON.parse(this.fromHex(response.result.data));
                        }

                        request.resolve(response.result);

                    } else {
                        request.reject(response.error);
                    }
                }

                delete this.requests[response.id];
            };
        });
    }

    makeRequest (cmd, ...params) {

        return new Promise ((resolve, reject) => {
            const id = this.nonce++;
            const request = {
                cmd : cmd,
                id  : id,
                params : params
            };

            this.requests[id] = {
                resolve : resolve,
                reject  : reject
            };

            this.ws.send(JSON.stringify(request));
        });
    }
}

export { ClientBase };
