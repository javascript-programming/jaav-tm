const server = require('abci');
const TU = require('../common/transactionutils');

class ABCIServer {

    constructor () {

        this.state = {
            accounts : {}
        };

        this.handlers = {};

        let coreHandlers = Object.assign.call({},
            this.getBlockHandlers(),
            this.getCheckTxHandler(),
            this.getDeliveryTxHandler());

        this.server = server(coreHandlers);
    }

    use (handler) {
        this.handlers[handler.getNameSpace()] = handler;
    }

    getTransaction (request) {

        let message = Buffer.from(request.tx, 'base64').toString();

        try {
            return JSON.parse(message);
        } catch (err) {
            return message;
        }
    }

    getBlockHandlers () {

        const fn = (request) => {
            return {
                data: 'Node.js counter app',
                version: '0.0.0',
                lastBlockHeight: 0,
                lastBlockAppHash: Buffer.alloc(0)
            }
        };

        return {
            info : fn.bind(this)
        }
    }


    getCheckTxHandler () {

        const fn = (request) => {

            try {

                let transaction = this.getTransaction(request);

                if (!TU.verifyTx(transaction))
                    throw new Error('Signature not valid');

                return { code: 0, log: 'tx succeeded'}

            } catch (err) {
                return { code: 1, log: err.message }
            }

        };

        return {
            checkTx : fn.bind(this)
        }
    }

    getDeliveryTxHandler () {

        const fn = (request) => {

            try {
                let transaction = this.getTransaction(request);

                if (!TU.verifyTx(transaction))
                    throw new Error('Signature not valid');

                const handler = this.getHandler(tx);
                return { code: 0, log: handler(this.state, transaction) || 'tx succeeded'}

            } catch (err) {
                return { code: 1, log: err.message }
            }
        };

        return {
            deliverTx: fn.bind(this)
        }
    }

    getHandler(tx) {
       try {
            const target = tx.cmd.split('.');
            const handler = this.handlers[target[0]];
            return [target[1]].bind(handler);
       } catch (err) {
           throw new Error('Handler not found');
       }
    }

    start (port = 46658) {
        this.server.listen(port);
    }
}

module.exports = ABCIServer;
