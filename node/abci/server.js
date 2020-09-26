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
                keepCase: true,
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
        const query = (request) => {
            return this.stateManager.query(request);
        };

        return { query }
    }

    SetOption ()  {
        const SetOption = () => {

        };

        return { SetOption }
    }

    ListSnapshots ()  {
        const ListSnapshots = () => {

        };

        return { ListSnapshots }
    }

    OfferSnapshot ()  {
        const OfferSnapshot = () => {

        };

        return { OfferSnapshot }
    }

    LoadSnapshotChunk ()  {
        const LoadSnapshotChunk = () => {

        };

        return { LoadSnapshotChunk }
    }

    ApplySnapshotChunk ()  {
        const ApplySnapshotChunk = () => {

        };

        return { ApplySnapshotChunk }
    }

    getInfoHandler () {

        const Info = (request) => {

            const height = this.stateManager.chainInfo.height;

            return {
                data: 'Jaav contract platform',
                version: '1.0.0',
                lastBlockHeight:  height,
                lastBlockAppHash: this.stateManager.hash
            }
        };

        return { Info }
    }

    getFlushHandler () {
        const Flush = (request) => {
            return {}
        };

        return { Flush }
    }

    getEchoHandler () {
        const Echo = function (request, callback) {
            callback(null, {message: 'Hello Terence'});
        };

        return { Echo }
    }

    getBeginBlockHandler () {
        const BeginBlock = (request) => {
            return {
                tags : []
            }
        };

        return { BeginBlock }
    }

    getEndBlockHandler () {
        const EndBlock = (request) => {
            this.stateManager.chainInfo.height = request.height.toNumber();
            return {
                tags : []
            }
        };

        return { EndBlock }
    }

    getInitChainHandler () {
        const InitChain = ({ validators }) => {
            this.stateManager.chainInfo.validators = validators;
            return {};
        };

        return { InitChain }
    }


    getCheckTxHandler () {

        const CheckTx = (request) => {
            return this.getDeliveryTxHandler().deliverTx(request, true);
        };

        return { CheckTx }
    }

    getDeliveryTxHandler () {

        const DeliverTx = (request, check) => {

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
                        code    : 0,
                        log     : receipt.log || 'tx succeeded',
                        tags    : tags,
                        data    : Buffer.from(stringify(receipt.result || {}))
                    });

                } catch (err) {
                    await this.stateManager.abortTransaction(state);
                    resolve({ code: 1, log: err.message || err});
                }
            });
        };

        return { DeliverTx }
    }

    getCommitHandler () {
        const Commit = (request) => {
            return new Promise (async (resolve, reject) => {
                let hash = '';
                try {
                    hash = await this.stateManager.hash;
                } catch(err) {
                    console.log(err.message);
                    reject();
                }
                resolve({
                    data : hash
                });
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
