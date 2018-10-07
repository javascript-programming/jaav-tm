import { WidgetHelper,Toast,Popup,Scheduler,EventModel} from 'https://www.bryntum.com/examples/build/scheduler.module.js?1538392410036';
import shared from './shared.module.js?1538392410036';
import BasicData from './contract/data.js';
/* eslint-disable no-unused-vars */

//region Data
//Use ws://5.157.85.181:3000 to see synced results with other node
const webclient = new window.WebClient('ws://' + window.location.host);
webclient.connect().then(async() => {
    let address = window.location.search.substring(1);
    let caller;

    if (!address) {
        const accounts = await webclient.getAccounts();
        caller = accounts[0];
        await webclient.upload(BasicData);
        const deploy = await webclient.deploy(caller, '1234', 'BasicData');
        address = deploy.address;
    }
    else {
        //create a new account for friend, then he or she will see updated coming in
        const newAccount = await webclient.createAccount('1234');
        caller = newAccount.address;
    }

    const shareLink = window.location.href + '?' + address;
    const data = await webclient.getContract(address, caller);
    const resources = await data.getResources(),
        events = await data.getEvents();

    let scheduler, popup;
    //endregion

    const [commitButton] = WidgetHelper.append([
        {
            type     : 'button',
            text     : 'Commit',
            icon     : 'b-icon fa-save',
            disabled : true,
            color    : 'b-blue b-raised',
            tooltip  : 'Put changes in chain',
            onAction : () => {
                saveChanges();
            }
        },
        {
            type     : 'button',
            text     : 'Share this scheduler with your friends!',
            icon     : 'b-icon fa-address-card',
            color    : 'b-blue b-raised',
            tooltip  : 'Share url',
            onAction : () => {
                if (!popup) {
                    popup = new Popup({
                        forElement : document.querySelector('button'),
                        width      : 400,
                        widgets    : [
                            {
                                type     : 'text',
                                id       : 'sharelink',
                                value    : shareLink,
                                readOnly : true
                            },
                            {
                                type     : 'button',
                                text     : 'Copy',
                                style    : 'width: 100%',
                                color    : 'b-blue b-raised',
                                onAction : () => {
                                    const field = document.getElementById('sharelink').querySelector('input');
                                    field.setSelectionRange(0, field.value.length);
                                    field.focus();
                                    document.execCommand('copy');
                                    popup.hide();
                                }
                            }
                        ]
                    });
                }
                else {
                    popup.show();
                }
            }
        }
    ], {insertFirst : document.getElementById('tools') || document.body});

    scheduler = new Scheduler({
        appendTo         : 'container',
        minHeight        : '20em',
        resources        : resources,
        events           : events,
        startDate        : new Date(2017, 0, 1, 6),
        endDate          : new Date(2017, 0, 1, 20),
        viewPreset       : 'hourAndDay',
        rowHeight        : 50,
        barMargin        : 5,
        multiEventSelect : true,

        columns : [
            {text : 'Name', field : 'name', width : 130}
        ]
    });

    scheduler.eventStore.on('change', () => {
        commitButton.disabled = false;
    });

    scheduler.resourceStore.on('change', () => {
        commitButton.disabled = false;
    });

    data.onUpdateEvents = (result, options) => {
        result.forEach(event => {
            const clientEvent = scheduler.eventStore.getById(event.id);
            if (clientEvent) {
                if (options.caller !== caller) {
                    clientEvent.set(event);
                    clientEvent.clearChanges();
                    commitButton.disabled = !eventStoreHasChanges();
                }
                Toast.show('Event ' + event.id + ' updated in chain');
            }
        });
    };

    data.onAddEvents = (result, options) => {
        const me = this;
        if (options.caller === caller) {
            result.forEach(event => {
                const clientEvent = scheduler.eventStore.getById(event.clientId);
                clientEvent.id = event.id;//get a drag error when using silent set
                clientEvent.clearChanges();
                commitButton.disabled = !eventStoreHasChanges();
                Toast.show('Event ' + event.id + ' added to chain');
            }, me);
        }
        else {
            result.forEach(event => {
                scheduler.eventStore.add(event, true);
                Toast.show('Event ' + event.id + ' added to chain');
            }, me);
        }
    };

    data.onRemoveEvents = (result, options) => {
        const me = this;

        result.forEach(id => {
            if (options.caller !== caller) {
                scheduler.eventStore.remove(id, true);
            }

            Toast.show('Event ' + id + ' removed from chain');
        }, me);
    };

    data.onUpdateResources = (result, options) => {
        result.forEach(resource => {
            const clientResource = scheduler.resourceStore.getById(resource.id);
            if (clientResource) {
                if (options.caller !== caller) {
                    clientResource.set(resource, true);
                }
                Toast.show('Resource ' + resource.id + ' updated in chain');
            }
        });
    };

    data.onRemoveResources = (result, options) => {
        const me = this;

        result.forEach(id => {
            if (options.caller !== caller) {
                scheduler.resourceStore.remove(id, true);
            }

            Toast.show('Resource ' + id + ' removed from chain');
        }, me);
    };

    const eventStoreHasChanges = () => {
        const eventStore = scheduler.eventStore;
        return eventStore.modified.length || eventStore.added.length || eventStore.removed.length;
    };

    const saveChanges = () => {
        commitButton.disabled = true;

        const getData = records => records.map(record => record.data);

        const eventStore = scheduler.eventStore;
        const resourceStore = scheduler.resourceStore;

        const events = {
            modified : getData(eventStore.modified),
            added    : getData(eventStore.added),
            removed  : getData(eventStore.removed)
        };

        const resources = {
            modified : getData(resourceStore.modified),
            added    : [],
            removed  : getData(resourceStore.removed)
        };

        eventStore.commit();
        resourceStore.commit();

        const update = async(changes, target) => {
            let result;

            if (changes.modified.length) {
                result = await data['update' + target](changes.modified);
                Toast.show(result.log);
            }

            if (changes.added.length) {
                result = await data['add' + target](changes.added);
                Toast.show(result.log);
            }

            if (changes.removed.length) {
                result = await data['remove' + target](changes.removed);
                Toast.show(result.log);
            }
        };

        update(events, 'Events');
        update(resources, 'Resources');
    };
});
