const Client = require('./client');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

class RPCServer {

    constructor (openPort = 3000, tendermintPort = 46657) {
        this.client = new Client(tendermintPort);
        this.rpcPort = openPort;
        this.limit = '50mb';
    }

    getClient () {
        return this.client;
    }

    startServer (middleware) {

        this.middleware = middleware;

        const app = express();
        app.use(bodyParser.json({ limit: this.limit } ));
        app.use(bodyParser.urlencoded({ extended: false, limit: this.limit }));

        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        app.get('/accounts', this.getAccounts.bind(this));
        app.get('/account/:account/balance', this.getAccountBalance.bind(this));

        app.post('/account/create', this.createAccount.bind(this));

        app.post('/account/:account/transfer/:to', this.transfer.bind(this));

        app.get('/contracts', this.getContracts.bind(this));
        app.post('/contract/:contract/:account/:method', this.handleContract.bind(this));

        this.http = http.createServer(app);
        this.http.listen(this.rpcPort, () => {
            console.log('Rpc server is listening on port ' + this.rpcPort);
        });
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

    handleAccount (req, res) {
        debugger
    }

    handleContract (req, res) {
        debugger
    }
}

module.exports = RPCServer;
