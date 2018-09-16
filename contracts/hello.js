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

}
