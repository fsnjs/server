import type { ErrorHandler, RouteGuard } from './types.js';

export class RouteBuilder<QP = any, UP = any, B = any, GR = any> {
    /**
     * The function that will be used to coerce query parameters of incoming requests.
     */
    public queryParamsCoerceFn?: (rawParams: any) => QP;

    /**
     * The function that will be used to coerce URL parameters of incoming requests.
     */
    public urlParamsCoerceFn?: (rawParams: any) => UP;

    /**
     * The function that will be used to coerce the body of incoming requests.
     */
    public bodyCoerceFn?: (rawBody: any) => B;

    /**
     * The guard function that will be applied to this route.
     */
    public guardFn?: RouteGuard<GR>;

    /**
     * The error handler function that will be applied to this route.
     */
    public errorHandlerFn?: ErrorHandler;

    /**
     * The path of the child route.
     */
    private _path: string = '';

    constructor() {}

    /**
     *
     * @param path The path of this route
     * @returns
     */
    path(path: string) {
        this._path = path;
        return this;
    }

    /**
     * Apply a guard function to this route.
     * @param guard The guard function that will be applied to this route
     * @returns The RouteBuilder instance
     */
    guard<GR>(guard: RouteGuard<GR>): RouteBuilder<QP, UP, B, GR> {
        this.guardFn = <any>guard;
        return this as unknown as RouteBuilder<QP, UP, B, GR>;
    }

    error(errorHandlerFn: ErrorHandler): RouteBuilder<QP, UP, B, GR> {
        this.errorHandlerFn = errorHandlerFn;
        return this as unknown as RouteBuilder<QP, UP, B, GR>;
    }

    /**
     * Coerce query parameters of incoming requests.
     * @param coerceFn The function that will be used to coerce query parameters of incoming requests.
     * @returns The RouteBuilder instance
     */
    coerceQueryParams<QP>(
        coerceFn: (rawParams: any) => QP
    ): RouteBuilder<QP, UP, B, GR> {
        this.queryParamsCoerceFn = <any>coerceFn;
        return this as unknown as RouteBuilder<QP, UP, B, GR>;
    }

    /**
     * Coerce URL parameters of incoming requests.
     * @param coerceFn The function that will be used to coerce URL parameters of incoming requests.
     * @returns The RouteBuilder instance
     */
    coerceUrlParams<UP>(coerceFn: () => UP): RouteBuilder<QP, UP, B, GR> {
        this.urlParamsCoerceFn = <any>coerceFn;
        return this as unknown as RouteBuilder<QP, UP, B, GR>;
    }

    /**
     * Coerce the body of incoming requests.
     * @param coerceFn The function that will be used to coerce the body of incoming requests.
     * @returns The RouteBuilder instance
     */
    coerceBody<B>(coerceFn: () => B): RouteBuilder<QP, UP, B, GR> {
        this.bodyCoerceFn = <any>coerceFn;
        return this as unknown as RouteBuilder<QP, UP, B, GR>;
    }

    getChildPath(): string {
        return this._path;
    }

    getQueryParams(): ((rawParams: any) => QP) | undefined {
        return this.queryParamsCoerceFn;
    }

    getUrlParams(): ((rawParams: any) => UP) | undefined {
        return this.urlParamsCoerceFn;
    }

    getBody(): ((rawBody: any) => B) | undefined {
        return this.bodyCoerceFn;
    }

    getGuard(): RouteGuard<GR> | undefined {
        return this.guardFn;
    }
}
