import Chalk from 'chalk';
import { isNativeError } from 'util/types';
import { logPrefix } from './log.js';

export function registerFusionLogging() {
    const colorize = (args: any[], colorFn: Function) =>
        args.map(
            (arg) =>
                logPrefix().toString() +
                (typeof arg === 'object' ? arg : colorFn(arg))
        );

    const log = console.log;
    console.log = (...args) =>
        log(
            ...args.flatMap((arg) => {
                if (typeof arg === 'object')
                    return [logPrefix().toString() + 'Object:\n', arg];
                return logPrefix().toString() + arg;
            })
        );

    const debug = console.debug;
    console.debug = (...args) => debug(...colorize(args, Chalk.gray));

    const warn = console.warn;
    console.warn = (...args) => warn(...colorize(args, Chalk.yellow));

    const info = console.info;
    console.info = (...args) => info(...colorize(args, Chalk.cyan));

    const error = console.error;
    console.error = (...args) => {
        args.forEach((arg) => {
            if (isNativeError(arg)) {
                // error(Chalk.red(arg.stack));
                error(
                    logPrefix().toString(),
                    Chalk.red(console.log(arg.stack))
                );
            } else {
                if (typeof arg !== 'object') {
                    error(logPrefix().toString(), Chalk.red(console.log(arg)));
                    return;
                }

                error(arg);
            }
        });
    };
}
