import chalk from 'chalk';
import { Subscription, firstValueFrom, isObservable } from 'rxjs';
import { isNativeError, isPromise } from 'util/types';
import type { Express } from 'express';

import type { RouteMethod, Response, Route } from './types.js';
import { HttpStatusCode } from './http-status-codes.js';

/** A native JavaScript error that requires an http status code. */
export class ExpressError extends Error {
    status: number;
    constructor(status: keyof typeof HttpStatusCode, message: string) {
        super(message);
        this.status = HttpStatusCode[status];
    }
}

/**
 * Handles all incoming requests.
 * @param method An http method
 * @param path A route path
 * @param handler An incoming request handler
 * @param options Options used when handling the incoming request
 */
export function registerRoute(
    expressApp: Express,
    { method, path, handler, builder }: Route
) {
    logRouteRegistration(method, path);

    expressApp[method](path, async (req, res) => {
        let subscription: Subscription | undefined;

        res.on('close', () => {
            if (subscription) subscription.unsubscribe();
        });

        try {
            let guardRes: any;

            if (builder.guardFn) {
                guardRes = builder.guardFn(req, res);
                if (isPromise(guardRes)) guardRes = await guardRes;
                else if (isObservable(guardRes))
                    guardRes = await firstValueFrom(guardRes);
            }

            let urlParams: any;
            let queryParams: any;
            let body: any;

            if (builder.urlParamsCoerceFn) {
                urlParams = builder.urlParamsCoerceFn(req.params);
            }

            if (builder.queryParamsCoerceFn) {
                queryParams = builder.queryParamsCoerceFn(req.query);
            }

            if (builder.bodyCoerceFn) {
                body = builder.bodyCoerceFn(req.body);
            }

            const handlerRes = handler({
                guardResult: guardRes,
                queryParams,
                urlParams,
                body,
                $req: req,
                $res: res
            });

            if (isObservable(handlerRes)) {
                const vals: any[] = [];

                subscription = handlerRes.subscribe({
                    next: (val) => vals.push(val),
                    error: (error) => handleError(error, res),
                    complete: (): any => {
                        if (vals.length > 1) return res.send(vals);
                        if (vals.length === 1) return res.send(vals[0]);

                        res.status(HttpStatusCode.NoContent).send({
                            status: HttpStatusCode.NoContent,
                            message: 'Respoonse handle returned no content.'
                        });
                    }
                });
            } else if (isPromise(handlerRes)) {
                const response = await handlerRes;

                if (response) {
                    res.send(response);
                } else {
                    res.status(HttpStatusCode.NoContent).send({
                        status: HttpStatusCode.NoContent,
                        message: 'Respoonse handle returned no content.'
                    });
                }
            } else {
                if (handlerRes === undefined || handlerRes === null) {
                    res.status(HttpStatusCode.NoContent).send({
                        status: HttpStatusCode.NoContent,
                        message: 'Respoonse handle returned no content.'
                    });
                } else {
                    res.send(handlerRes);
                }
            }
        } catch (error) {
            (builder.errorHandlerFn ?? handleError)(error, res);
        }
    });
}

/**
 * Handles errors thrown in express methods.
 * @param e An error thrown by a incoming request handler
 * @param res An express response object
 */
export function handleError(
    e: ExpressError | Error | object | unknown,
    res: Response
) {
    console.error('A request error occurred:');
    console.error(e);

    if (isNativeError(e)) {
        res.status(500).send({
            status: e['status'] ?? 500,
            message: e.message
        });
    } else if (e === undefined || e === null) {
        res.status(500).send({
            message: 'An unknown error occurred.',
            status: 500
        });
    } else if (typeof e === 'object') {
        res.status(500).send(e);
    } else {
        res.status(500).send({
            message: 'An unknown error occurred.',
            status: 500
        });
    }
}

/**
 * Logs the details for registered routes.
 * @param method An http method type
 * @param path An http method path
 */
function logRouteRegistration(method: RouteMethod, path: string = '') {
    const getMethodColor = () => {
        switch (method) {
            case 'delete':
                return chalk.bold.red(method.toUpperCase());
            case 'get':
                return chalk.bold.blue(method.toUpperCase() + '   ');
            case 'patch':
                return chalk.bold.yellow(method.toUpperCase() + ' ');
            case 'put':
                return chalk.bold.magenta(method.toUpperCase() + '   ');
            default:
                return chalk.bold.green(method.toUpperCase()) + '  ';
        }
    };

    console.log(chalk.green(`${getMethodColor()} ${chalk.gray('=>')} ${path}`));
}
