
class ClientContract {

    constructor (client, address, abi, account) {

        this._client = client;
        delete abi.constructor;

        const generateFunction = (target, fn, params) => {
            const body = {};
            let method, initialParams = [account, address, fn].map(item => "'" + item + "'");
            const isCall = !fn.startsWith('get');

            if (!isCall) {
                method = 'queryContract';
            } else {
                method = 'callContract';
                initialParams.push(0);
                initialParams.splice(1, 0, 'password');
            }

            eval(`body[fn] = function (${params.join(', ')} ${ isCall ? ', password' : '' }) {
                return this._client.makeRequest('${method}', ${ initialParams.join(',') }, ${ params.join(',')});
             }`);

            Object.assign(target, body);
        };

        Object.keys(abi).forEach(function(key) {
            generateFunction(this, key, abi[key]);
        }, this);
    }
}

export { ClientContract };
