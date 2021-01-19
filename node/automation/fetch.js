const axios = require('axios');
const TU = require('../common/transactionutils');

class Fetch {

    static async data (url, params, filter) {

        return new Promise(async (resolve, reject) => {
            try {

                let result = {};

                if (url.startsWith('http')) {
                    result = await axios.get(url, { params: params });
                } else {
                    result.data = require('./data/' + url);
                }

                const json = TU.parseJson(result.data);
                resolve(filter ? filter(json) : json);
            } catch (err) {
                reject(err.message);
            }
        });

    }
}

module.exports = Fetch;
