const { MongoClient } = require('mongodb');

class Mongo {

    constructor (host = 'jaav.eu', port = 27017, user, password, database) {
        this.client = new MongoClient("mongodb://" + user + ":" + password + "@" + host + ":" + port + "/" + database, { poolSize: 20, useNewUrlParser: true, useUnifiedTopology: true });
    }

     connect () {
        const me = this;
        return new Promise((resolve, reject) => {
            me.connection = this.client.connect().then(connection => {
                me.connection = connection;
                me.isConnected = true;
                resolve(me.connection);
            }).catch(reject);
        });
    }

    get database () {
        return this.client.db();
    }

    getHash () {
        return new Promise((resolve, reject) => {
            this.database.command({ dbHash: 1 }).then(result => {
                resolve(result.md5);
            }).catch(reject);
        });
    }

    beginTransaction (state) {
        state.session = this.client.startSession();
        state.session.startTransaction();
    }

    abortTransaction (state) {
        return new Promise((resolve, reject) => {
            if (state.session) {
                state.session.abortTransaction().then(() => {
                    state.session.endSession();
                    state.session = null;
                    resolve();
                }).catch(reject);
            } else {
                resolve();
            }
        });
    }

    endTransaction (state) {
        return new Promise((resolve, reject) => {
            state.session.commitTransaction().then(() => {
                state.session.endSession();
                state.session = null;
                resolve();
            }).catch(reject);
        });
    }

     async close () {
        await this.client.close(true);
        this.connection = null;
    }

}

module.exports = Mongo;
