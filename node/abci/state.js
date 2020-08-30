class State {

    constructor (mongo) {

        const me = this;

        me.getAccount = async (id) => {
            return await mongo.database.accounts.find({ _id: id }).toArray()[0];
        };

        me.getContract = async (id) => {
            return await mongo.database.contracts.find({ _id: id }).toArray()[0];
        };

        me.getRecord = async (id, collection) => {
           return await mongo.database[collection].find({ _id: id }).toArray()[0];
        };

        me.insertRecord = async (record, collection) => {
            return await mongo.database[collection].insert(record, { session: mongo.session });
        };

        me.updateRecord = async (id, update, collection) => {
            return await mongo.database[collection].update({ _id : id},{ $set: update }, { session: mongo.session });
        };
    }
}

module.exports = State;
