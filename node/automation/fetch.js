const axios = require('axios');
const TU = require('../common/transactionutils');

class Fetch {

    static async data (url, params, filter) {
        try {
            const result = await axios.get(url, {params: params});
            const json = TU.parseJson(result.data);
            return filter ? filter(json) : json;
        } catch (err) {
            console.log(err.message);
            return {}
        }
    }
}

module.exports = Fetch;
