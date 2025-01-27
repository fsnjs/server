import { fusion } from './lib/fusion.js';

export { executeOnExitEvents, registerOnExitEvent } from './lib/lifecycle.js';
export { HttpStatusCode } from './lib/http-status-codes.js';
export { ExpressError } from './lib/register-route.js';
export { registerFusionLogging } from './lib/console/console.js';

export type {
    ErrorHandler,
    ExitHandler,
    Request,
    Response,
    Route,
    RouteGuard,
    RouteHandler,
    RouteMethod,
    ServeStaticOptions
} from './lib/types.js';

export default fusion;
