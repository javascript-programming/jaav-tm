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

Set configuration (folder name in configurations) + rpc port. Note: node0 and node1 are used for a chain with two validators

    ./run_node.sh single 3000

### Console webclient

Open the Chrome console on http://localhost:3000/page. If all is running correctly you will see the 'Hello localhost' message.

##### Wallet functions

 To get your accounts (at startup two accounts are provided with each 1000 coins as balance)

        > let accounts = await webclient.getAccounts()

 To get your balance

        > await webclient.getBalance(accounts[0])

 To transfer coins use `transfer (account, to, amount, message, password)`

        > await webclient.transfer(accounts[0], accounts[1], 1, 'Message for cashbook', '1234');

 To create a new accounts use `createAccount (password)`

        > await webclient.createAccount('1234')

 To change the password of an account use `changePassword (account, oldPassword, newPassword)`

        > await webclient.changePassword(account[0], '1234', 'newpassword')

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

        > let result = await webclient.hello('world')

![Alt text](images/deploy_helloworld.png?raw=true "Deploy contract")

 For each function in the contract there is `onFunctionName` listener available which is triggered when the function is called.

        > helloWorld.onHello = (result, options) => { console.log(result) }

 From wherever a function is called, each clientnode will receive a notification. In the `options.caller` the calling account is set.

![Alt text](images/call_helloworld.png?raw=true "Call and get contract")

For example, a call made from node `5.157.85.181` will result on `5.157.85.76` in:

![Alt text](images/receive_call_helloworld.png?raw=true "Receive notification from contract")

### RPC

The section above is about calling the chain with the webclient, which is using websockets. For older browsers the functions above
 are also available by rpc get and post ajax calls. Please see `node\rpc\http.js` for the corresponding endpoints

### TODO

- Equip the statemanager with a mongodb, mongodb should be able to return state hash and should have a readonly user.
- Set application hash (calculated on code base) in the genesis file for extra security
- Write tests for contracts to ensure determinism
- Provide extra functionality to contracts to send and receive coins
- Define initial amount of coins, make it configurable
- Implement inheritance for contracts
- Implement the library concept
- Implement destroy method on contract which will return funds to owner
- Investigate modifier rules on contract functions
- Define private methods on contracts
- Define call and get functions on contracts. Apply some metadata which function changes state. Maybe compiler can detect this.
- Refactor promise/async functions.
- Make option to keep account private keys off node
- Investigate better encryption for private key files
- abci core package contains bug, socket connections stream over multiple requests. Patched in `node\abci\patch`. Needs to be re-applied after `npi i`
- Refactor console or remove it completely, it is now the glue bringing all the functions together.
- Investigate to put all in docker containers. First attempt failed, docker doesn't seems to have `localhost`. Need to use docker compose and define a network.
- Docker should use alpine as base
- Invetigate businesscard concept. Make accounts identifiable.
- Create a lot of examples












