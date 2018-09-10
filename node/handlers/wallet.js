const common = require('./common');

class TransActionHandler {

    static getNameSpace () {
        return 'wallet';
    }

    static create_account (state, tx) {

        if (tx.params.account !== tx.account)
            throw new Error('Account origin should be sender');

        if (state.accounts[tx.params.account])
            throw new Error('Accounts already exists');

        state.accounts[tx.params.account] = {
            balance: 1000
        };

        return 'Account created';
    }

    static transfer_funds (state, tx) {

        if (Number.isInteger(tx.value) && tx.value > 0) {

            if (!state.accounts[tx.to]) {
                throw new Error('Be happy! No funds are lost while you have sent your funds into the blue.');
            }

            if (state.accounts[tx.account].balance >= tx.value) {
                state.accounts[tx.to].balance += tx.value;
                state.accounts[tx.account].balance -= tx.value;
            } else {
                throw new Error('Insufficient funds you have!');
            }
        } else {
            throw new Error('Value should be positive integer');
        }

        return 'Balance updated';

    }
}

module.exports = TransActionHandler;
