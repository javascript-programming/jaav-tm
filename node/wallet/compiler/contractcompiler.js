class ContractCompiler {

    static getParameters (func) {
        return (func + '')
            .replace(/[/][/].*$/mg,'') // strip single-line comments
            .replace(/\s+/g, '') // strip white space
            .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
            .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
            .replace(/=[^,]+/g, '') // strip any ES6 defaults
            .split(',').filter(Boolean); // split & filter [""]
    }

    static compile (contract) {

        let result = {},
            meta = Object.getOwnPropertyDescriptors(contract),
            functions = Object.getOwnPropertyNames(Object.getOwnPropertyDescriptors(contract).prototype.value);
        result.name = meta.name.value;
        result.abi = {};

        for (let i = 0; i < functions.length; i++) {
            let f = functions[i];
            result.abi[f] = this.getParameters(contract.prototype[f].toString());
        }

        return result;
    }
}

module.exports = ContractCompiler;
