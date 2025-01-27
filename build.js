// @ts-check

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/** @typedef {import('./build').NpmConfig} NpmConfig */

spawnSync('tsc', ['-p', 'tsconfig.json'], { stdio: 'inherit' });

const npmConfig = readNpmConfig();
delete npmConfig.devDependencies;
writeFileSync(resolve('dist/package.json'), JSON.stringify(npmConfig, null, 4));

/**
 * Returns the npm configuration object.
 * @returns {NpmConfig}
 */
function readNpmConfig() {
    const npmConfig = readFileSync(resolve('package.json'), 'utf-8');
    return JSON.parse(npmConfig);
}
