const Client = require('./client');

class RPCServer {

    constructor (openPort = 3000, tendermintPort = 46657) {
        this.client = new Client(tendermintPort);
    }

    set console (console) {
        this.client.console = console;
    }


}

module.exports = RPCServer;
