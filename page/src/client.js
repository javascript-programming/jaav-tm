import { ClientBase } from "./base.js";
import { ClientContract } from "./contract.js";

class WebClient extends ClientBase {

    constructor (host) {
        super(host);
    }

    getAccounts () {
        return this.makeRequest('accounts');
    }

    getBalance (account) {
        return this.makeRequest('getBalance', account);
    }


    getAccount (name, password) {
        return this.makeRequest('getAccount', name, password);
    }

    unlockAccount (account, password) {
        return this.makeRequest('unlockAccount', account, password);
    }

    changePassword (account, oldPassword, newPassword) {
        return this.makeRequest('changePassword', account, oldPassword, newPassword);
    }

    getContracts () {
        return this.makeRequest('contracts');
    }

    // Can only register one instance of a unique address
    getRegisteredContract (address, account) {
        const fn = async () => {
            const abi = await this.makeRequest('abi', address);
            return await this.registerContract(new ClientContract(this, address, abi, account));
        };

        return fn();
    }

    getContract (address, account) {
        const fn = async () => {
            const abi = await this.makeRequest('abi', address);
            return new ClientContract(this, address, abi, account);
        };

        return fn();
    }
}

export { WebClient }
