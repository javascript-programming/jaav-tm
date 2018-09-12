const TU = require('../common/transactionutils');
const path = require('path');
const fs = require('fs');
const stringify = require('json-stable-stringify');
const Compiler = require('./compiler/contractcompiler');


class Contracts {

    constructor (wallet) {
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
            handler : () => { return Object.keys(me.contracts); }
        });

        console.setFunction('compile', {
            params : [],
            handler : () => { return me.compile(); }
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

    static getClass (cls) {
        let result;
        eval('result = ' + cls);
        return result;
    }

    compile () {
        let content = fs.readdirSync(this.contractSourceFolder);

        let result = [];

        for (let i = 0; i < content.length; i++) {
            let contractPath = path.join(this.contractSourceFolder, content[i]);
            let stat = fs.lstatSync(contractPath);
            let cls = fs.readFileSync(contractPath).toString();
            let entry;

            try {
                let contract = Compiler.compile(Contracts.getClass(cls));

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
                    abi     : entry.abi,
                    code    : entry.code
                };

                me.wallet.unlockAccount(account, password).then(record => {
                    const tx = TU.createTx(account, record.privKey, record.pubKey, 'contract.deploy', payload, entry.keys.address);
                    me.client.send(tx).then(resolve).catch(reject);
                }).catch(reject);

            } else {
                reject('Contract not found');
            }

        });
    }
}

module.exports = Contracts;


