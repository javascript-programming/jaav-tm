class WalletHandler {

    static getNameSpace () {
        return 'wallet';
    }

    static create_account (state, tx) {

        return new Promise(async (resolve, reject) => {
            if (tx.params.account !== tx.account) {
                reject('Account origin should be sender');
                return;
            }

            if (await state.getAccount(tx.params.account)) {
                reject('Account already exists');
                return;
            }

            const newAccount = {
                _id: tx.params.account,
                balance: 1000,
                cashbook: []
            };

            await state.insertRecord(newAccount, 'accounts');

            return {
                log     : 'Account created',
                result  : {
                    address : tx.params.account,
                    balance : newAccount.balance
                }
            }
        });
    }

    //code almost the sa,e as in contract
    static transfer_funds (state, tx) {

        const fromAccount = state.getAccount[tx.account];

        if (Number.isInteger(tx.value) && tx.value > 0) {

            let toAccount = state.getAccount(tx.to) || state.getContract(tx.to);


            if (!toAccount) {
                throw new Error('Be happy! No funds are lost while you have sent your funds into the blue.');
            }

            if (fromAccount.balance >= tx.value) {

                toAccount.balance += tx.value;
                fromAccount.balance -= tx.value;

                let message = tx.params.message;
                let cashRecord = { from: tx.account, amount: tx.value, message };
                toAccount.cashbook.push(cashRecord);

                cashRecord = { to: tx.to, amount: tx.value, message };
                fromAccount.cashbook.push(cashRecord);

                state.updateRecord(toAccount._id, toAccount, toAccount.abi? 'contracts' : 'accounts');
                state.updateRecord(fromAccount._id, fromAccount, 'accounts');

            } else {
                throw new Error('Insufficient funds you have!');
            }

        } else {
            throw new Error('Value should be positive integer');
        }

        return {
            log     : 'Balance updated',
            result  : fromAccount
        };
    }
}

module.exports = WalletHandler;
