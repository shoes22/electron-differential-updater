/// <reference types="node" />
import { GithubOptions, ReleaseNoteInfo, UpdateInfo, XElement } from "builder-util-runtime";
import * as semver from "semver";
import { URL } from "url";
import { AppUpdater } from "../AppUpdater";
import { Provider, ResolvedUpdateFileInfo } from "../main";
import { ProviderRuntimeOptions } from "./Provider";
export interface customGithubOptions extends GithubOptions {
    /**
        * The update channel.
        *  @default false
        */
    useAppSupportCache?: boolean;
}
export declare abstract class BaseGitHubProvider<T extends UpdateInfo> extends Provider<T> {
    protected readonly options: customGithubOptions;
    protected readonly baseUrl: URL;
    protected readonly baseApiUrl: URL;
    protected constructor(options: customGithubOptions, defaultHost: string, runtimeOptions: ProviderRuntimeOptions);
    protected computeGithubBasePath(result: string): string;
}
export declare class GitHubProvider extends BaseGitHubProvider<UpdateInfo> {
    protected readonly options: customGithubOptions;
    private readonly updater;
    constructor(options: customGithubOptions, updater: AppUpdater, runtimeOptions: ProviderRuntimeOptions);
    getLatestVersion(): Promise<UpdateInfo>;
    private getLatestVersionString;
    private get basePath();
    resolveFiles(updateInfo: UpdateInfo): Array<ResolvedUpdateFileInfo>;
    private getBaseDownloadPath;
}
export declare function computeReleaseNotes(currentVersion: semver.SemVer, isFullChangelog: boolean, feed: XElement, latestRelease: any): string | Array<ReleaseNoteInfo> | null;
