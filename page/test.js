const webclient = new WebClient('ws://localhost:3010');
webclient.connect().then(async () => {
    let accounts = await webclient.getAccounts();
    console.log(accounts);
    let balance = await webclient.getBalance(accounts[0]);
    console.log(balance);
    let newAccount = await webclient.createAccount('1234');
    console.log(newAccount);
    let transfer = await webclient.transfer(accounts[0], accounts[3], 1, 'Test', '1234').catch(err => {
        console.log(err) });
    console.log(transfer);
    let compile = await webclient.compile();
    console.log(compile);
    let contracts = await webclient.getContracts();
    console.log(contracts);
    let deploy = await webclient.deploy(accounts[0], '1234', 'HelloWorld');
    console.log(deploy);
    //todo listen to some event when state is updated, checkTx is executed while deliverTx is updating
    setTimeout(async () => {

        const helloWorld = await webclient.getContract('7WEBvDJN3K5bL5dXxf9cg7R2afw4QfVqQ', accounts[0], '1234');

        helloWorld.onSetGreeting = (result, options) => {
            helloWorld.hello('Terence');
        };

        helloWorld.onHello = (result, options) => {
            console.log(result);
        };


        helloWorld.onSetObject = async (result, options) => {
            console.log(await helloWorld.getObject());
        };

        helloWorld.setGreeting('Hi');

        helloWorld.setObject({
            test : 'test'
        });


    }, 300);
});
