import { AppAdapter } from "./AppAdapter";
export declare class ElectronAppAdapter implements AppAdapter {
    readonly app: any;
    constructor(app?: any);
    whenReady(): Promise<void>;
    get version(): string;
    get name(): string;
    get isPackaged(): boolean;
    get appPath(): string;
    get appUpdateConfigPath(): string;
    get userDataPath(): string;
    get baseCachePath(): string;
    set baseCachePath(path: string);
    quit(): void;
    onQuit(handler: (exitCode: number) => void): void;
}
