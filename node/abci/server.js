const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const TU = require('../common/transactionutils');
const stringify = require('json-stable-stringify');
const StateManager = require('./statemanager');

class ABCIServer {

    constructor (mongo) {

        this.stateManager = new StateManager(mongo);

        this.PROTO_PATH = __dirname + '/proto/types.proto';

        const packageDefinition = protoLoader.loadSync(
            this.PROTO_PATH,
            {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [__dirname + '/proto']
            });

        this.abciProto = grpc.loadPackageDefinition(packageDefinition).types.ABCIApplication;

        this.stateManager.chainInfo = {
            height : 0
        };

        this.handlers = {};

        this.handlers = Object.assign.call({},
            this.getInitChainHandler(),
            this.getFlushHandler(),
            this.getEchoHandler(),
            this.getQueryHander(),
            this.getInfoHandler(),
            this.getBeginBlockHandler(),
            this.getEndBlockHandler(),
            this.getCheckTxHandler(),
            this.getDeliveryTxHandler(),
            this.getCommitHandler(),
            this.SetOption(),
            this.ListSnapshots(),
            this.OfferSnapshot(),
            this.LoadSnapshotChunk(),
            this.ApplySnapshotChunk()
            );

        this.server = new grpc.Server();
        this.server.addService(this.abciProto.service, this.handlers);
    }

    use (handler) {
        this.handlers[handler.getNameSpace()] = handler;
    }

    getTransaction (request) {
        return TU.parsePayload(request.tx);
    }

    getQueryHander () {
        const Query = (call, callback) => {
            this.stateManager.query(call.request).then(response => {
                callback(null, response);
            });
        };

        return { Query }
    }

    SetOption ()  {
        const SetOption = (request, callback) => {
            callback(null, callback);
        };

        return { SetOption }
    }

    ListSnapshots ()  {
        const ListSnapshots = (request, callback) => {
            callback(null, {});
        };

        return { ListSnapshots }
    }

    OfferSnapshot ()  {
        const OfferSnapshot = (request, callback) => {
            callback(null, {});
        };

        return { OfferSnapshot }
    }

    LoadSnapshotChunk (request, callback)  {
        const LoadSnapshotChunk = () => {
            callback(null, {});
        };

        return { LoadSnapshotChunk }
    }

    ApplySnapshotChunk ()  {
        const ApplySnapshotChunk = (request, callback) => {
            callback(null, {});
        };

        return { ApplySnapshotChunk }
    }

    getInfoHandler () {

        const Info = (call, callback) => {

            const height = this.stateManager.chainInfo.height;
            this.stateManager.hash.then(hash => {
                callback(null, {
                    data: 'Jaav contract platform',
                    version: '1.0.0',
                    lastBlockHeight : height
                    // lastBlockAppHash : heigth hash
                });
            });
        };

        return { Info }
    }

    getFlushHandler () {
        const Flush = (call, callback) => {
            callback(null, {});
        };

        return { Flush }
    }

    getEchoHandler () {
        const Echo = function (call, callback) {
            callback(null, {message: ''});
        };

        return { Echo }
    }

    getBeginBlockHandler () {
        const BeginBlock = (call, callback) => {
            callback(null, {
                tags : []
            });
        };

        return { BeginBlock }
    }

    getEndBlockHandler () {
        const EndBlock = (call, callback) => {
            this.stateManager.chainInfo.height = parseInt(call.request.height);

            callback(null, {
                tags : []
            });
        };

        return { EndBlock }
    }

    getInitChainHandler () {
        const InitChain = (call, callback) => {
            this.stateManager.chainInfo.validators = call.request.validators;
            callback(null, {
                consensusParams : call.request.consensusParams,
                validators: call.request.validators
            });
        };

        return { InitChain }
    }


    getCheckTxHandler () {

        const CheckTx = (call, callback) => {
            this.deliverTx(call.request, true).then(response => {
                callback(null, response)
            });
        };

        return { CheckTx }
    }

    deliverTx (request, check) {

        return new Promise(async (resolve, reject) => {

            const state = this.stateManager.state;

            const errorHandler = (err) => {
                throw new Error(err.message || err);
            };

            try {
                const transaction = this.getTransaction(request);

                if (!TU.verifyTx(transaction))
                    throw new Error('Signature not valid');

                let receipt = {};
                let tags = [];

                // under consideration to remove this check condition
                if (!check) {
                    this.stateManager.beginTransaction(state);
                    const handler = this.getHandler(transaction);
                    receipt = await handler(state, transaction, this.stateManager.chainInfo).catch(errorHandler);

                    if (!check) {
                        await this.stateManager.endTransaction(state).catch(errorHandler);
                    } else {
                        await this.stateManager.abortTransaction(state).catch(errorHandler);
                    }

                    if (receipt.tags) {
                        tags = receipt.tags;
                    }
                }

                resolve({
                    code: 0,
                    log : receipt.log || 'tx succeeded',
                    tags: tags,
                    data: Buffer.from(stringify(receipt.result || {}))
                });

            } catch (err) {
                await this.stateManager.abortTransaction(state);
                resolve({code: 1, log: err.message || err});
            }
        });
    }

    getDeliveryTxHandler () {

        const DeliverTx = (call, callback) => {
            this.deliverTx(call.request).then(response => {
                callback(null, response)
            });
        };

        return { DeliverTx }
    }

    getCommitHandler () {
        const Commit = (call, callback) => {
            let hash = '';
            this.stateManager.hash.then(hash);
                callback(null, {
                    data : hash
                });
        };

        return { Commit }
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
        this.stateManager.connect().then(()=> {
            this.server.bind('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure());
            this.server.start();
        });

    }
}

module.exports = ABCIServer;
