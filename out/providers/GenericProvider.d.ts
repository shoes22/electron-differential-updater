import { GenericServerOptions, UpdateInfo } from "builder-util-runtime";
import { AppUpdater } from "../AppUpdater";
import { Provider, ResolvedUpdateFileInfo } from "../main";
import { ProviderRuntimeOptions } from "./Provider";
interface customGenericServerOptions extends GenericServerOptions {
    /**
     * The update channel.
     *  @default false
     */
    useAppSupportCache?: boolean;
}
export declare class GenericProvider extends Provider<UpdateInfo> {
    private readonly configuration;
    private readonly updater;
    private readonly baseUrl;
    constructor(configuration: customGenericServerOptions, updater: AppUpdater, runtimeOptions: ProviderRuntimeOptions);
    private get channel();
    getLatestVersion(): Promise<UpdateInfo>;
    resolveFiles(updateInfo: UpdateInfo): Array<ResolvedUpdateFileInfo>;
}
export {};
