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
            this.state.latestId++;
            feature.properties.beschrijving = feature.properties.description;
            feature.properties.titel = feature.properties.Name;
            delete feature.properties.description;
            delete feature.properties.Name;
            feature.state = feature.state || 'Goedgekeurd';
            operations.push({ filter : { _id: this.state.latestId }, update: feature});
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
