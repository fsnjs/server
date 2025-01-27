import express from 'express';
import { Router } from './router.js';

export function fusion(basePath = '', expressApp = express()) {
    return new Router(basePath, expressApp);
}
