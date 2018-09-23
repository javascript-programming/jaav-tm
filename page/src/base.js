class ClientBase {

    constructor (host) {
        this.host = host;
        this.nonce = 0;
        this.ready = false;
        this.requests = {};
        this.contracts = {};
    }

    fromHex (hex) {
        return hex.toString().match(/.{1,2}/g).map(function(v){
            return String.fromCharCode(parseInt(v, 16));
        }).join('');
    }

    onClose () {
        console.log("WebSocket is closed. Reconnecting");
        this.connect().then(() => {
            Object.keys(this.contracts).forEach((key) => {
                this.registerContract(this.contracts[key]);
            }, this)
        });
    }

    registerContract (contract) {

        return new Promise ((resolve, reject) => {
            this.contracts[contract._address] && (this.contracts[contract._address] = contract);
            this.makeRequest('subscribe', contract._address).then(response => {
                resolve(contract);
            });
        });
    }

    unregisterContract (contract) {

        const me = this;
        delete this.contracts[contract._address];
        //todo make unsubscribe call
        // this.makeRequest('unsubscribe', contract._address).then(response => {
        //     delete this.contracts[contract._address];
        //     resolve(contract);
        // });
    }

    connect () {

        const me = this;

        return new Promise ((resolve, reject) => {
            me.ws = new WebSocket(this.host);
            const ws = me.ws;

            ws.onopen = () => {
                me.ready = true;
                resolve();
            };

            ws.onclose = me.onClose.bind(me);

            ws.onmessage = (message) => {
                const response = JSON.parse(message.data);
                const request = me.requests[response.id];

                if (request) {
                    if (response.success) {

                        if (response.result.data) {
                            response.result.data = JSON.parse(me.fromHex(response.result.data));
                        }

                        request.resolve(response.result);

                    } else {
                        request.reject(response);
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
