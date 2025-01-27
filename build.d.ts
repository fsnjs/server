export declare interface NpmConfig {
    name: string;
    version: string;
    description: string;
    main: string;
    keywords: string[];
    type: string;
    scripts: {
        [key: string]: string;
    };
    author: string;
    workspaces: string[];
    peerDependencies: {
        [key: string]: string;
    };
    devDependencies?: {
        [key: string]: string;
    };
}
