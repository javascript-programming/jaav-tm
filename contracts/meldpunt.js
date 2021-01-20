class Meldpunt {

    constructor (initialState) {
        this.state = initialState || {
            latestId : 0,
            contracts : {
                cutNotifications: null,
                biomassFacilities: null,
                cutPermissions: null,
                replantNotifications: null
            }
        };
    }

    checkPermission () {
        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to update records');
        }
    }

    setCutNotificationAddress (address) {
        this.checkPermission();
        this.state.contracts.cutNotifications = address;
    }

    setBiomassFacilityAddress (address) {
        this.checkPermission();
        this.state.contracts.biomassFacilities = address;
    }

    setCutPermissionAddress (address) {
        this.checkPermission();
        this.state.contracts.cutPermissions = address;
    }

    setReplantNotificationAddress (address) {
        this.checkPermission();
        this.state.contracts.replantNotifications = address;
    }

    getContracts() {
        return this.state.contracts;
    }

    getCutNotifications (polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.cutNotifications);
    }

    getReplantNotifications (polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.replantNotifications);
    }

    getBiomassFacilities (polygone, state) {
        return this.getLocations(polygone, state, this.database, this.state.contracts.biomassFacilities);
    }

    getCutPermissions (polygone, state) {
        return this.getLocations(polygone, state, this.oracle, 'geozetkapaanvragen');
    }

    getLocations (polygone, state, db, collection) {

        db = db || this.database;

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
                    query.state = { $in: state };
                }

                db.query(query, {
                    geometry            : 1,
                    type                : 1,
                    properties          : 1,
                    state               : 1
                }, collection).then(features => {
                    resolve(features);
                });
            } catch (err) {
                throw new Error(err.message);
            }
        });
    }
}
