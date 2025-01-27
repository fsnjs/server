// @ts-check

import fusion, { registerFusionLogging } from '../dist/index.js';

registerFusionLogging();

/** @param {import('../dist/index.js').Request} req */
function authGuard(req) {
    if (!req.headers.authorization) {
        throw new Error('Unauthorized');
    }
    return true;
}

fusion('/api')
    .GET(
        ['user', 'all'],
        (builder) => builder.guard(authGuard),
        () => {
            return { id: 1, name: 'John Doe' };
        }
    )
    .GET(
        ['user', ':id'],
        (builder) =>
            builder
                .guard(authGuard)
                .coerceUrlParams((params) => ({ id: parseInt(params.id, 10) })),

        (req) => {
            const { id } = req.urlParams;
            return { id, name: 'John Doe' };
        }
    )

    .POST(
        '/user',
        (builder) =>
            builder.coerceBody((body) => ({
                id: parseInt(body.id, 10),
                name: body.name,
                email: body.email
            })),
        ({ body }) => body
    )
    .listen('localhost', 3000);
