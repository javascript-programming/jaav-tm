class BomenkapMeldpunt {

    constructor (initialState) {
        this.state = initialState || {
            latestId : 0
        };
    }

    updateRecords (features) {
        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to update records');
        }

        const operations = [];

        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            this.state.latestId++;
            feature.properties.beschrijving = feature.properties.description;
            feature.properties.titel = feature.properties.Name;
            delete feature.properties.description;
            delete feature.properties.Name;
            feature.state = 'Goedgekeurd';
            operations.push({ filter : { _id: this.state.latestId }, update: feature });
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

                this.database.query(query, {
                    geometry            : 1,
                    type                : 1,
                    properties          : 1,
                    state               : 1
                }).then(features => {
                    resolve(features);
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
