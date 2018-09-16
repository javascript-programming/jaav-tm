const CU = require('../common/contractutils');
const TU = require('../common/transactionutils');

class ContractHandler {

    static getNameSpace () {
        return 'contract';
    }

    static deploy_contract (state, tx) {

        if (!state.accounts[tx.account])
            throw new Error('Contract can only be deployed from valid account');

        if (state.contracts[tx.to])
            throw new Error('This contract address already exists');

        let value = 0;
        if (Number.isInteger(tx.value) && tx.value > 0) {
            value = tx.value;
        }

        if (state.accounts[tx.account].balance >= value) {
            state.accounts[tx.account].balance -= value;

            let message = 'Initial funds from ' + tx.account;

            state.contracts[tx.to] = {
                balance     : value,
                cashbook    : value > 0 ? [{ from: tx.account, amount: value, message }] :[],
                name        : tx.params.name,
                abi         : tx.params.abi,
                code        : tx.params.code,
                state       : {}
            };

            if (value > 0) {
                message = 'Transfer to contract ' + tx.to;
                state.accounts[tx.account].cashbook.push({to: tx.to, amount: value, message});
            }

        } else {
            throw new Error('Insufficient funds you have!');
        }

        return 'Contract deployed';
    }

    static call_contract (state, tx) {

        const contract = state.contracts[tx.to];

        if (contract) {

            if (!state.accounts[tx.account])
                throw new Error('Caller account unknown');

            if (!state.accounts[account])
                throw new Error('Caller account unknown');

            return ContractHandler.execute(contract, contract.state, fn, tx.params, account);


        } else {
            throw new Error('Contract not found')
        }
    }

    static query_contract (state, account, contract, fn, params) {

        if (contract) {

            if (!state.accounts[account])
                throw new Error('Caller account unknown');

            const immutableState = TU.clone(contract.state);
            return ContractHandler.execute(contract, immutableState, fn, params, account);

        } else {
            throw new Error('Contract not found')
        }
    }

    static execute (contract, state, fn, params, account) {

        if (contract.abi[fn]) {

            const code = Buffer.from(contract.code, 'base64').toString();
            const Cls = CU.getClass(code);

            const instance = new Cls(state);
            instance.caller = account;
            return instance[fn].apply(instance, params);

        } else {
            throw new Error('Function not found in contract');
        }
    }

    //code almost the same as in wallet
    static transfer_funds (state, tx) {

        if (Number.isInteger(tx.value) && tx.value > 0) {

            if (!state.accounts[tx.to] || !state.contracts[tx.to]) {
                throw new Error('Be happy! No funds are lost while you have sent your funds into the blue.');
            }

            if (state.contracts[tx.account].balance >= tx.value) {

                const receiver = state.accounts[tx.to] || state.contracts[tx.to];

                receiver.balance += tx.value;
                state.contracts[tx.account].balance -= tx.value;

                let message = tx.params.message;
                let cashRecord = { from: tx.account, amount: tx.value, message };
                receiver.cashbook.push(cashRecord);

                cashRecord = { to: tx.to, amount: tx.value, message };
                state.contracts[tx.account].cashbook.push(cashRecord);

            } else {
                throw new Error('Insufficient funds you have!');
            }

        } else {
            throw new Error('Value should be positive integer');
        }

        return 'Contract balance updated';
    }

}

module.exports = ContractHandler;
