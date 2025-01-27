import express from 'express';
import chalk from 'chalk';

import type { Route, RouteHandler, RouteMethod } from './types.js';
import { RouteBuilder } from './builder.js';
import { appendBasePath } from './path.js';
import { registerRoute } from './register-route.js';
import { registerExitHandler, registerOnExitEvent } from './lifecycle.js';

export function fusion(basePath = '', expressApp = express()) {
    const routes: Route[] = [];
    // The forward reference object that will be returned for chaining
    const router = {
        GET,
        PUT,
        POST,
        PATCH,
        DELETE,
        register,
        listen
    };
    return router;

    function GET<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return register('get', path, builderFn, handler);
    }

    function PUT<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return register('put', path, builderFn, handler);
    }

    function POST<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return register('post', path, builderFn, handler);
    }

    function PATCH<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return register('patch', path, builderFn, handler);
    }

    function DELETE<QP, UP, B, GR>(
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        return register('delete', path, builderFn, handler);
    }

    /**
     * Register a new route with the API.
     * @param method The HTTP method to register
     * @param path The path to register
     * @param builderFn The builder function that will be used to build the route
     * @param handler The handler function that will be called when the route is matched
     */
    function register<QP, UP, B, GR>(
        method: RouteMethod,
        path: string | string[],
        builderFn: (
            builder: RouteBuilder<any, any, any, any>
        ) => RouteBuilder<QP, UP, B, GR>,
        handler: RouteHandler<QP, UP, B, GR>
    ) {
        const builder = builderFn(new RouteBuilder<any, any, any, any>());
        const fullPath = appendBasePath(
            basePath,
            Array.isArray(path) ? path.join('/') : path
        );
        routes.push({ method, path: fullPath, handler, builder });
        return router;
    }

    /**
     * Start the express server.
     * @param hostname The hostname to listen on
     * @param port The port to listen on
     * @returns The express app instance
     */
    function listen(hostname: string, port: number) {
        expressApp.use(express.json());
        if (global?.serveStatic) {
            const { dirPath: serveStaticDirPath, options: serveStaticOptions } =
                global.serveStatic;
            expressApp.use(
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
            expressApp.all('*', (req, res) => {
                res.status(200).sendFile('/', { root: serveStaticDirPath });
            });
        }

        routes.forEach((endpoint) => {
            registerRoute(expressApp, endpoint);
        });

        const appInstance = expressApp.listen({ hostname, port }, () => {
            console.log(
                chalk.bold.blue(`✨ Fusion is listening on ${hostname}:${port}`)
            );
        });

        registerExitHandler(global?.onExit);
        registerOnExitEvent(() => appInstance.close());

        return appInstance;
    }
}
