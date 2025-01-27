// @ts-check

import fusion from '../dist/index.js';

fusion('/api')
    .GET(
        '/hello',
        (builder) => builder,
        () => {
            return { message: 'Hello, world!' };
        }
    )
    .listen('localhost', 3000);
