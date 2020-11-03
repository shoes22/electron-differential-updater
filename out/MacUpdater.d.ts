import { AllPublishOptions } from "builder-util-runtime";
import { AppAdapter } from "./AppAdapter";
import { BaseUpdater } from "./BaseUpdater";
import { DownloadUpdateOptions } from "./AppUpdater";
export declare class MacUpdater extends BaseUpdater {
    updateAvailable: boolean;
    protected doInstall(options: import("./BaseUpdater").InstallOptions): boolean;
    private readonly nativeUpdater;
    private updateInfoForPendingUpdateDownloadedEvent;
    constructor(options?: AllPublishOptions, app?: AppAdapter);
    private differentialDownloadInstaller;
    protected doDownloadUpdate(downloadUpdateOptions: DownloadUpdateOptions): Promise<Array<string>>;
    quitAndInstall(): void;
}
