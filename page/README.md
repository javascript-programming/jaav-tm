### Webclient for the browser

This package is built with webpack. The compiled entry is found in the `dist` folder.

To build

    `npm i`
    `npm run-script build`

The `basic` folder contains a Bryntum scheduler powered by the Jaav-tm framework.

 The demo is available on http://5.157.85.76:3000/page/basic and http://5.157.85.181:3000/page/basic

To use the plugin in your web app, just add the `main.js` to your page

        <script src="../dist/main.js"></script>

 This client console is made online available on: http://5.157.85.76:3000/page and http://5.157.85.181:3000/page

#### RPC endpoints

        (GET)/accounts
        (GET)/accounts/:account/balance'
        (POST)/accounts/create
        (POST)/accounts/:account/transfer/:to
        (GET)/contracts
        (POST)/contracts/:account/deploy/:name
        (GET)/contracts/:address/abi
        (GET)/contracts/:address/code
        (POST)/contracts/:address/:account/:method/call
        (POST)/contracts/:address/:account/:method/get
        (GET)/contracts/:address/state



