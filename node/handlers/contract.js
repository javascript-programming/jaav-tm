const CU = require('../common/contractutils');
const TU = require('../common/transactionutils');

function executeContract (contract, state, fn, params, account, value) {

    if (contract.abi[fn]) {

        const code = Buffer.from(contract.code, 'base64').toString();
        const Cls = CU.getClass(code);
        const instance = new Cls(state);

        instance.caller = account;
        instance.value = value;

        return {
            result : instance[fn].apply(instance, params),
            state  : instance.state,
            tags   : [
                { key : Buffer.from('jv.contract'), value : Buffer.from(contract.address) },
                { key : Buffer.from('jv.event'), value : Buffer.from(fn) }
            ]
        }

    } else {
        throw new Error('Function not found in contract');
    }
}

class ContractHandler {

    static getNameSpace () {
        return 'contract';
    }

    static deploy_contract (state, tx) {

        const account = state.getAccount(tx.account)

        if (!state.accounts[tx.account])
            throw new Error('Contract can only be deployed from valid account');

        if (state.contracts[tx.to] && state.contracts[tx.to].deployed)
            throw new Error('This contract address is already deployed');

        const params = tx.params;

        if (params.index === 1) {
            state.contracts[tx.to] = {
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

        const contract = state.contracts[tx.to];
        contract.code += params.code;

        if (params.index === params.total) {
            const Cls = CU.getClass(Buffer.from(contract.code, 'base64').toString());
            const instance = new Cls();
            contract.state = instance.state || {};
            contract.deployed = true;
        }

        return {
            log     : 'Contract deployment',
            result  : {
                address     : contract.address,
                abi         : contract.abi,
                owner       : contract.owner,
                deployed    : contract.deployed
            }
        };
    }

    static call_contract (state, tx) {

        const contract = state.contracts[tx.to];

        if (contract) {

            if (!state.accounts[tx.account])
                throw new Error('Caller account unknown');

            //todo check value and balance sender
            const result = executeContract(contract, contract.state, tx.params.fn, tx.params.params, tx.account, tx.value);
            return {
                log     : 'Contract call executed',
                result  : result.result,
                tags    : result.tags
            }
        } else {
            throw new Error('Contract not found')
        }
    }

    static query_contract (state, account, contract, fn, params) {

        if (contract) {

            if (!state.accounts[account])
                throw new Error('Caller account unknown');

            return executeContract(contract, contract.state, fn, params, account).result;

        } else {
            throw new Error('Contract not found')
        }
    }


    //code almost the same as in wallet
    static transfer_funds (state, tx) {

        if (Number.isInteger(tx.value) && tx.value > 0) {

            if (!state.accounts[tx.to] && !state.contracts[tx.to]) {
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

        return {
            log     : 'Contract balance updated',
            result  : state.contracts[tx.account].balance
        };
    }

}

module.exports = ContractHandler;
