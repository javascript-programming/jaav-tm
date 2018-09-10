const Getopt = require('node-getopt');

module.exports = class Commands {

    constructor() {
        this.getopt = new Getopt([
            ['t',       'tendermint=PORT'         , 'Tendermint port (default 46657)'],
            ['d',       'home=PATH'               , 'HOME data path'],
            ['a',       'abci=PORT'               , 'ABCI port (default 46658)'     ],
            ['n',       'node=PATH'               , 'Node name in configurations folder'],
            ['r',       'rpc=PORT'                , 'Start rpc client and console (default 3000)'   ]
        ]);

        this.getopt.setHelp(
            "Usage: ./server [OPTION]\n" +
            "\n" +
            "[[OPTIONS]]\n"
        );
    }

    showHelp () {
        this.getopt.showHelp();
    }

    getOptions () {
        return this.getopt.parse(process.argv.slice(2));
    }
};
