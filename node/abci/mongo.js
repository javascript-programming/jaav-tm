const { MongoClient } = require('mongodb');

class Mongo {

    constructor (host = 'jaav.eu', port = 27017, user, password, database) {
        this.client = new MongoClient("mongodb://" + user + ":" + password + "@" + host + ":" + port + "/" + database);
    }

    async connect () {
        this.isConnected = true;
        this.connection = await this.client.connect();
    }

    get database () {
        return this.client.db();
    }

    async getHash () {

        const wasConnected = this.isConnected;
        if (!this.isConnected)
            this.connect();

        const result = await this.database.command({ dbHash: 1 });

        if (!wasConnected)
            this.close();

        return result.md5;
    }

    async beginTransaction () {
        this.connect();
        this.session = this.client.startSession();
        this.session.startTransaction();
    }

    async abortTransaction () {

        if (this.session) {
            await this.session.abortTransaction();
            this.session.endSession();
        }

        this.close();
    }

    async endTransaction () {
        await this.session.commitTransaction();
        this.session.endSession();
        this.close();
    }

    async close () {
        await this.client.close(true);
        this.isConnected = false;
        this.connection = null;
        this.session = null;
    }

}

module.exports = Mongo;
