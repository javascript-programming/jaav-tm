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

    createAccount (password) {
        const fn = async () => {
            const result = await this.makeRequest('createAccount', password);
            return result.data;
        };
        return fn();
    }

    createNamedAccount (password, name) {
        const fn = async () => {
            const result = await this.makeRequest('createAccount', password, name);
            return result.data;
        };
        return fn();
    }

    getAccount (name, password) {
        return this.makeRequest('getAccount', name, password);
    }

    unlockAccount (account, password) {
        return this.makeRequest('unlockAccount', account, password);
    }

    transfer (account, to, amount, message, password) {
        const fn = async () => {
            const result = await this.makeRequest('transfer', account, to, amount, message, password);
            return result.data;
        };
        return fn();
    }

    changePassword (account, oldPassword, newPassword) {
        return this.makeRequest('changePassword', account, oldPassword, newPassword);
    }

    getContracts () {
        return this.makeRequest('contracts');
    }

    compile () {
        return this.makeRequest('compile');
    }

    upload (cls) {
        return this.makeRequest('upload', cls.toString());
    }

    deploy (account, password, contract) {
        const fn = async () => {
            const result = await this.makeRequest('deploy', account, password, contract);
            return result.data;
        };
        return fn();
    }

    getContract (address, account) {
        const fn = async () => {
            const abi = await this.makeRequest('abi', address);
            return await this.registerContract(new ClientContract(this, address, abi, account));
        };

        return fn();
    }
}

export { WebClient }
