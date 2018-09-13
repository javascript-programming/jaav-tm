const Commands = require('./commands');

const commands = new Commands();
const options = commands.getOptions().options;

if (options.rpc) {

    const RPCServer = require('./rpc/server');
    const rpcServer = new RPCServer(options.rpc);

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
    });

} else {

    const AbciServer = require('./abci/server');
    const TendermintNode = require('./node/server');

    const abciServer = new AbciServer();

    const WalletHandler = require('./handlers/wallet');
    abciServer.use(WalletHandler);

    const ContractHandler = require('./handlers/contract');
    abciServer.use(ContractHandler);

    const tendermintNode = new TendermintNode(options.home, options.node, options.tendermint, options.abci);

    abciServer.start(options.abci);
    tendermintNode.start();
}
