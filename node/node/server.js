const tendermint = require('tendermint-node');
const path = require('path');
const Utils = require('../common/fileutils');

class TendermintNode {

    constructor (home, config, rpcPort = 46657, abciPort = 46658, rebuild) {

        this.home       = home || path.join(__dirname, '../../network');
        this.rpcUrl     = 'tcp://0.0.0.0:'    + rpcPort;
        this.abciUrl    = 'tcp://0.0.0.0:'    + abciPort;

        if (rebuild || !Utils.exists(this.home)) {
            if (config) {
                const configDir = path.join(__dirname, '../../configurations', path.join(config, 'config'));
                const dataDir = path.join(__dirname, '../../configurations', path.join(config, 'data'));
                Utils.removePath(this.home);
                Utils.copyDir(configDir, path.join(this.home, 'config'));
                Utils.copyDir(dataDir, path.join(this.home, 'data'));

            } else {
                Utils.makeDirWhenNotExists(this.home);
            }

            tendermint.initSync(this.home);
        }
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
        return node.started(20000000000);
    }
}

module.exports = TendermintNode;
