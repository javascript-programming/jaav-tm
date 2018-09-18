class WebClient {

    constructor (host) {
        this.host = host;
        this.nonce = 0;
        this.ready = false;
        this.requests = {};
    }

    connect () {

        return new Promise ((resolve, reject) => {
            this.ws = new WebSocket(this.host);
            const ws = this.ws;

            ws.onopen = () => {
                this.ready = true;
                resolve();
            };

            ws.onmessage = (data) => {
                const result = JSON.parse(data.data);
                const request = this.requests[result.id];

                if (request) {
                    if (result.success) {
                        request.resolve(result.result);
                    } else {
                        request.reject(result.error);
                    }
                }

                delete this.requests[result.id];
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

const webclient = new WebClient('ws://localhost:3000');
webclient.connect().then(() => {
    webclient.makeRequest('getBalance', '8XhsMzWRxK9e7t4kH3vctgWov3jgYw2LC').then(result => {
        console.log(result);
    });
});
