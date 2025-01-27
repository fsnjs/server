import express from 'express';
import type {
    ExitHandler,
    Route,
    RouteHandler,
    RouteMethod,
    ServeStaticOptions
} from './types.js';
import { RouteBuilder } from './builder.js';
import { appendBasePath } from './path.js';
import { registerRoute } from './register-route.js';
import chalk from 'chalk';
import { registerExitHandler, registerOnExitEvent } from './lifecycle.js';

export class Router {
    public routes: Route[] = [];

    constructor(
        public baseUrl = '',
        public expressApp: express.Express
    ) {}

    public GET<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return this._register('get', path, builderFn, handler);
    }

    public PUT<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return this._register('put', path, builderFn, handler);
    }

    public POST<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return this._register('post', path, builderFn, handler);
    }

    public PATCH<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return this._register('patch', path, builderFn, handler);
    }

    public DELETE<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return this._register('delete', path, builderFn, handler);
    }

    /**
     * Register a new route with the API.
     * @param method The HTTP method to register
     * @param path The path to register
     * @param builderFn The builder function that will be used to build the route
     * @param handler The handler function that will be called when the route is matched
     */
    private _register<QP, UP, B, GR>(
        method: RouteMethod,
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        const builder = builderFn(new RouteBuilder<any, any, any, any>());

        const fullPath = appendBasePath(
            this.baseUrl,
            Array.isArray(path) ? path.join('/') : path
        );

        this.routes.push({ method, path: fullPath, handler, builder });

        return this;
    }

    public listen(
        hostname: string,
        port: number,
        options?: {
            onExit?: ExitHandler;
            serveStatic?: {
                dirPath: string;
                options?: ServeStaticOptions;
            };
        }
    ) {
        this.expressApp.use(express.json());

        if (options?.serveStatic) {
            const { dirPath: serveStaticDirPath, options: serveStaticOptions } =
                options.serveStatic;

            this.expressApp.use(
                express.static(
                    serveStaticDirPath,
                    serveStaticOptions ?? {
                        dotfiles: 'ignore',
                        etag: false,
                        extensions: [
                            'html',
                            'js',
                            'scss',
                            'css',
                            'woff2',
                            'svg',
                            'png'
                        ],
                        index: false,
                        maxAge: '1y',
                        redirect: true
                    }
                )
            );

            // @ts-ignore
            this.expressApp.all('*', (req, res) => {
                res.status(200).sendFile('/', { root: serveStaticDirPath });
            });
        }

        this.routes.forEach((endpoint) => {
            registerRoute(this.expressApp, endpoint);
        });

        const appInstance = this.expressApp.listen({ hostname, port }, () => {
            console.log(
                chalk.bold.blue(`✨ Fusion is listening on ${hostname}:${port}`)
            );
        });

        registerExitHandler(options?.onExit);
        registerOnExitEvent(() => appInstance.close());

        return appInstance;
    }
}
