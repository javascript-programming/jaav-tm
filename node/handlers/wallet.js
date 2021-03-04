const config = require('config');
const settings = config.get('settings');

class WalletHandler {

    static getNameSpace () {
        return 'wallet';
    }

    static create_account (state, tx) {

        return new Promise(async (resolve, reject) => {

            try {

                // if (settings.disableNewAccount) {
                //     reject('New accounts are disabled');
                //     return;
                // }

                if (tx.params.account !== tx.account) {
                    reject('Account origin should be sender');
                    return;
                }

                if (await state.getAccount(tx.params.account)) {
                    reject('Account already exists');
                    return;
                }

                const newAccount = {
                    _id     : tx.params.account,
                    balance : 1000,
                    cashbook: []
                };

                await state.insertRecord(false, newAccount, 'accounts');

                resolve({
                    log   : 'Account created',
                    result: {
                        address: tx.params.account,
                        balance: newAccount.balance
                    }
                });
            } catch (err) {
                reject(err.message);
            }
        });
    }

    //code almost the sa,e as in contract
    static transfer_funds (state, tx) {

        return new Promise(async (resolve, reject) => {

            try {

                const fromAccount = await state.getAccount(tx.account);

                if (!fromAccount) {
                    reject("This account (" + tx.account + ") doesn't exist");
                    return;
                }

                if (Number.isInteger(tx.value) && tx.value > 0) {

                    let toAccount = await state.getAccount(tx.to) || await state.getContract(tx.to);

                    if (!toAccount) {
                        reject('Be happy! No funds are lost while you have sent your funds into the blue.');
                        return;
                    }

                    if (fromAccount.balance >= tx.value) {

                        toAccount.balance += tx.value;
                        fromAccount.balance -= tx.value;

                        let message = tx.params.message;
                        let cashRecord = {from: tx.account, amount: tx.value, message};
                        toAccount.cashbook.push(cashRecord);

                        cashRecord = {to: tx.to, amount: tx.value, message};
                        fromAccount.cashbook.push(cashRecord);

                        await state.updateRecord(false, toAccount._id, toAccount, toAccount.abi ? 'contracts' : 'accounts');
                        await state.updateRecord(false, fromAccount._id, fromAccount, 'accounts');

                    } else {
                        reject('Insufficient funds you have!');
                        return;
                    }

                } else {
                    reject('Value should be positive integer');
                    return;
                }

                resolve({
                    log   : 'Balance updated',
                    result: fromAccount
                });
            } catch(err) {
                reject(err.message)
            }
        });

    }
}

module.exports = WalletHandler;
