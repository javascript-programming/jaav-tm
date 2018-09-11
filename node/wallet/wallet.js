const TU = require('../common/transactionutils');
const path = require('path');
const fs = require('fs');
const Cryptr = require('cryptr');
let stringify = require('json-stable-stringify');

class Wallet {

    constructor(client, home) {
        this.client = client;
        this.home = home || path.join(__dirname, '../../network');

        this.walletPath = path.join(this.home, 'wallet');
        this.createWallet();
    }

    createWallet () {

        if (fs.existsSync(this.walletPath)) {
            this.wallet = JSON.parse(fs.readFileSync(this.walletPath));
        } else {

            let keys = TU.createNewKeyAndAddress();

            this.wallet = {
                accounts : {},
                account  : keys.address
            };

            this.addAccount(keys).then(() => {
                this.createAccount();
            }).catch((ex) => {
                console.log(ex);
            });
        }

        this.unlocked = {};
    }

    set console (console) {

        const me = this;

        console.setFunction('accounts', {
            params : [],
            handler : () => { return me.accounts; }
        });

        console.setFunction('getBalance', {
            params : ['account'],
            handler : (...params) => { return me.getBalance.apply(me, params); }
        });

        console.setFunction('createAccount', {
            params : ['password'],
            handler : (...params) => { return me.createAccount.apply(me, params); },
            async   : true
        });

        console.setFunction('setMainAccount', {
            params : ['account'],
            handler : (...params) => { return me.setMainAccount.apply(me, params); }
        });

        console.setFunction('unlockAccount', {
            params : ['account', 'password'],
            handler : (...params) => { return me.unlockAccount.apply(me, params); },
            async   : true
        });

        console.setFunction('lockAccount', {
            params : ['account'],
            handler : (...params) => { return me.lockAccount.apply(me, params); }
        });

        console.setFunction('changePassword', {
            params : ['account', 'oldPassword', 'newPassword'],
            handler : (...params) => { return me.changePassword.apply(me, params); },
            async   : true
        });

        console.setFunction('transfer', {
            params : ['account', 'to', 'amount', 'password'],
            handler : (...params) => { return me.transfer.apply(me, params); },
            async   : true
        });
    }


    createAccount (password) {
        return this.addAccount(TU.createNewKeyAndAddress(), password);
    }

    addAccount (keys, password) {

        password = password || '1234';
        console.log('Account password');

        const cryptr = new Cryptr(password);

        this.wallet.accounts[keys.address] = {
            privKey : cryptr.encrypt(keys.privKey),
            pubKey  : keys.pubKey
        };

        this.saveWallet();
        console.log("New account written to wallet file");
        console.log(keys);

        let tx = TU.createTx(keys.address, keys.privKey, keys.pubKey, 'wallet.create_account', { account : keys.address } );

        return new Promise((resolve, reject) => {
            this.client.send(tx).then(resolve).catch(reject);
        });
    }

    changePassword (account, oldPassword, newPassword) {

        return new Promise((resolve, reject) => {

            const isLocked = this.isLocked(account);

            this.unlockAccount(account, oldPassword).then(unlocked => {

                let record = this.wallet.accounts[account];
                record.privKey = new Cryptr(newPassword).encrypt(unlocked.privKey);
                this.saveWallet();
                isLocked && this.lockAccount(account);
                resolve('New password is: ' + newPassword);
            }).catch(reject);
        });
    }

    unlockAccount(account, password) {

        return new Promise((resolve, reject) => {

            password = password || '1234';

            account = account || this.wallet.account;

            if (!this.isLocked(account)) {
                this.lockAccount(account);
            }

            let record = this.wallet.accounts[account];

            if (record) {
                record = TU.clone(record);
                this.unlocked[account] = record;
                record.privKey = new Cryptr(password).decrypt(record.privKey);

                if (TU.verifyPublicAccountKey(record.privKey, record.pubKey)) {
                    record.timeout = setTimeout(this.lockAccount.bind(this), 60 * 60 * 1000, account);
                } else {
                    this.lockAccount(account);
                    reject('Wrong password');
                    return;
                }

                resolve(record);

            } else {
                reject('Account not found in this wallet');
            }

        });
    }

    lockAccount (account) {

        if (this.unlocked[account]) {
            clearTimeout(this.unlocked[account].timeout);
            delete this.unlocked[account];
        }
    }

    isLocked (account) {
        return !this.unlocked[account];
    }

    saveWallet () {
        fs.writeFileSync(this.walletPath, stringify(this.wallet));
    }

    get accounts () {
        return Object.keys(this.wallet.accounts);
    }

    get account () {
        return this.wallet.accounts[this.wallet.account];
    }

    setMainAccount (account) {

        if (this.wallet.accounts[account]) {
            this.wallet.account = account;
            this.saveWallet();
        }
    }

    transfer (account, to, amount, message, password) {

        return new Promise((resolve, reject) => {

            amount = parseInt(amount);

            if (!Number.isInteger(amount) || amount < 0) {
                reject('Amount should be a positive number');
                return;
            }

            let currentBalance = this.getBalance(account);

            if (currentBalance < amount) {
                reject('Insufficient funds for this transaction, your current balance is ' + currentBalance);
                return;
            }

            this.unlockAccount(account, password).then( record => {
                let tx = TU.createTx(account, record.privKey, record.pubKey, 'wallet.transfer_funds', { message }, to, amount);
                this.client.send(tx).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    async getBalance(account) {
        account = account || this.wallet.account;

        let record = await this.client.query('account', { account : account} ).catch((err) => {
            console.log(err);
        });

        if (record == null) {
            return 0
        }
        return record.balance;
    }
}

module.exports = Wallet;
