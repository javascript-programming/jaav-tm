class State {

    constructor (mongo) {

        const me = this;

        me.getAccount = (id) => {
            return me.getRecord({ _id: id }, 'accounts');
        };

        me.getContract = (id) => {
            return me.getRecord({ _id: id }, 'contracts');
        };

        me.getRecord = async (query, collection, many) => {
            const cursor = mongo.database.collection(collection).find(query);

            return new Promise((resolve, reject) => {
                return cursor.toArray().then(result => {
                    resolve(many ? result : result[0]);
                }).catch(reject);
            });
        };

        me.insertRecords = async (record, collection) => {
            return new Promise((resolve, reject) => {
                const fn = Array.isArray(record) ? 'insertMany' : 'insertOne';
                mongo.database.collection(collection)[fn](record, { session: me.session }).then(resolve).catch(reject)
            });
        };

        me.insertRecord = me.insertRecords;

        me.updateRecord = async (id, update, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).updateOne({ _id : id },{ $set: update }, { session: me.session }).then(resolve).catch(reject)
            });
        };

        me.updateRecords = async (filter, update, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).updateMany(filter,{ $set: update }, { session: me.session }).then(resolve).catch(reject)
            });
        };
    }

    getContractDatabase (contract, write) {

        const me = this;
        const read = {
            getAccount : me.getAccount,
            getContract : me.getContract,
            query : (query, collection, first = false) => {
                return me.getRecord(query, collection || contract, !first);
            }
        };

        const update = {
            insert : (record) => {
                return me.insertRecords(record, contract);
            },
            updateById : (id, update) => {
                return me.updateRecord(id, update, contract);
            },
            update : (filter, update) => {
                return me.updateRecords(filter, update, contract);
            },
        };

        return Object.assign(read, write ? update: {});
    }
}

module.exports = State;
