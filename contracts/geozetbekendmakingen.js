class GeozetBekendmakingen {

    constructor (initialState) {
        this.state = initialState || {};
    }

    oracleInsertRecord (record) {

        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to add record');
        }

        return this.oracle.insert(record, 'geozetkapaanvragen');
    }

    oracleUpdateRecords (features) {
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

        return this.oracle.updates(operations, true, 'geozetkapaanvragen');
    }

    oracleCreateGeoIndex (field) {

        if (this.caller !== this.owner) {
            throw new Error('This account has no permission to set an index');
        }

        return this.oracle.createIndex(field, "2dsphere", 'geozetkapaanvragen');
    }
}
