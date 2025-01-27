import { registerRoute, handleError, ExpressError } from './register-route.js';
import { HttpStatusCode } from './http-status-codes.js';
import { Response } from 'express';
import { of, throwError } from 'rxjs';

describe('requestHandler', () => {
    let mockExpressApp: any;
    let mockHandler: any;
    let mockBuilder: any;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        mockExpressApp = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn()
        };

        mockHandler = jest.fn();

        mockBuilder = {
            guardFn: jest.fn(),
            urlParamsCoerceFn: jest.fn(),
            queryParamsCoerceFn: jest.fn(),
            bodyCoerceFn: jest.fn(),
            errorHandlerFn: jest.fn()
        };

        mockReq = {
            params: {},
            query: {},
            body: {}
        };

        mockRes = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            on: jest.fn()
        };
    });

    it('should handle observable response', async () => {
        mockHandler.mockReturnValue(of('observable response'));
        registerRoute(mockExpressApp, {
            method: 'get',
            path: '/test',
            handler: mockHandler,
            builder: mockBuilder
        });

        const routeHandler = mockExpressApp.get.mock.calls[0][1];
        await routeHandler(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith('observable response');
    });

    it('should handle promise response', async () => {
        mockHandler.mockReturnValue(Promise.resolve('promise response'));
        registerRoute(mockExpressApp, {
            method: 'get',
            path: '/test',
            handler: mockHandler,
            builder: mockBuilder
        });

        const routeHandler = mockExpressApp.get.mock.calls[0][1];
        await routeHandler(mockReq, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith('promise response');
    });

    it('should handle no content response', async () => {
        mockHandler.mockReturnValue(Promise.resolve(null));
        registerRoute(mockExpressApp, {
            method: 'get',
            path: '/test',
            handler: mockHandler,
            builder: mockBuilder
        });

        const routeHandler = mockExpressApp.get.mock.calls[0][1];
        await routeHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.NoContent);
        expect(mockRes.send).toHaveBeenCalledWith({
            status: HttpStatusCode.NoContent,
            message: 'Respoonse handle returned no content.'
        });
    });

    it('should handle error', async () => {
        const error = new Error('test error');
        mockHandler.mockReturnValue(throwError(() => error));
        registerRoute(mockExpressApp, {
            method: 'get',
            path: '/test',
            handler: mockHandler,
            builder: mockBuilder
        });

        const routeHandler = mockExpressApp.get.mock.calls[0][1];
        await routeHandler(mockReq, mockRes);

        expect(mockBuilder.errorHandlerFn).toHaveBeenCalledWith(error, mockRes);
    });
});

describe('handleError', () => {
    let mockRes: Response;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;
    });

    it('should handle native error', () => {
        const error = new Error('native error');
        handleError(error, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            status: 500,
            message: 'native error'
        });
    });

    it('should handle ExpressError', () => {
        const error = new ExpressError('BadRequest', 'express error');
        handleError(error, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(mockRes.send).toHaveBeenCalledWith({
            status: HttpStatusCode.BadRequest,
            message: 'express error'
        });
    });

    it('should handle unknown error', () => {
        handleError(null, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'An unknown error occurred.',
            status: 500
        });
    });
});
