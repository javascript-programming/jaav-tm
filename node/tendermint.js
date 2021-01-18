const Commands = require('./commands');
const Mongo = require('./abci/mongo');
const config = require('config');

const commands = new Commands();
const options = commands.getOptions().options;

process.on('unhandledRejection', (error, promise) => {
    console.log(' We forgot to handle a promise rejection here: ', promise);
    console.log(' The error was: ', error );
});

const tendermintConfig = config.get('server.tendermint');
const abciConfig =  config.get('server.abci');
const rpcConfig =  config.get('server.rpc');

const startRpc = () => {

    const RPCServer = require('./rpc/server');
    const rpcServer = new RPCServer(options.rpc || rpcConfig.port,
        options.rpcs || rpcConfig.securePort,
        options.tendermint || tendermintConfig.port);

    const client = rpcServer.getClient();

    client.connect().then(() => {
        const Console = require('./console');
        const Wallet = require('./wallet/wallet');

        const wallet = new Wallet(client, options.home || tendermintConfig.home);
        const console = new Console();
        wallet.console = console;

        const Contracts = require('./wallet/contracts');
        const contracts = new Contracts(wallet);
        contracts.console = console;
        const functions = console.getFunctions();

        rpcServer.startServer(functions);
        startAutomation(functions);

    }).catch(err => console.log(err));
};

const startAutomation = (functions) => {
    const Automation = require('./automation/automation');
    const automation = new Automation(functions, options.rebuild);
    automation.executeActions(config.get('init.actions'));
};

const startABCI = () => {
    const AbciServer = require('./abci/server');

    const abciServer = new AbciServer(new Mongo(
        options.mhost || abciConfig.state.host, options.mport || abciConfig.state.port,
        (options.muser || abciConfig.state.user) || (options.node || tendermintConfig.node),
        (options.mpassword || abciConfig.state.password) || (options.node || tendermintConfig.node),
        (options.mdatabase || abciConfig.state.database) || (options.node || tendermintConfig.node)
    ),
        abciConfig.oracle.host ? new Mongo(
             abciConfig.oracle.host,  abciConfig.oracle.port,
            abciConfig.oracle.user, abciConfig.oracle.password,
            abciConfig.oracle.database) : null
    );

    const WalletHandler = require('./handlers/wallet');
    abciServer.use(WalletHandler);

    const ContractHandler = require('./handlers/contract');
    abciServer.use(ContractHandler);
    return abciServer.start(options.abci || abciConfig.port);
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

    startABCI().then(() => {
        const tendermintNode = new TendermintNode(options.home, options.node, options.tendermint, options.abci, options.rebuild);

        tendermintNode.start().then(() => {

            if (options.rpc) {
                startRpc();
            }
        })
    });
}

if (!options.node && options.rpc) {
    startRpc();
}
