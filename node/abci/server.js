const server = require('abci');

class ABCIServer {

    constructor () {

        const me = this;

        this.state = {
            count : 0
        };

        let handlers = Object.assign.call({},
            this.getBlockHandlers(),
            this.getCheckTxHandler(),
            this.getDeliveryTxHandler(),
            this.getCommitHandler());

        this.server = server(handlers);
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
        return {
            info (request) {
                return {
                    data: 'Node.js counter app',
                    version: '0.0.0',
                    lastBlockHeight: 0,
                    lastBlockAppHash: Buffer.alloc(0)
                }
            },

            // beginBlock (request) {
            //     //store block height and hash to return in info
            //     debugger
            // },
            //
            // endBlock (request) {
            //     debugger
            // }
        }
    }



    getCheckTxHandler () {

        const fn = (request) => {

            let transaction = this.getTransaction(request);

            if (false) {
                return {code: 1, log: 'tx does not match count'}
            }


            return { code: 0, log: 'tx succeeded'}
        };

        return {
            checkTx : fn.bind(this)
        }
    }

    getDeliveryTxHandler () {

        const fn = (request) => {

            let transaction = this.getTransaction(request);

            if (false) {
                return {code: 1, log: 'tx does not match count'}
            }

            // update state
            this.state.count += 1;

            return { code: 0, log: 'tx succeeded'}
        };

        return {
            deliverTx: fn.bind(this)
        }
    }

    getCommitHandler () {
        return {
            // commit (request) {
            //     debugger
            //     //return root merkle hash
            // }
        }
    }

    start (port = 46658) {
        this.server.listen(port);
    }
}

module.exports = ABCIServer;
