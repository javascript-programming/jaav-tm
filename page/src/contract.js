class ClientContract {

    constructor (client, address, abi, account) {

        this._client = client;
        delete abi.constructor;
        this._address = address;
        this._account = account;

        const generateFunction = (target, fn, params) => {
            const body = {};
            let method, initialParams = [account, address, fn].map(item => "'" + item + "'");
            const isQuery = fn.startsWith('get');
            const isOracle = fn.startsWith('oracle');

            if (isQuery) {
                method = 'queryContract';
            }
            else {
                method = isOracle ? 'oracleContract' : 'callContract';

                if (!isOracle) {
                    initialParams.push(0);
                }

                initialParams.splice(1, 0, 'password');
            }

            eval(`body[fn] = function (${params.join(', ')} ${ !isQuery ?  params.length ? ', password' : 'password' : '' }) {
                return this._client.makeRequest('${method}', ${ initialParams.join(',') } ${params.length ? ',' : ''} ${ params.join(',') });
             }`);

            Object.assign(target, body);
        };

        Object.keys(abi).forEach(function(key) {
            generateFunction(this, key, abi[key]);
        }, this);

    }
}

export { ClientContract };
