const TU = require('../common/transactionutils');
const path = require('path');
const fs = require('fs');
const stringify = require('json-stable-stringify');
const Compiler = require('./compiler/contractcompiler');


class Contracts {

    constructor (client, home) {
        this.client = client;
        this.home = home || path.join(__dirname, '../../network');

        this.contractWalletPath = path.join(this.home, 'contracts');
        this.contractSourceFolder = path.join(__dirname, '../../contracts');
        this.createContractStorage();
    }

    createContractStorage () {

        if (fs.existsSync(this.contractWalletPath)) {
            this.contracts = JSON.parse(fs.readFileSync(this.contractWalletPath));
        } else {
            this.contracts = {
            };

            this.saveContractsStorage();
        }

    }

    saveContractsStorage () {
        fs.writeFileSync(this.contractWalletPath, stringify(this.contracts));
    }

    getClass (cls) {
        let result;
        eval('result = ' + cls);
        return result;
    }

    compile () {
        let content = fs.readdirSync(this.contractSourceFolder);

        for (let i = 0; i < content.length; i++) {
            let contractPath = path.join(this.contractSourceFolder, content[i]);
            let stat = fs.lstatSync(contractPath);
            let cls = fs.readFileSync(contractPath).toString();
            let entry;

            try {
                let contract = Compiler.compile(this.getClass(cls));
                contract.birthtimeMs = stat.birthtimeMs;
                contract.code = Buffer.from(cls).toString('base64');

                if (!this.contracts[contract.name]) {
                    this.contracts[contract.name] = contract;
                }

                entry = this.contracts[contract.name];

                if (entry.birthtimeMs !== contract.birthtimeMs) {
                    entry.birthtimeMs = contract.birthtimeMs;
                    entry.abi = contract.functions;
                    entry.code = contract.code;
                    delete entry.address;
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        this.saveContractsStorage();
    }

    deploy (code) {

    }

}

let c = new Contracts();
c.compile()


