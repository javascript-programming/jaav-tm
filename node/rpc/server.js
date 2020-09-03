const Client = require('./client');
const express = require('express');
const bodyParser = require('body-parser');
const HttpServer = require('./http');

class RPCServer {

    constructor (rpcPort = 80, rpcSecurePort = 443, tendermintPort = 46657) {
        this.client = new Client(tendermintPort);
        this.rpcPort = rpcPort;
        this.rpcSecurePort = rpcSecurePort;
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

        this.httpServer = new HttpServer(app, this.middleware);
        this.httpServer.startServer(this.rpcPort, this.rpcSecurePort, this.client);
    }
}

module.exports = RPCServer;
