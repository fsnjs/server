# server

A yargs-like API builder wrapper for express.

## Installation

To install the package, run:

```sh
npm install @fsn/server
```

## Usage

`@fsn/server` is a [Yargs](https://github.com/yargs/yargs)-like wrapper for Express.js
that provides methods and interfaces to help you build APIs with ease.

## Usage

### Simple Example

```js
fusion('/api')
    .GET(
        '/hello',
        (builder) => builder,
        () => {
            return { message: 'Hello, world!' };
        }
    )
    .listen('localhost', 3000);
```

### Example With Auth Guard

```js
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
```

## Logging

The `registerFusionLogging` function enhances the default console logging methods
to include a log prefix and colorize the output based on the log level.

### Features

- **Log Prefix:** Each log message is prefixed with a custom log prefix.
- **Colorized Output:** Log messages are colorized based on their log level:
    - console.debug: Gray
    - console.info: Cyan
    - console.warn: Yellow
    - console.error: Red

### Usage

To enable the enhanced logging, call the `registerFusionLogging` function at the start of your application:

```js
import { registerFusionLogging } from '@fsn/server/lib/console/console';

registerFusionLogging();
```
