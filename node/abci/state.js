class State {

    constructor (mongo) {

        const me = this;

        me.getAccount = (id) => {
            return me.getRecord({ _id: id }, 'accounts');
        };

        me.getContract = (id) => {
            return me.getRecord({ _id: id }, 'contracts');
        };

        me.getRecord = (query, collection, many, fields) => {
            const cursor = mongo.database.collection(collection).find(query, { projection : fields });

            return new Promise((resolve, reject) => {
                return cursor.toArray().then(result => {
                    resolve(many ? result : result[0]);
                }).catch(reject);
            });
        };

        me.insertRecords = (record, collection) => {
            return new Promise((resolve, reject) => {
                const fn = Array.isArray(record) ? 'insertMany' : 'insertOne';
                mongo.database.collection(collection)[fn](record, { session: me.session }).then((result) => {
                    resolve({count : result.insertedCount});
                }).catch(reject)
            });
        };

        me.insertRecord = me.insertRecords;

        me.updateRecord = (id, update, collection, upsert) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).updateOne({ _id : id },{ $set: update }, { session: me.session, upsert: upsert }).then((result) => {
                    resolve({
                        upsertedCount: result.upsertedCount,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount
                    });
                }).catch(reject)
            });
        };

        me.updateRecords = async (filter, update, collection, upsert) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).updateMany(filter,{ $set: update }, { session: me.session, upsert: upsert }).then((result) => {
                    resolve({
                        upsertedCount: result.upsertedCount,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount
                    });
                }).catch(reject)
            });
        };

        me.aggregate = async (pipeline, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).aggregate(pipeline).then(resolve).catch(reject)
            });
        };

        me.count = async (query) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).countDocuments(query).then(resolve).catch(reject)
            });
        };

        me.createIndex = (field, type, collection) => {
            return new Promise((resolve, reject) => {
                const spec = {};
                spec[field] = type;
                mongo.database.collection(collection).createIndex(spec, { session: me.session }).then((result) => {
                    resolve(result);
                }).catch(reject)
            });
        }
    }

    getContractDatabase (contract, write) {

        const me = this;
        const read = {
            getAccount : me.getAccount,
            getContract : me.getContract,
            query : (query, fields, collection, first = false) => {
                return me.getRecord(query, collection || contract, !first, fields);
            },
            count : (query, collection) => {
                return me.count(query, collection || contract);
            },
            aggregate : (pipeline, collection) => {
                return me.count(pipeline, collection || contract);
            }
        };

        const update = {
            insert : (record) => {
                return me.insertRecords(record, contract);
            },
            updateById : (id, update, upsert) => {
                return me.updateRecord(id, update, contract, upsert);
            },
            update : (filter, update, upsert) => {
                return me.updateRecords(filter, update, contract, upsert);
            },
            createIndex : (field, type) => {
                return me.createIndex(field, type, contract);
            }
        };

        return Object.assign(read, write ? update: {});
    }
}

module.exports = State;
