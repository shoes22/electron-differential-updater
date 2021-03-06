import { PublishConfiguration } from "builder-util-runtime";
import { AppUpdater } from "./AppUpdater";
import { Provider, ProviderRuntimeOptions } from "./providers/Provider";
export declare function isUrlProbablySupportMultiRangeRequests(url: string): boolean;
export declare function createClient(data: PublishConfiguration | any, updater: AppUpdater, runtimeOptions: ProviderRuntimeOptions): Provider<any>;
