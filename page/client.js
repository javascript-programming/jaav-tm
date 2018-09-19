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

    getAccounts () {
        return webclient.makeRequest('accounts');
    }

    getBalance (account) {
        return webclient.makeRequest('getBalance', account);
    }

    createAccount (password) {
        return webclient.makeRequest('createAccount', password);
    }

    transfer (account, to, amount, message, password) {
        return webclient.makeRequest('transfer', account, to, amount, message, password);
    }

    changePassword (account, oldPassword, newPassword) {
        return webclient.makeRequest('changePassword', account, oldPassword, newPassword);
    }
}

const webclient = new WebClient('ws://localhost:3000');
webclient.connect().then(async () => {
    let accounts = await webclient.getAccounts();
    let balance = await webclient.getBalance(accounts[0]);
    console.log(accounts);
    console.log(balance);
    let newAccount = await webclient.createAccount('1234');
    console.log(newAccount);
    let transfer = await webclient.transfer(accounts[0], accounts[3], 1, 'Test', '1234').catch(err => {
        console.log(err) });
});
