### Architecture of the Jaav TM Node

The setup is according to the following scheme.

![Alt text](https://github.com/wolfposd/tutorials/raw/master/images/tendermint/TMApplicationExample.png?raw=true "Scheme")
https://github.com/wolfposd/tutorials/raw/master/images/tendermint/TMApplicationExample.png

Source: https://tendermint.com/docs/app-dev/app-development.html#abci-design

 - On startup the abci server (port 46658) is started (NodeApp in the picture). The abci is receiving requests from the tendermint client. The abci is validating sent blocks and updates the application state.
 Its implementation is found in the folder `abci`. The abci keeps the application state which is implemented in `statemanager.js` (Database in the picture).
 In this case there is no connection between the Statemanager and the Client-interface. The abci and statemanager are isolated, it is only receiving requests from the tendermint client.
 - The tendermint node is a binary shipped as npm package. It is called in `node\server.js`. This server is the client of the abci server.
 The tendermint node accepts broadcast messages on port 46657 from the Client-interface.
 The tendermint node is connected to other tendermint nodes on port 46656. The tendermint node is responsible for the consensus algorithm and transportation of blocks between the nodes.
 - The Client-interface/JSON-RPC is implemented in the `rpc` folder. JSON-RPC is implemented in `client.js`. In this case the RPC and Client are merged together where `http.js` and `websocket.js` are the implementations of the Client-interface.
  It listens on port 3000 for incoming requests made from clients like browser applications. Unlike in the picture (connection Client-interface / Node app) there is no connection with the abci (Node app).
  The RPC accepts three kinds of clients: a console, clients who make requests through the http- and websocket endpoints.

The `wallet` folder contains the implementation of the account and contract wallet.  The handlers in the `handler` folder are used by the abci to process incoming blocks.

The `common` folder contains utils used by all other packages. Like crypto and encoding stuff.

### Start up commands

Defined in `commands.js`


            tthis.getopt = new Getopt([
                         ['t',       'tendermint=PORT'         , 'Tendermint port (default 46657)'],
                         ['d',       'home=PATH'               , 'HOME data path'],
                         ['a',       'abci=PORT'               , 'ABCI port (default 46658)'     ],
                         ['n',       'node=PATH'               , 'Node name in configurations folder'],
                         ['r',       'rpc=PORT'                , 'Start rpc client and console (default 3000)'],
                         ['M',       'mhost=ARG'               , 'Mongodb host (default 127.0.0.1)'],
                         ['P',       'mport=PORT'              , 'Mongodb port (default 27017)'],
                         ['u',       'muser=ARG'               , 'Mongodb user (default node name)'],
                         ['p',       'mpassword=ARG'           , 'Mongodb password (default node name)'],
                         ['D',       'mdatabase=ARG'           , 'Mongodb database (default node name)'],
                         ['R',       'rebuild=ARG'             , 'Recreate chain, remove state and all data (default false)'],
                     ]);

Main entry point is `app.js`

### Further reading

- https://tendermint.com/docs/app-dev/app-development.html#abci-design
- https://github.com/tendermint/tendermint/wiki/Application-Architecture
- https://tendermint.readthedocs.io/en/v0.21.0/abci-spec.html
- https://tendermint.github.io/slate/


