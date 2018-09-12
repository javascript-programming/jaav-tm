class MyChat {

    constructor (initialState) {
        this.state = initialState || {
            members  : {}
        };
    }

    register (account, name) {

        if(this.state.members[account])
            throw new Error('Account already registered');

        if (caller === account) {
            transfer(account, owner, 1, 'Chat fee');

            this.state.members[account] = name;
            this.state.members[account].messages = [];
        }
    }

    sendMessage (account, message, to, time) {

        if (caller === account) {
            const members = this.state.members;

            if (members[account] && members[to]) {
                members[to].messages.push({ from : account, message, time : time });
            }
        } else {
            throw new Error('You need to be the sender');
        }
    }

    getMessages (account) {

        if (caller === account) {

            const members = this.state.members;

            if (members[account]) {
                return members[account].messages;
            }
        } else {
            throw new Error('You need to be the sender');
        }
    }
}
