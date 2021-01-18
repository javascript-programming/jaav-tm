const TU = require('../common/transactionutils');
const CronJob = require('cron').CronJob;
const Fetch = require('./fetch');

class Automation {

    constructor(functions, rebuild) {
        this.variables = {};
        this.functions = functions;
        this.jobs = {};
        this.rebuild = rebuild;
    }

    async executeActions (actions = []) {

        const me = this;

        for (let i = 0; i < actions.length; i++) {

            const action = actions[i];

            if (action.cron) {

                const jobId = 'job' + i;
                me.jobs[jobId] = {
                    action: action
                };

                me.jobs[jobId].job = new CronJob({
                        cronTime: action.cron,
                        context : me,
                        start: true,
                        runOnInit: action.runOnInit,
                        onTick  : () => {
                            me.executeCommand(this.jobs[jobId].action).then(() => {
                                console.log('Job executed');
                            }).catch(err => {
                                console.log(err.message);
                            });
                        }
                    });
            } else {
                if (me.rebuild) {
                    await me.executeCommand(action).catch(err => {
                        console.log(err.message);
                        i = actions.length;
                        console.log('Stopped executing actions');
                    });
                }
            }
        }
    }

    async executeCommand (action) {

        return new Promise(async (resolve, reject) => {

            try {

                let result = null;

                if (action.fetch) {

                    let filter = null;

                    if (action.fetch.filter) {
                        try {
                            eval('filter = ' + action.fetch.filter);
                        } catch (err) {}
                    }

                    this.variables[action.fetch.variable || "fetch"] = await Fetch.data(action.fetch.url, action.fetch.params, filter);
                }

                if (action.cmd) {
                    let params = action.params || [];
                    params = params.map(item => (item && item.startsWith && item.startsWith('$')) ? this.variables[item.substring(1)] : item);

                    result = this.functions[action.cmd].handler(...params);

                    if (result instanceof Promise) {
                        result = await result;
                    }

                    if (result && result.jsonrpc && result.result) {
                           try {
                               result = TU.parseJson(TU.convertHexToString(result.result.data));
                           } catch (err) {
                               console.log(result.result.log);
                        }
                    }

                    console.log(result);
                }

                if (action.variable) {

                    if (action.value) {
                        this.variables[action.variable] = action.value;
                    }

                    if (result !== null) {
                        this.variables[action.variable] = result[action.key || action.variable] || result;
                    }
                }

                resolve();
            }
            catch (err) {
                reject(err);
            }
        });

    }

}

module.exports = Automation;
