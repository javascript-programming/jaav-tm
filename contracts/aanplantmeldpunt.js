class AanplantMeldpunt {

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

            let id = feature._id;

            if (!id) {
                this.state.latestId++;
                id = this.state.latestId;
            }

            if (feature.properties.description) {
                feature.properties.beschrijving = feature.properties.description;
                delete feature.properties.description;
            }

            if (feature.properties.Name) {
                feature.properties.titel = feature.properties.Name;
                delete feature.properties.Name;
            }

            feature.state = feature.state || 'Goedgekeurd';
            operations.push({ filter : { _id: id }, update: feature });
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
}
