const server = require('abci');
const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');

class ABCIServer {

    constructor () {

        this.state = {
            accounts : {}
        };

        this.chainInfo = {};

        this.handlers = {};

        let coreHandlers = Object.assign.call({},
            this.getInitChainHandler(),
            this.getInfoHandler(),
            this.getBeginBlockHandler(),
            this.getEndBlockHandler(),
            this.getCheckTxHandler(),
            this.getDeliveryTxHandler(),
            this.getCommitHandler());

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

    getInfoHandler () {

        const fn = (request) => {
            return {
                data: 'Jaav contract platform',
                version: '1.0.0',
                lastBlockHeight: 0,
                lastBlockAppHash: TU.sha256(stringify(this.state))
            }
        };

        return {
            info : fn.bind(this)
        }
    }

    getBeginBlockHandler () {
        const fn = (request) => {
            return {
                tags : []
            }
        };

        return {
            beginBlock : fn.bind(this)
        }
    }

    getEndBlockHandler () {
        const fn = (request) => {
            this.chainInfo.height = request.height.toNumber();
            return {
                tags : []
            }
        };

        return {
            endBlock : fn.bind(this)
        }
    }

    getInitChainHandler () {
        const fn = ({ validators }) => {
            this.chainInfo.validators = validators;
            return {};
        };

        return {
            initChain : fn.bind(this)
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

                const handler = this.getHandler(transaction);
                return { code: 0, log: handler(this.state, transaction, this.chainInfo) || 'tx succeeded'}

            } catch (err) {
                return { code: 1, log: err.message }
            }
        };

        return {
            deliverTx: fn.bind(this)
        }
    }

    getCommitHandler () {
        const fn = (request) => {
            return {
                data : TU.sha256(stringify(this.state))
            }
        };

        return {
            commit : fn.bind(this)
        }
    }

    getHandler(tx) {
       try {
            const target = tx.cmd.split('.');
            const handler = this.handlers[target[0]];
            return handler[target[1]].bind(handler);
       } catch (err) {
           throw new Error('Handler not found');
       }
    }

    start (port = 46658) {
        this.server.listen(port);
    }
}

module.exports = ABCIServer;
