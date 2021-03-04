class Meldpunt {

    constructor(initialState) {
        this.state = initialState || {
            latestId : 15,
            contracts: {
                cutNotifications    : null,
                biomassFacilities   : null,
                cutPermissions      : null,
                replantNotifications: null
            }
        };
    }

    checkPermission() {
        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to update records');
        }
    }

    setCutNotificationAddress(address) {
        this.checkPermission();
        this.state.contracts.cutNotifications = address;
    }

    setBiomassFacilityAddress(address) {
        this.checkPermission();
        this.state.contracts.biomassFacilities = address;
    }

    setCutPermissionAddress(address) {
        this.checkPermission();
        this.state.contracts.cutPermissions = address;
    }

    setReplantNotificationAddress(address) {
        this.checkPermission();
        this.state.contracts.replantNotifications = address;
    }

    getContracts() {
        return this.state.contracts;
    }

    getCutNotifications(polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.cutNotifications);
    }

    getReplantNotifications(polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.replantNotifications);
    }

    getBiomassFacilities(polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.biomassFacilities);
    }

    getCutPermissions(polygone, state) {
        return this.getLocations(polygone, state, this.oracle, 'geozetkapaanvragen');
    }

    getNewNotifications(polygone, state) {
        return this.getLocations(polygone, state, this.oracle, 'meldingen');
    }

    getAllFeaturesets(polygone, state) {
        return new Promise(async (resolve, reject) => {
            resolve({
                cutNotifications    : await this.getCutNotifications(polygone, state),
                replantNotifications: await this.getReplantNotifications(polygone, state),
                biomassFacilities   : await this.getBiomassFacilities(polygone, state),
                cutPermissions      : await this.getCutPermissions(polygone, state)
            })
        });
    }

    getLocations(polygone, state, db, collection) {

        db = db || this.database;

        if (collection.toLowerCase() === 'meldingen') {
            this.checkPermission();
        }

        return new Promise((resolve, reject) => {
            try {

                const query = {};

                if (polygone) {
                    query.geometry = {
                        $geoWithin: {
                            $geometry: {
                                type       : "Polygon",
                                coordinates: [polygone]
                            }
                        }
                    };
                }

                if (state && state.length) {
                    query.state = {$in: state};
                }

                db.query(query, {
                    geometry  : 1,
                    type      : 1,
                    properties: 1,
                    state     : 1
                }, collection).then(features => {
                    resolve(features);
                });
            } catch (err) {
                throw new Error(err.message);
            }
        });
    }

    oracleCreateGeoIndex(field) {

        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to set an index');
        }

        return this.oracle.createIndex(field, "2dsphere", 'meldingen');
    }

    reserveId() {
        this.state.latestId++;
        return this.state.latestId;
    }

    oracleInsertRecord(record) {
        return this.oracle.insert(record, 'meldingen');
    }

    oracleUpdateRecords(features) {

        this.checkPermission();

        const operations = [];

        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            operations.push({filter: {_id: feature._id}, update: feature});
        }

        return this.oracle.updates(operations, true, 'meldingen');
    }

    getImages (id) {
        return this.oracle.query({ _id: id, state: 'Gepubliceerd' }, { 'properties.images': 1 }, 'meldingen');
    }
}
