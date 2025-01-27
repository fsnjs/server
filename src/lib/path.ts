export function appendBasePath(basePath: string, path: string = '') {
    if (path.startsWith('/')) return basePath + path;
    return basePath + '/' + path;
}
