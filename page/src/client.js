import { ClientBase } from "./base.js";

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
}

export { WebClient }
