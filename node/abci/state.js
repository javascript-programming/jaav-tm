class State {

    constructor (stateDb, oracleDb) {

        const me = this;

        this.hasOracle = !!oracleDb;

        me.getAccount = (id) => {
            return me.getRecord(false,{ _id: id }, 'accounts');
        };

        me.getContract = (id) => {
            return me.getRecord(false,{ _id: id }, 'contracts');
        };

        me.getRecord = (oracle, query, collection, many, fields) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                try {
                    const cursor = db.database.collection(collection).find(query, {projection: fields});
                    cursor.toArray().then(result => {
                        resolve(many ? result : result[0]);
                    }).catch(reject);
                } catch (err) {
                    reject(err.message);
                }
            });
        };

        me.insertRecords = (oracle, record, collection) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                const fn = Array.isArray(record) ? 'insertMany' : 'insertOne';
                db.database.collection(collection)[fn](record, { session: me.session }).then((result) => {
                    resolve({count : result.insertedCount});
                }).catch(reject)
            });
        };

        me.insertRecord = me.insertRecords;

        me.updateRecord = (oracle, id, update, collection, upsert) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                db.database.collection(collection).updateOne({ _id : id },{ $set: update }, { session: me.session, upsert: upsert }).then((result) => {
                    resolve({
                        upsertedCount: result.upsertedCount,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount
                    });
                }).catch(reject)
            });
        };

        me.updateRecords = async (oracle, filter, update, collection, upsert) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                db.database.collection(collection).updateMany(filter,{ $set: update }, { session: me.session, upsert: upsert }).then((result) => {
                    resolve({
                        upsertedCount: result.upsertedCount,
                        matchedCount: result.matchedCount,
                        modifiedCount: result.modifiedCount
                    });
                }).catch(reject)
            });
        };

        me.bulkWrite = async (oracle, operations, collection) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                db.database.collection(collection).bulkWrite(operations, {session: me.session}).then(result => {
                    resolve({
                        upsertedCount: result.upsertedCount,
                        matchedCount : result.matchedCount,
                        modifiedCount: result.modifiedCount
                    });
                }).catch(reject);
            });
        };

        me.aggregate = async (oracle, pipeline, collection) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                const cursor = db.database.collection(collection).aggregate(pipeline);
                cursor.toArray().then(result => {
                    resolve(result);
                }).catch(reject);
            });
        };

        me.count = async (oracle, query, collection) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                db.database.collection(collection).countDocuments(query).then(resolve).catch(reject)
            });
        };

        me.createIndex = (oracle, field, type, collection) => {

            const db = oracle ? oracleDb : stateDb;

            return new Promise((resolve, reject) => {
                const spec = {};
                spec[field] = type;
                db.database.collection(collection).createIndex(spec, { session: me.session }).then((result) => {
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
                return me.getRecord(false, query, collection || contract, !first, fields);
            },
            count : (query, collection) => {
                return me.count(false, query, collection || contract);
            },
            aggregate : (pipeline, collection) => {
                return me.aggregate(false, pipeline, collection || contract);
            }
        };

        const update = {
            insert : (record) => {
                return me.insertRecords(false, record, contract);
            },
            updateById : (id, update, upsert) => {
                return me.updateRecord(false, id, update, contract, upsert);
            },
            update : (filter, update, upsert) => {
                return me.updateRecords(false, filter, update, contract, upsert);
            },
            updates : (operations = [], upsert = false) => {
                operations = operations.map(operation => {
                    return { updateOne: { filter: operation.filter, update: {$set: operation.update}, upsert: upsert } }
                });
                return me.bulkWrite(false, operations, contract);
            },
            createIndex : (field, type) => {
                return me.createIndex(false, field, type, contract);
            }
        };

        return Object.assign(read, write ? update: {});
    }

    getOracleDatabase () {

        const me = this;
        const read = {
            query : (query, fields, collection, first = false) => {
                return me.getRecord(true, query, collection, !first, fields);
            },
            count : (query, collection) => {
                return me.count(true, query, collection);
            },
            aggregate : (pipeline, collection) => {
                return me.aggregate(true, pipeline, collection);
            }
        };

        const update = {
            insert : (record, collection) => {
                return me.insertRecords(true, record, collection);
            },
            updateById : (id, update, upsert, collection) => {
                return me.updateRecord(true, id, update, collection, upsert);
            },
            update : (filter, update, upsert, collection) => {
                return me.updateRecords(true, filter, update, collection, upsert);
            },
            updates : (operations = [], upsert = false) => {
                operations = operations.map(operation => {
                    return { updateOne: { filter: operation.filter, update: {$set: operation.update}, upsert: upsert } }
                });
                return me.bulkWrite(true, operations, collection);
            },
            createIndex : (field, type) => {
                return me.createIndex(true, field, type, collection);
            }
        };

        return Object.assign(read, update);
    }

}

module.exports = State;
