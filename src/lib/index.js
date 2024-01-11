import { persisted } from 'svelte-local-storage-store'

export const logs = persisted('logs', [])

let id = 0;

class Err extends Error {
    constructor(message) {
        super(message);
        const _prepareStackTrace = Error.prepareStackTrace;

        this.stacks = []
        Error.prepareStackTrace = (_, callsites) => {
            for (let i = 0; i < callsites.length; i++) {
                let callsite = callsites[i]
                let stack = {
                    col: callsite.getColumnNumber(),
                    line: callsite.getLineNumber(),
                    name: callsite.getFunctionName(),
                    fileName: callsite.getFileName(),
                }
                let k = stack.fileName?.indexOf('/src')
                if (k >0) {
                    stack.fileName = stack.fileName.substring(k, stack.fileName.length)
                    let p  = stack.fileName.indexOf('?t=')
                    stack.fileName = stack.fileName.substring(0, p)
                }
                console.log("indexOf",stack.fileName)
                if (i < callsites.length-1) {
                    //console.log(callsites)
                    //console.log(stack, callsites[i-1].getFunctionName())
                    stack.calledFrom ={
                        function: callsites[i+1].getFunctionName(),
                        col: callsites[i+1].getColumnNumber(),
                        line: callsites[i+1].getLineNumber(),
                    }
                }
                this.stacks.push(stack)

            }
        };

        this._stack = this.stack

        Error.prepareStackTrace = _prepareStackTrace;
    }
}


export const log = function log(event, nonce) {
    console.log(logs)
    const err = new Err();
    let stacks = err.stacks;

    const index = err.stacks.findIndex((s) => s.name == null)
    stacks = stacks.slice(0, index + 1)
    logs.update((logs) => logs.concat({
        stacks: stacks,
        event: event,
        ts: Date.now(),
        id: (id += 1),
    }));

}

