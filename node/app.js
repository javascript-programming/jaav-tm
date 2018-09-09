const AbciServer = require('./abci/server');
const TendermintNode = require('./node/server');

const abciServer = new AbciServer();
const tendermintNode = new TendermintNode();

abciServer.start();
tendermintNode.start();




