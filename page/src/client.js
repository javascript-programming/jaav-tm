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

    async createAccount (password) {
        const result = await this.makeRequest('createAccount', password);
        return result.data;
    }

    async transfer (account, to, amount, message, password) {
        const result = await this.makeRequest('transfer', account, to, amount, message, password);
        return result.data;
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

    async deploy (account, password, contract) {
        const result = await this.makeRequest('deploy', account, password, contract);
        return result.data;
    }

    async getContract (address, account) {
        const abi = await this.makeRequest('abi', address);
        return await this.registerContract(new ClientContract(this, address, abi, account));
    }
}

export { WebClient }
