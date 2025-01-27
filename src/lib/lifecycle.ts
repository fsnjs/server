import chalk from 'chalk';

import type { ExitHandler } from './types.js';

const exitEvents: Function[] = [];

export function registerOnExitEvent(event: Function) {
    exitEvents.push(event);
}

export function executeOnExitEvents() {
    exitEvents.forEach((event) => event());
}

const EXIT = 'exit';
const CTRL_C = 'SIGINT';
const KILL_PID_1 = 'SIGUSR1';
const KILL_PID_2 = 'SIGUSR2';
const UNCAUGHT = 'uncaughtException';

export function registerExitHandler(handler: ExitHandler = defaultExitHandler) {
    // Stop the program from instantly closing
    process.stdin.resume();
    process
        .on(EXIT, (code) => handler(code))
        .on(CTRL_C, (code) => handler(code))
        .on(KILL_PID_1, (code) => handler(code))
        .on(KILL_PID_2, (code) => handler(code))
        .on(UNCAUGHT, (error) => handler(-1, error, false));
}

/**
 * Bound to the exit processes.
 * @param exitCode The application exit code
 * @param error If an error is thrown for uncaught errors
 * @param exit Whether `process.exit()` should be called
 */
function defaultExitHandler(
    exitCode: number | string,
    error?: Error,
    exit = true
) {
    if (exitCode !== -1) {
        const msg = (() => {
            if (typeof exitCode !== 'string') return;

            switch (exitCode) {
                case EXIT:
                    return chalk.blue(
                        `\nTerminating process with exit code ${exitCode}.`
                    );
                default:
                    return chalk.blue('Application terminated');
            }
        })();
        if (msg) console.log(msg);
    }

    if (error) {
        console.error('An uncaught exception occurred:');
        console.error(error);
    }

    executeOnExitEvents();

    if (exit) process.exit();
}
