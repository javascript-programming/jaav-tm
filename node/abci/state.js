class State {

    constructor (mongo) {

        const me = this;

        me.getAccount = (id) => {
            return this.getRecord(id, 'accounts');
        };

        me.getContract = (id) => {
            return this.getRecord(id, 'contracts');
        };

        me.getRecord = async (id, collection) => {
            const cursor = mongo.database.collection(collection).find({ _id: id });

            return new Promise((resolve, reject) => {
                return cursor.toArray().then(result => {
                    resolve(result[0]);
                }).catch(reject);
            });
        };

        me.insertRecord = async (record, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).insertOne(record, { session: this.session }).then(resolve).catch(reject)
            });
        };

        me.updateRecord = async (id, update, collection) => {
            return new Promise((resolve, reject) => {
                mongo.database.collection(collection).updateOne({ _id : id},{ $set: update }, { session: this.session }).then(resolve).catch(reject)
            });
        };
    }
}

module.exports = State;
