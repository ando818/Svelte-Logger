
import { enableConsole, logs } from './logstore'
let id = 0;
import { get } from "svelte/store";

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
                if (k > 0) {
                    stack.fileName = stack.fileName.substring(k, stack.fileName.length)
                    let p = stack.fileName.indexOf('?t=')
                    stack.fileName = stack.fileName.substring(0, p)
                }
                if (i < callsites.length - 1) {
                    stack.calledFrom = {
                        function: callsites[i + 1].getFunctionName(),
                        col: callsites[i + 1].getColumnNumber(),
                        line: callsites[i + 1].getLineNumber(),
                    }
                } else {
                    stack.calledFrom = {
                        function: callsites[i].getFunctionName(),
                        col: callsites[i].getColumnNumber(),
                        line: callsites[i].getLineNumber(),
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
    const err = new Err();
    let stacks = err.stacks;

    const index = err.stacks.findLastIndex((s) => s.fileName?.startsWith('/src'))

    stacks = stacks.slice(0, index + 1)
    if (stacks[stacks.length - 1].fileName && stacks[stacks.length - 1].name) {
        stacks.push({
            fileName: stacks[stacks.length - 1].fileName,
            col: 0,
            row: 0
        })
    }
    logs.update((logs) => logs.concat({
        stacks: stacks,
        event: event,
        ts: Date.now(),
        id: (id += 1),
    }));
    if (get(enableConsole)) {
        console.log(event)
    }
}

export const logToConsole = function log(val) {
    enableConsole.set(val)
}



