const Commands = require('./commands');
const Console = require('console');

const commands = new Commands();
const options = commands.getOptions().options;

if (options.rpc) {

    const RPCServer = require('./rpc/server');
    const rpcServer = new RPCServer(options.rpc);

    const console = new Console();
    rpcServer.console = console;

} else {

    const AbciServer = require('./abci/server');
    const TendermintNode = require('./node/server');

    const abciServer = new AbciServer();
    const tendermintNode = new TendermintNode(options.home, options.node, options.tendermint, options.abci);

    abciServer.start(options.abci);
    tendermintNode.start();
}
