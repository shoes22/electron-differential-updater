export interface AppAdapter {
    readonly version: string;
    readonly name: string;
    readonly isPackaged: boolean;
    readonly app: any;
    /**
     * Path to update metadata file.
     */
    readonly appUpdateConfigPath: string;
    readonly appPath: string;
    /**
     * Path to user data directory.
     */
    readonly userDataPath: string;
    /**
     * Path to cache directory.
     */
    baseCachePath: string;
    whenReady(): Promise<void>;
    quit(): void;
    onQuit(handler: (exitCode: number) => void): void;
}
export declare function getAppCacheDir(): string;
