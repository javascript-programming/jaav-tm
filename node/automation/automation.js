const TU = require('../common/transactionutils');
const CronJob = require('cron').CronJob;

class Automation {

    constructor(functions) {
        this.variables = {};
        this.functions = functions;
        this.jobs = {};
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

                await me.executeCommand(action).catch(err => {
                    console.log(err.message);
                    i = actions.length;
                    console.log('Stopped executing actions');
                });
            }
        }
    }

    async executeCommand (action) {

        return new Promise(async (resolve, reject) => {

            try {

                let result = null;

                if (action.cmd) {
                    let params = action.params || [];
                    params = params.map(item => (item && item.startsWith && item.startsWith('$')) ? this.variables[item.substring(1)] : item);

                    result = this.functions[action.cmd].handler(...params);

                    if (result instanceof Promise) {
                        result = await result;
                    }

                    if (result && result.jsonrpc && result.result) {
                        result = TU.parseJson(TU.convertHexToString(result.result.data));
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
