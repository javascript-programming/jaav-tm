class HelloWorld {

    constructor (initialState) {
        this.state = initialState || {
            greeting : 'Hello'
        };
    }

    hello (world) {
        return this.state.greeting + ' ' + world;
    }

    setGreeting (greeting) {
        this.state.greeting = greeting;
    }

    setData(data) {
        return this.database.insert(data);
    }

    getData(query) {
        return this.database.query(query);
    }
}
