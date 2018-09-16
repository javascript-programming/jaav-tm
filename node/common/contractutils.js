class ContractUtils {

    static getClass (cls) {
        let result;
        eval('result = ' + cls);
        return result;
    }

}

module.exports = ContractUtils;
