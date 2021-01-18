class GeozetBekendmakingen {

    constructor (initialState) {
        this.state = initialState || {};
    }

    insertRecord (record) {

        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to add record');
        }

        return this.database.insert(record);
    }

    updateRecords (features) {
        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to update records');
        }

        const operations = [];

        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            feature.state = feature.properties.titel.indexOf('Aanvraag omgevingsvergunning') !== -1 ? 'Aanvraag' : 'Verleend';
            feature.state = feature.properties.titel.indexOf('Geweigerde omgevingsvergunning') !== -1 ? 'Geweigerd' : feature.state;

            operations.push({ filter : { _id: feature.properties.oid }, update: feature});
        }

        return this.database.updates(operations, true);
    }

    createGeoIndex (field) {

        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to set an index');
        }

        if (!this.state.indexCreated) {
            this.state.indexCreated = true;
            return this.database.createIndex(field, "2dsphere");
        } else {
            throw new Error('Index was already created');
        }
    }

    getLocations (polygone, state, types) {

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

                if (types && types.length) {
                    query['properties.name'] = { $in: types };
                }

                this.database.query(query, {
                    geometry            : 1,
                    type                : 1,
                    'properties.datum'  : 1,
                    state               : 1
                }).then(features => {
                    resolve(this.processFeatures(features));
                });
            } catch (err) {
                throw new Error(err.message);
            }
        });
    }

    getData (query, fields) {
        return this.database.query(query, fields);
    }

    getAggregatedData (pipeline) {
        return this.database.aggregate(pipeline);
    }

    getCount (query) {
        return this.database.count(query);
    }
}
