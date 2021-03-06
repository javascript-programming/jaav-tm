const Commands = require('./commands');
const Mongo = require('./abci/mongo');

const commands = new Commands();
const options = commands.getOptions().options;

process.on('unhandledRejection', (error, promise) => {
    console.log(' We forgot to handle a promise rejection here: ', promise);
    console.log(' The error was: ', error );
});


const startRpc = () => {

    const RPCServer = require('./rpc/server');
    const rpcServer = new RPCServer(options.rpc, options.rpcs, options.tendermint);

    const client = rpcServer.getClient();

    client.connect().then(() => {
        const Console = require('./console');
        const Wallet = require('./wallet/wallet');

        const wallet = new Wallet(client, options.home);
        const console = new Console();
        wallet.console = console;

        const Contracts = require('./wallet/contracts');
        const contracts = new Contracts(wallet);
        contracts.console = console;

        rpcServer.startServer(console.getFunctions());
    }).catch(err => console.log(err));
};

const startABCI = () => {
    const AbciServer = require('./abci/server');

    const abciServer = new AbciServer(new Mongo(
        options.mhost, options.mport,
        options.muser || options.node,
        options.mpassword || options.node,
        options.mdatabase || options.node
    ));

    const WalletHandler = require('./handlers/wallet');
    abciServer.use(WalletHandler);

    const ContractHandler = require('./handlers/contract');
    abciServer.use(ContractHandler);
    abciServer.start(options.abci);
};


if (options.node) {
    const TendermintNode = require('./node/server');

    switch (options.rebuild) {
        case "0":
        case "false":
            options.rebuild = false;
            break;
        default:
            options.rebuild = true;
    }

    startABCI();

    const tendermintNode = new TendermintNode(options.home, options.node, options.tendermint, options.abci, options.rebuild);

    tendermintNode.start().then(() => {

        if (options.rpc) {
            startRpc();
        }
    })
}

if (!options.node && options.rpc) {
    startRpc();
}
