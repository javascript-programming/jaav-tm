class State {

    constructor (mongo) {

        const me = this;

        me.getAccount = (id) => {
            return new Promise((resolve, reject) => {
                mongo.database.accounts.find({ _id: id }).then(cursor => {
                    resolve(cursor.toArray()[0]);
                }).catch(reject);
            });
        };

        me.getContract = (id) => {
            return new Promise((resolve, reject) => {
                mongo.database.contracts.find({ _id: id }).then(cursor => {
                    resolve(cursor.toArray()[0]);
                }).catch(reject);
            });
        };

        me.getRecord = async (id, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database[collection].find({ _id: id }).then(cursor => {
                    resolve(cursor.toArray()[0]);
                }).catch(reject);
            });
        };

        me.insertRecord = async (record, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database[collection].insert(record, { session: mongo.session }).then(resolve).catch(reject)
            });
        };

        me.updateRecord = async (id, update, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database[collection].update({ _id : id},{ $set: update }, { session: mongo.session }).then(resolve).catch(reject)
            });
        };
    }
}

module.exports = State;
