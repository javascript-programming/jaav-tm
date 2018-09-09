const server = require('abci');

class ABCIServer {

    constructor () {

        const me = this;

        this.state = {
            count : 0
        };

        let handlers = Object.assign.call({}, this.getBlockHandlers(), this.getCheckTxHandler(), this.getCommitHandler());
        this.server = server(handlers);
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
            }

            // beginBlock (request) {
            //     //store block height and hash to return in info
            // },
            //
            // endBlock (request) {
            //
            // }
        }
    }

    getCheckTxHandler () {
        return {
            checkTx (request) {

                // do basic validations on the request, do not modify state
                if (false) {
                    return { code: 1, log: 'tx does not match count' }
                }
                return { code: 0, log: 'tx succeeded' }
            }
        }
    }

    getDeliveryTxHandler () {

        let me = this;

        return {
            deliverTx(request) {
                if (false) {
                    return {code: 1, log: 'tx does not match count'}
                }

                // update state
                me.state.count += 1;

                return { code: 0, log: 'tx succeeded'}
            }
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
