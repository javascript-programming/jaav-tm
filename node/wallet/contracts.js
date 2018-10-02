const TU = require('../common/transactionutils');
const CU = require('../common/contractutils');
const path = require('path');
const fs = require('fs');
const stringify = require('json-stable-stringify');
const Compiler = require('./compiler/contractcompiler');

class Contracts {

    constructor (wallet) {
        this.wallet = wallet;
        this.client = wallet.client;
        this.home = wallet.home;

        this.contractWalletPath = path.join(this.home, 'contracts.json');
        this.contractSourceFolder = path.join(__dirname, '../../contracts');
        this.createContractStorage();
    }

    set console (console) {
        const me = this;

        console.setFunction('contracts', {
            params : [],
            handler : () => { return Object.keys(me.contracts).map(name => {
                    let contract = { name };
                    me.contracts[name].address && (contract.address = me.contracts[name].address);
                    return contract;
                });
            }
        });

        console.setFunction('compile', {
            params : [],
            handler : () => { return me.compile(); }
        });

        console.setFunction('deploy', {
            params : ['account', 'password', 'contract name'],
            handler : (...params) => { return me.deploy.apply(me, params); },
            async : true
        });

        console.setFunction('abi', {
            params : ['address'],
            handler : (...params) => { return me.getAbi.apply(me, params); }
        });

        console.setFunction('code', {
            params  : ['address'],
            handler : (...params) => { return me.getCode.apply(me, params); }
        });

        console.setFunction('state', {
            params  : ['address'],
            handler : (...params) => { return me.getState.apply(me, params); }
        });

        console.setFunction('queryContract', {
            params  : ['account', 'address', 'function name', 'params'],
            handler : (...params) => { return me.queryContract.apply(me, params); }
        });

        console.setFunction('callContract', {
            params  : ['account', 'password', 'address', 'function name', 'value', 'params'],
            handler : (...params) => { return me.callContract.apply(me, params); },
            async   : true
        });

        console.setFunction('subscribe', {
            params  : ['address', 'handler', 'websocket'],
            handler : (...params) => { return me.subscribe.apply(me, params); },
            hidden  : true
        });

    }

    createContractStorage () {

        if (fs.existsSync(this.contractWalletPath)) {
            this.contracts = JSON.parse(fs.readFileSync(this.contractWalletPath));
        } else {
            this.contracts = {};
            this.saveContractsStorage();
        }
    }

    saveContractsStorage () {
        fs.writeFileSync(this.contractWalletPath, stringify(this.contracts));
    }

    compile () {
        const content = fs.readdirSync(this.contractSourceFolder);

        const result = [];

        for (let i = 0; i < content.length; i++) {
            let contractPath = path.join(this.contractSourceFolder, content[i]);
            let stat = fs.lstatSync(contractPath);
            let cls = fs.readFileSync(contractPath).toString();
            let entry;

            try {
                const contract = Compiler.compile(CU.getClass(cls));

                if (!this.contracts[contract.name]) {
                    this.contracts[contract.name] = contract;
                }

                entry = this.contracts[contract.name];

                if (entry.ctimeMs !== stat.ctimeMs) {
                    entry.ctimeMs = stat.ctimeMs;
                    entry.abi = contract.abi;
                    entry.code = Buffer.from(cls).toString('base64');
                    delete entry.address;
                    result.push(entry.name);
                }

            } catch (err) {
                console.log(err.message);
            }
        }

        this.saveContractsStorage();
        return result.join(',');
    }

    deploy (account, password, contract) {

        const me = this;

        return new Promise( (resolve, reject) => {

            const entry = me.contracts[contract];

            if (entry) {

                if (!entry.code)
                    me.compile();

                entry.keys = TU.createNewKeyAndAddress();

                const payload = {
                    name    : entry.name,
                    abi     : entry.abi,
                    code    : entry.code
                };

                me.wallet.unlockAccount(account, password).then(record => {
                    const tx = TU.createTx(account, record.privKey, record.pubKey, 'contract.deploy_contract', payload, entry.keys.address);
                    me.client.send(tx, true).then((message) => {
                        entry.deploys = entry.deploys || [];
                        entry.deploys.push(entry.keys.address);
                        entry.address = entry.keys.address;
                        me.saveContractsStorage();
                        resolve(message);
                    }).catch(reject);
                }).catch(reject);

            } else {
                reject('Contract not found');
            }
        });
    }

    async getAbi (contract) {

        return await this.client.query(`contracts/${contract}/abi`, {} ).catch((err) => {
            console.log(err);
            throw new Error(err);
        });
    }

    async getCode (contract) {

        let code = await this.client.query(`contracts/${contract}/code`, {} ).catch((err) => {
            console.log(err);
        });

        return Buffer.from(code, 'base64').toString();
    }

    async getState (contract) {

        return await this.client.query(`contracts/${contract}/state`, {} ).catch((err) => {
            console.log(err);
        });
    }

    async subscribe (address, handler, ws) {
        return await this.client.subscribe(address, handler, ws);
    }

    async queryContract (account, address, fn, ...params) {

        if (typeof params === 'string' || params instanceof String) {
            params = params.split(',');
        }

        return await this.client.query(`contracts/${address}`, { account, params, fn }).catch((err) => {
            console.log(err);
        });
    }

    callContract (account, password, address, fn, value, ...params) {

        if (typeof params === 'string' || params instanceof String) {
            params = params.split(',');
        }

        const me = this;

        const payload = {
            fn      : fn,
            params  : params
        };

        return new Promise((resolve, reject) => {
            me.wallet.unlockAccount(account, password).then(record => {
                const tx = TU.createTx(account, record.privKey, record.pubKey, 'contract.call_contract', payload, address);
                me.client.send(tx).then((message) => {
                    resolve(message);
                }).catch(reject);
            }).catch(reject);
        });

    }
}

module.exports = Contracts;


