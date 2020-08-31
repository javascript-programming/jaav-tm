const CU = require('../common/contractutils');
const TU = require('../common/transactionutils');

function executeContract (contract, state, fn, params, account, value) {

    return new Promise(async (resolve, reject) => {
        if (contract.abi[fn]) {

            const code = Buffer.from(contract.code, 'base64').toString();
            const Cls = CU.getClass(code);
            const instance = new Cls(state);

            instance.caller = account;
            instance.value = value;

            const fnRef = instance[fn];

            resolve({
                result : (fnRef instanceof Promise) ? await fnRef.apply(instance, params) : fnRef.apply(instance, params),
                state  : instance.state,
                tags   : [
                    { key : Buffer.from('jv.contract'), value : Buffer.from(contract.address) },
                    { key : Buffer.from('jv.event'), value : Buffer.from(fn) }
                ]
            });

        } else {
            reject('Function not found in contract');
        }
    });
}

class ContractHandler {

    static getNameSpace () {
        return 'contract';
    }

    static deploy_contract (state, tx) {
        return new Promise(async (resolve, reject) => {

            const account = await state.getAccount(tx.account);

            if (!account) {
                reject('Contract can only be deployed from valid account');
                return;
            }

            let contract = await state.getContract(tx.to);

            if (contract && contract.deployed) {
                reject('This contract address is already deployed');
                return;
            }

            const params = tx.params;

            if (params.index === 1) {
                contract = {
                    _id         : tx.to,
                    balance     : 0,
                    owner       : tx.account,
                    address     : tx.to,
                    cashbook    : [],
                    name        : tx.params.name,
                    abi         : tx.params.abi,
                    code        : '',
                    deployed    : false
                };
            }

            contract.code += params.code;

            if (params.index === params.total) {
                const Cls = CU.getClass(Buffer.from(contract.code, 'base64').toString());
                const instance = new Cls();
                contract.state = instance.state || {};
                contract.deployed = true;
            }

            await state.insertRecord(contract, 'contracts');

            resolve({
                log     : 'Contract deployment',
                result  : {
                    address     : contract.address,
                    abi         : contract.abi,
                    owner       : contract.owner,
                    deployed    : contract.deployed
                }
            });
        });
    }

    static call_contract (state, tx) {

        return new Promise(async (resolve, reject) => {
            const contract = await state.getContract(tx.to);
            const account = await state.getAccount(tx.account);

            if (contract) {

                if (!account)
                    reject('Caller account unknown');

                //todo check value and balance sender
                const result = await executeContract(contract, contract.state, tx.params.fn, tx.params.params, tx.account, tx.value);
                resolve({
                    log     : 'Contract call executed',
                    result  : result.result,
                    tags    : result.tags
                });
            } else {
                reject('Contract not found');
            }
        });
    }

    static query_contract (state, account, contract, fn, params) {

        return new Promise(async (resolve, reject) => {
            if (contract) {

                const caller = await state.getAccount(account);

                if (!caller) {
                    reject('Caller account unknown');
                    return;
                }

                const result = await executeContract(contract, contract.state, fn, params, account);
                resolve(result.result);

            } else {
                reject('Contract not found');
            }
        });
    }


    //code almost the same as in wallet
    static transfer_funds (state, tx) {

        return new Promise(async (resolve, reject) => {
            const fromContract = await state.getContract(tx.account);

            if (Number.isInteger(tx.value) && tx.value > 0) {

                let toAccount = await state.getAccount(tx.to) || await state.getContract(tx.to);

                if (!toAccount) {
                    reject('Be happy! No funds are lost while you have sent your funds into the blue.');
                    return;
                }

                if (fromContract.balance >= tx.value) {

                    toAccount.balance += tx.value;
                    fromContract.balance -= tx.value;

                    let message = tx.params.message;
                    let cashRecord = { from: tx.account, amount: tx.value, message };
                    toAccount.cashbook.push(cashRecord);

                    cashRecord = { to: tx.to, amount: tx.value, message };
                    fromContract.cashbook.push(cashRecord);

                    await state.updateRecord(toAccount._id, toAccount, toAccount.abi? 'contracts' : 'accounts');
                    await state.updateRecord(fromContract._id, fromContract, 'contracts');

                } else {
                    reject('Insufficient funds you have!');
                    return;
                }

            } else {
                reject('Value should be positive integer');
                return;
            }

            resolve({
                log     : 'Contract balance updated',
                result  : fromContract.balance
            });
        });


    }

}

module.exports = ContractHandler;
