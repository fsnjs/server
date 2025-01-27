import type { Request as ɵRequest, Response as ɵResponse } from 'express';
import { Observable } from 'rxjs';

import type { ExpressError } from './register-route.js';
import { RouteBuilder } from './builder.js';

export declare type Request = ɵRequest;

export declare type Response = ɵResponse;

export declare type RouteMethod = 'get' | 'put' | 'patch' | 'post' | 'delete';

export declare type RouteGuard<T> = (
    req: Request,
    res: Response
) => T | Promise<T> | Observable<T>;

export declare type ErrorHandler = (
    e: ExpressError | Error | object | unknown,
    res: Response
) => void;

export declare type ExitHandler = (
    exitCode: number | string,
    error?: Error,
    exit?: boolean
) => void;

export declare type RouteHandler<
    QP = any,
    UP = any,
    B = any,
    GR = any
> = (req: {
    guardResult: GR;
    queryParams: QP;
    urlParams: UP;
    body: B;
    $req: Request;
    $res: Response;
}) => any;

export declare interface Route {
    method: RouteMethod;
    path: string;
    handler: RouteHandler<any, any, any>;
    builder: RouteBuilder<any, any, any>;
    error?: ErrorHandler;
}

export declare interface ServeStaticOptions {
    dotfiles?: string;
    etag?: boolean;
    extensions?: string[];
    index?: boolean;
    maxAge?: string;
    redirect?: boolean;
}
