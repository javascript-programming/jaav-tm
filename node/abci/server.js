const server = require('abci');
const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');
const StateManager = require('./statemanager');

class ABCIServer {

    constructor (mongo) {

        this.stateManager = new StateManager(mongo);

        this.stateManager.chainInfo = {
            height : 0
        };

        this.handlers = {};

        let coreHandlers = Object.assign.call({},
            this.getInitChainHandler(),
            this.getQueryHander(),
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
        return TU.parsePayload(request.tx);
    }

    getQueryHander () {
        const query = (request) => {
            return this.stateManager.query(request);
        };

        return { query }
    }

    getInfoHandler () {

        const info = (request) => {

            const height = this.stateManager.chainInfo.height;

            return {
                data: 'Jaav contract platform',
                version: '1.0.0',
                lastBlockHeight:  height,
                //lastBlockAppHash: height === 0 ? Buffer.alloc(0): this.stateManager.hash
            }
        };

        return { info }
    }

    getBeginBlockHandler () {
        const beginBlock = (request) => {
            return {
                tags : []
            }
        };

        return { beginBlock }
    }

    getEndBlockHandler () {
        const endBlock = (request) => {
            this.stateManager.chainInfo.height = request.height.toNumber();
            return {
                tags : []
            }
        };

        return { endBlock }
    }

    getInitChainHandler () {
        const initChain = ({ validators }) => {
            this.stateManager.chainInfo.validators = validators;
            return {};
        };

        return { initChain }
    }


    getCheckTxHandler () {

        const checkTx = (request) => {
            return this.getDeliveryTxHandler().deliverTx(request, true);
        };

        return { checkTx }
    }

    getDeliveryTxHandler () {

        const deliverTx = (request, check) => {

            try {
                const transaction = this.getTransaction(request);

                if (!TU.verifyTx(transaction))
                    throw new Error('Signature not valid');

                let receipt = {};
                let tags = [];

                if (!check) {
                    this.stateManager.beginTransaction();
                    const state = this.stateManager.state;
                    const handler = this.getHandler(transaction);
                    handler(state, transaction, this.stateManager.chainInfo);
                    this.stateManager.endTransaction();
                    if (receipt.tags) {
                        tags = receipt.tags;
                    }
                }

                return {
                    code    : 0,
                    log     : receipt.log || 'tx succeeded',
                    tags    : tags,
                    data    : Buffer.from(stringify(receipt.result || {}))
                }


            } catch (err) {
                this.stateManager.abortTransaction();
                return { code: 1, log: err.message }
            }
        };

        return { deliverTx }
    }

    getCommitHandler () {
        const commit = (request) => {
            return {
                data : this.stateManager.hash
            }
        };

        return { commit }
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
