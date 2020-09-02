### Install

Requires node 8+ (not tested with 10)

https://nodejs.org/en/

Install node packages and set execute permission

    npm i
    cd ./page
    npm i

    cd ..
    chmod +x ./run_node.sh

### Run

Pass as params the configuration `single` (folder name in `configurations` folder) and rpc port `3000`. Note: `node0` and `node1` are used for a chain with two validators

    ./run_node.sh single 3000

### Console webclient

Open the Chrome console on http://localhost:3000/page. If all is running correctly you will see the 'Hello localhost' message.

##### Wallet functions

 To get your accounts (at startup two accounts are provided with each 1000 coins on balance)

        > let accounts = await webclient.getAccounts()

 To get your balance

        > await webclient.getBalance(accounts[0])

 To transfer coins use `transfer (account, to, amount, message, password)`

        > await webclient.transfer(accounts[0], accounts[1], 1, 'Message for cashbook', '1234');

 To create a new account use `createAccount (password)`

        > await webclient.createAccount('1234')

 To change the password of an account use `changePassword (account, oldPassword, newPassword)`

        > await webclient.changePassword(accounts[0], '1234', 'newpassword')

##### Contract functions

 To get your current contracts (kept per node in a wallet file)

        > await webclient.getContracts()

 To compile all the modified contracts stored in the contracts folder

        > await webclient.compile()

 To upload a contract in the console:

- Go to the snippets (tab: sources/snippets) section of the console and paste the content of a contract into the snippet area.
- Press run (right click snippet name)

 Now you will have your class available in the current scope

![Alt text](images/create_helloworld.png?raw=true "Create contract")

- Go to the console tab

        > await webclient.upload(HelloWorld)

- To deploy a contract use `deploy (account, password, contract)`

        > let deploy = await webclient.deploy(accounts[0], '1234', 'HelloWorld')

- To get an instance of the contract use `getContract (address, account)`

        > let helloWorld = await webclient.getContract(deploy.address, accounts[0])

- To call a contract function

        > let result = await helloWorld.hello('world')

![Alt text](images/deploy_helloworld.png?raw=true "Deploy contract")

 For each function in the contract there is a `onFunctionName` listener available which is triggered when the function is called.

        > helloWorld.onHello = (result, options) => { console.log(result) }

 From wherever a function is called, each clientnode will receive a notification. In the `options.caller` the calling account is set.

![Alt text](images/call_helloworld.png?raw=true "Call and get contract")

For example, a call made from node `5.157.85.181` will result on `5.157.85.76` in:

![Alt text](images/receive_call_helloworld.png?raw=true "Receive notification from contract")

### RPC

The section above is about calling the chain with the webclient, which is using websockets. For older browsers the functions above
 are also available by rpc get and post ajax calls. Please see `node\rpc\http.js` for the corresponding endpoints

See the `page` folder for the client and basic demo.
