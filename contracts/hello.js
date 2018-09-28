class HelloWorld {

    constructor (initialState) {
        this.state = initialState || {
            greeting : 'Hello'
        };
    }

    hello (world) {
        return this.state.greeting + ' ' + world;
    }

    setObject (obj) {
        this.state.obj = obj;
    }

    getObject () {
        return this.state.obj;
    }

    setGreeting (greeting) {
        this.state.greeting = greeting;
    }

}
