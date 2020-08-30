const tendermint = require('tendermint-node');
const path = require('path');
const Utils = require('../common/fileutils');

class TendermintNode {

    constructor (home, config, rpcPort = 46657, abciPort = 46658) {

        this.home       = home || path.join(__dirname, '../../network');
        this.rpcUrl     = 'tcp://0.0.0.0:'    + rpcPort;
        this.abciUrl    = 'tcp://0.0.0.0:'    + abciPort;

        if (config) {
            config = path.join(__dirname, '../../configurations', path.join(config, 'config'));
            Utils.removePath(this.home);
            Utils.copyDir(config, path.join(this.home, 'config'));

        } else {
            Utils.makeDirWhenNotExists(this.home);
        }

        tendermint.initSync(this.home);
    }

    start () {
        let node = tendermint.node(this.home, {
            proxy_app : this.abciUrl,
            consensus : {
                create_empty_blocks : false
            },
            rpc       : {
                laddr   : this.rpcUrl
            },
            trace: true
        });

        node.stdout.pipe(process.stdout);
        return node.started();
    }
}

module.exports = TendermintNode;
