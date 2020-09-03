const Getopt = require('node-getopt');

module.exports = class Commands {

    constructor() {
        this.getopt = new Getopt([
            ['t',       'tendermint=PORT'         , 'Tendermint port (default 46657)'],
            ['d',       'home=PATH'               , 'HOME data path'],
            ['a',       'abci=PORT'               , 'ABCI port (default 46658)'     ],
            ['n',       'node=PATH'               , 'Node name in configurations folder'],
            ['r',       'rpc=PORT'                , 'Start rpc client and console (default 80)'],
            ['s',       'rpcs=PORT'               , 'Start secure rpc client and console (default 443)'],
            ['M',       'mhost=ARG'               , 'Mongodb host (default 127.0.0.1)'],
            ['P',       'mport=PORT'              , 'Mongodb port (default 27017)'],
            ['u',       'muser=ARG'               , 'Mongodb user (default node name)'],
            ['p',       'mpassword=ARG'           , 'Mongodb password'],
            ['D',       'mdatabase=ARG'           , 'Mongodb database (default node name)'],
            ['R',       'rebuild=ARG'             , 'Recreate chain, remove state and all data (default false)'],
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
