const readline = require('readline-utils');

class Console {

    constructor (functions) {

        this.functions = functions || {};

        this.rl = readline.createInterface({
            input : process.stdin,
            output: process.stdout
        });

        const prompt = (msg) => {
            this.newPrompt(msg).then(prompt).catch(prompt);
        };

        prompt.bind(this)();
    }

    getFunctions () {
        return this.functions;
    }

    setFunction (name, fn) {
        this.functions[name] = fn;

        if (!fn.async) {

            const rawFn = fn.handler;

            fn.handler = (...params) => {

                return new Promise((resolve, reject) => {
                    try {
                        resolve(rawFn.apply(fn.scope || this, params));
                    } catch (err) {
                        reject(err.message);
                    }
                });
            }
        }
    }

    askParam (param) {

        let me = this;

        return new Promise((resolve, reject) => {

            setTimeout( ()=> {
                me.rl.output.write(' : ')
            }, 200 );

            this.rl.question(`Param value for ${param}`, (answer) => {
                resolve(answer)
            });
        })
    }

    newPrompt (msg) {

        const me = this;
        if (msg)
            console.log(msg);

        return new Promise((resolve, reject) => {

            setTimeout( ()=> {
                me.rl.output.write(' > ')
            }, 200 );

            me.rl.question('jaav-tm', async (answer) => {

                const fn = this.functions[answer];

                if (fn && !fn.hidden) {

                    const params = fn.params.slice();
                    let answers = [];

                    const processParams = (answer, start) => {

                        if (!start)
                            answers.push(answer);

                        const param = params.shift();

                        if (param) {
                            me.askParam(param).then(processParams).catch(reject);
                        } else {
                            if (fn.handler) {
                                fn.handler.apply(fn.scope || this, answers).then(resolve).catch(reject);
                            } else {
                                reject('Command has no handle');
                            }
                        }
                    };

                    processParams(null, true);

                } else {
                    reject('Command not found');
                }
            });
        });
    }
}

module.exports = Console;
