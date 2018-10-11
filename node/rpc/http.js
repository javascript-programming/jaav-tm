const http = require('http');
const WebSocket = require('./websocket');
const serveStatic = require('serve-static');
const path = require('path');

class HttpServer {

    constructor (app, middleware) {

        this.middleware = middleware;

        app.get('/accounts', this.getAccounts.bind(this));
        app.get('/accounts/:account/balance', this.getAccountBalance.bind(this));
        app.post('/accounts/create', this.createAccount.bind(this));
        app.post('/accounts/:account/transfer/:to', this.transfer.bind(this));

        app.get('/contracts', this.getContracts.bind(this));
        app.post('/contracts/:account/deploy/:name', this.deployContract.bind(this));
        app.get('/contracts/:address/abi', this.getAbi.bind(this));
        app.get('/contracts/:address/code', this.getCode.bind(this));
        app.post('/contracts/:address/:account/:method/call', this.callContract.bind(this));
        app.post('/contracts/:address/:account/:method/get', this.queryContract.bind(this));

        app.get('/contracts/:address/state', this.getContractState.bind(this));

        app.use('/page', serveStatic(path.join(__dirname, '../../page')));
        app.use('/examples', serveStatic(path.join(__dirname, '../../examples')));

        this.http = http.createServer(app);
    }

    getServer () {
        return this.http;
    }

    startServer (rpcPort, client) {

        this.webSocket = new WebSocket(this.http, this.middleware);

        this.http.listen(rpcPort, () => {
            console.log('Rpc server is listening on port ' + rpcPort);
        });

        this.webSocket.openSocket(client);
    }

    async getAccounts (req, res) {
        const fn = this.middleware['accounts'];
        res.send( {
            success : true,
            accounts : await fn.handler()
        });
    }

    async getAccountBalance(req, res) {
        const balance = await this.middleware['getBalance'].handler(req.params.account);
        res.send({ success : true, balance });
    }

    async createAccount (req, res) {

        try {
            const keys = await this.middleware['createAccount'].handler(req.body.password);
            res.send({ success : true, keys });
        } catch (err) {
            res.send({ success : false, err });
        }

        res.send({ success : true, keys });
    }

    async transfer (req, res) {
        const account   = req.params.account;
        const to        = req.params.to;
        const value     = req.body.amount || req.body.value;
        const password  = req.body.password;
        const message   = req.body.message;

        try {
            res.send({
                success :true,
                result: await this.middleware['transfer'].handler(account, to, value, message, password)
            });
        } catch (err) {
            res.send({
                success: false,
                message: err
            });
        }
    }

    async getContracts (req, res) {

        await this.middleware['compile'].handler();
        res.send({
            success     : true,
            contracts   : await this.middleware['contracts'].handler()
        });
    }

    async deployContract (req, res) {

        await this.middleware['compile'].handler();

        const account   = req.params.account;
        const name      = req.params.name;
        const password  = req.body.password;

        try {
            res.send({
                success : true,
                result  : await this.middleware['deploy'].handler(account, password, name)
            })
        } catch (err) {
            res.send({
                success : false,
                message : err
            });
        }
    }

    async getAbi (req, res) {

        let result = await this.middleware['abi'].handler(req.params.address);
        res.send({
            success : result ? true : false,
            result  : result || 'Not found'
        });
    }

    async getCode (req, res) {

        let result = await this.middleware['code'].handler(req.params.address);
        res.send({
            success : result ? true : false,
            result  : result || 'Not found'
        });
    }


    async callContract (req, res) {

        const account = req.params.account;
        const password = req.body.password;
        const address = req.params.address;
        const fn = req.params.method;
        const value = 0;
        const params = req.body.params;

        let result = await this.middleware['callContract'].handler(account, password, address, fn, value, params);

        try {
            res.send({
                success: true,
                result : result
            });
        } catch (err) {
            res.send({
                success: false,
                result : err
            });
        }
    }

    async queryContract (req, res) {

        const account = req.params.account;
        const address = req.params.address;
        const fn = req.params.method;
        const params = req.body.params;

        let result = await this.middleware['queryContract'].handler(account, address, fn, params);

        try {
            res.send({
                success: true,
                result : result
            });
        } catch (err) {
            res.send({
                success: false,
                result : err
            });
        }
    }

    async getContractState (req, res) {

        let result = await this.middleware['state'].handler(req.params.address);
        res.send({
            success : result ? true : false,
            result  : result || 'Not found'
        });
    }
}

module.exports = HttpServer;
