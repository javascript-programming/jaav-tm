const { MongoClient } = require('mongodb');

class Mongo {

    constructor (host = 'localhost', port = 27017, user, password, database) {
        this.client = new MongoClient("mongodb://" + user + ":" + encodeURIComponent(password) + "@" + host + ":" + port + "/" + database
            , { poolSize: 20,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                authSource: 'admin'
        });
    }

     connect (clear = true) {
        const me = this;
        return new Promise((resolve, reject) => {
            me.connection = this.client.connect().then(connection => {
                me.connection = connection;
                me.isConnected = true;
                if (clear) {
                    this.clearDatabase().then(resolve);
                } else {
                    resolve();
                }
            }).catch(reject);
        });
    }

    clearDatabase () {
        return new Promise(async (resolve, reject) => {
            const collections = await this.database.collections();
            for (let i = 0; i < collections.length; i++) {
                await collections[i].drop();
            }
            resolve();
        });
    }

    get database () {
        return this.client.db();
    }

    getHash () {
        return new Promise((resolve, reject) => {
            this.database.command({ dbHash: 1, collections: ['accounts', 'contracts' ]}).then(result => {
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
            if (state.session) {
                state.session.commitTransaction().then(() => {
                    state.session.endSession();
                    state.session = null;
                    resolve();

                }).catch(reject);
            } else (resolve())
        });
    }

     async close () {
        await this.client.close(true);
        this.connection = null;
    }

}

module.exports = Mongo;
