
import { enableConsole, logs } from './logstore'
let id = 0;
import { get } from "svelte/store";
import { browser } from '$app/environment';
class Err extends Error {
    constructor(message) {
        super(message);
        const _prepareStackTrace = Error.prepareStackTrace;

        this.stacks = []
        Error.prepareStackTrace = (_, callsites) => {
            for (let i = 0; i < callsites.length; i++) {
                let callsite = callsites[i]
                //console.log(callsite.getFileName())
                let stack = {
                    col: callsite.getColumnNumber(),
                    line: callsite.getLineNumber(),
                    name: callsite.getFunctionName(),
                    fileName: callsite.getFileName(),
                    methodName: callsite.getMethodName(),
                    this: callsite.getThis(),
                    type: callsite.getTypeName()
                }

                let k = stack.fileName?.indexOf('/src')
                if (k > 0) {
                    stack.fileName = stack.fileName.substring(k, stack.fileName.length)
                    let p = stack.fileName.indexOf('?t=')
                    if (p > 0) {
                        stack.fileName = stack.fileName.substring(0, p)
                    }
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
            return this.stacks;
        };

        this._stack = this.stack

        Error.prepareStackTrace = _prepareStackTrace;
    }
}

const parseStackTrace = (stackTrace) => {
    const lines = stackTrace.split('\n').map(line => line.trim()).filter(Boolean);

    const parsedStack = lines.map(line => {
        const match = line.match(/^\s*at (\S+) \(([^:]+):(\d+):(\d+)\)$/);


        if (match) {
            const [, functionName, fileName, lineNumber, columnNumber] = match;
            const index = fileName.indexOf("/src");
            return {
                function: functionName,
                fileName: fileName.substring(index),
                line: lineNumber,
                col: columnNumber
            };
        } else {
            // Handle other formats if needed
            return null;
        }
    }).filter(Boolean);

    return parsedStack;
};

function addCalledFrom(stacks) {
    for (let i =0; i< stacks.length-1; i++) {
        stacks[i].calledFrom = {
            fileName: stacks[i+1].fileName
        }
    }
}

export const log = function log(event, nonce) {

    const e = new Error();

    //Server side functions don't have a filename for some reason using our custom Error
    let serverStacks = parseStackTrace(e.stack);
    const err = new Err();
    let stacks = err.stacks;

    if (!browser) {
        for (let i = 0; i < serverStacks.length; i++) {
            let serverStack = serverStacks[i];
            stacks[i].fileName = serverStack.fileName;
        }
    }



    const index = err.stacks.find((s) => s.fileName != null);
    if (!index) {
        return;
    }

    let evalIndex = stacks.findIndex((s) => s.name === 'eval')
    if (evalIndex > 0) {
        let lastStack = stacks[evalIndex];
        stacks = stacks.slice(0, evalIndex);

        stacks.push({
            fileName: lastStack.fileName,
            col: 0,
            row: 0
        })
       // addCalledFrom(err.stacks)
    }

    let loadIndex = stacks.findIndex((s) => s.name === 'load')

    let instanceIndex = stacks.findIndex((s) => s.name === 'instance')

    if (loadIndex > 0) {
        let lastStack = stacks[loadIndex];
        stacks = stacks.slice(0, loadIndex)
        stacks.push({
            fileName: lastStack.fileName,
            col: 0,
            row: 0
        })
    }
    else if (instanceIndex > 0) {
        let lastStack = stacks[instanceIndex];
        stacks = stacks.slice(0, instanceIndex)
        stacks.push({
            fileName: lastStack.fileName,
            col: 0,
            row: 0
        })
    } else {
        const index2 = err.stacks.findLastIndex((s) => s.fileName?.startsWith('/src'))
        stacks = stacks.slice(0, index2 + 1)
        let lastStack = stacks[stacks.length - 1];

        if (lastStack.fileName && lastStack.name) {
            stacks.push({
                fileName: lastStack.fileName,
                col: 0,
                row: 0
            })

        }
    }

    let lastStack = stacks[stacks.length-1];
    let fileDirs = lastStack.fileName.split('/');
    stacks.splice(stacks.length-1)
    for (let i=fileDirs.length-1;i>0;i--) {
        stacks.push(
            {
                fileName: fileDirs[i],
                col: 0,
                row: 0,
                calledFrom: {
                    col: 0,
                    row: 0,
                    fileName: ""
                }
            }
        )
    }

    let newLog = {
        stacks: stacks,
        event: event,
        ts: Date.now(),
        id: (id += 1),
    };

    if (browser) {
        fetch("/postLogs", {
            body: JSON.stringify(newLog),
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            }

        })
    } else {
        logs.update((logs) => logs.concat(newLog));
    }
    if (get(enableConsole)) {
        console.log(event)
    }
}

export const logToConsole = function log(val) {
    enableConsole.set(val)
}



