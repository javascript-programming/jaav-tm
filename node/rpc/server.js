const Client = require('./client');

class RPCServer {

    constructor (openPort = 3000, tendermintPort = 46657) {
        this.client = new Client(tendermintPort);
    }

    getClient () {
        return this.client;
    }
}

module.exports = RPCServer;
