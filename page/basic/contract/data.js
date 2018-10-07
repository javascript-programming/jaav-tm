export default class BasicData {
    constructor(initialState) {
        this.state = initialState || {
            resources : [
                { id : 'r1', name : 'Mats' },
                { id : 'r2', name : 'Johan' },
                { id : 'r3', name : 'Arcady' },
                { id : 'r4', name : 'Goran' },
                { id : 'r5', name : 'Terence' },
                { id : 'r6', name : 'Pavel' },
                { id : 'r7', name : 'Max' },
                { id : 'r8', name : 'Max Senior' },
                { id : 'r9', name : 'Nige' },
                { id : 'r9', name : 'Nick' }
            ],
            events : [
                {
                    id         : 'e1',
                    resourceId : 'r1',
                    startDate  : '2017-01-01 07:00',
                    endDate    : '2017-01-01 12:00',
                    name       : 'Do marketing',
                    iconCls    : 'fa fa-mouse-pointer'
                },
                {
                    id         : 'e2',
                    resourceId : 'r2',
                    startDate  : '2017-01-01 12:00',
                    endDate    : '2017-01-01 13:30',
                    name       : 'Review MR',
                    iconCls    : 'fa fa-arrows'
                },
                {
                    id         : 'e3',
                    resourceId : 'r3',
                    startDate  : '2017-01-01 14:00',
                    endDate    : '2017-01-01 16:00',
                    name       : 'Release day',
                    eventColor : 'purple',
                    iconCls    : 'fa fa-mouse-pointer'
                },
                {
                    id         : 'e4',
                    resourceId : 'r4',
                    startDate  : '2017-01-01 08:00',
                    endDate    : '2017-01-01 11:00',
                    name       : 'Sign contracts',
                    iconCls    : 'fa fa-mouse-pointer'
                },
                {
                    id         : 'e5',
                    resourceId : 'r5',
                    startDate  : '2017-01-01 15:00',
                    endDate    : '2017-01-01 17:00',
                    name       : 'Consultancy and Tickets',
                    iconCls    : 'fa fa-arrows-alt-h'
                },
                {
                    id         : 'e6',
                    resourceId : 'r6',
                    startDate  : '2017-01-01 16:00',
                    endDate    : '2017-01-01 19:00',
                    name       : 'Fix calendar stuff',
                    iconCls    : 'fa fa-exclamation-triangle',
                    eventColor : 'red'
                },
                {
                    id         : 'e7',
                    resourceId : 'r6',
                    startDate  : '2017-01-01 06:00',
                    endDate    : '2017-01-01 08:00',
                    name       : 'Answer forum questions',
                    iconCls    : 'fa fa-basketball-ball'
                },
                {
                    id         : 'e8',
                    resourceId : 'r7',
                    startDate  : '2017-01-01 09:00',
                    endDate    : '2017-01-01 11:00',
                    name       : 'Dentist',
                    iconCls    : 'fa fa-birthday-cake'
                }
            ],
            noOfEvents    : 8
        };
    }

    getEvents() {
        return this.state.events;
    }

    getEvent(id) {
        return this.state.events.find(item => item.id === id);
    }

    addEvent(event) {
        this.state.noOfEvents++;
        const clientId = event.id;
        event.id = 'e' + this.state.noOfEvents;
        this.state.events.push(event);
        event.clientId = clientId;
    }

    addEvents(events) {
        events = events || [];
        events.forEach(event => this.addEvent(event), this);
        return events;
    }

    updateEvent(event) {
        const oldEvent = this.getEvent(event.id);
        if (oldEvent) {
            Object.assign(oldEvent, event);
        }
    }

    updateEvents(events) {
        events = events || [];
        events.forEach(event => this.updateEvent(event), this);
        return events;
    }

    removeEvent(id) {
        const index = this.state.events.indexOf(this.getEvent(id));
        (index !== -1) && this.state.events.splice(index, 1);
    }

    removeEvents(ids) {
        ids = ids || [];
        ids.forEach(id => this.removeEvent(id), this);
        return ids;
    }

    getResources() {
        return this.state.resources;
    }

    updateResource(resource) {
        const oldResource = this.getResource(resource.id);
        if (oldResource) {
            Object.assign(oldResource, resource);
        }
    }

    updateResources(resources) {
        resources = resources || [];
        resources.forEach(resource => this.updateResource(resource), this);
        return resources;
    }

    removeResource(id) {
        const index = this.state.resources.indexOf(this.getEvent(id));
        (index !== -1) && this.state.resources.splice(index, 1);
    }

    removeResources(ids) {
        ids = ids || [];
        ids.forEach(id => this.removeResource(id), this);
        return ids;
    }
}
