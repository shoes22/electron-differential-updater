"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MacUpdater = void 0;

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
    return data;
  };

  return data;
}

function _fsExtra() {
  const data = require("fs-extra");

  _fsExtra = function () {
    return data;
  };

  return data;
}

var _fs = require("fs");

function _BaseUpdater() {
  const data = require("./BaseUpdater");

  _BaseUpdater = function () {
    return data;
  };

  return data;
}

function _main() {
  const data = require("./main");

  _main = function () {
    return data;
  };

  return data;
}

function _Provider() {
  const data = require("./providers/Provider");

  _Provider = function () {
    return data;
  };

  return data;
}

function _http() {
  const data = require("http");

  _http = function () {
    return data;
  };

  return data;
}

function _GenericDifferentialDownloader() {
  const data = require("./differentialDownloader/GenericDifferentialDownloader");

  _GenericDifferentialDownloader = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _zlib() {
  const data = require("zlib");

  _zlib = function () {
    return data;
  };

  return data;
}

function _electron() {
  const data = _interopRequireDefault(require("electron"));

  _electron = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MacUpdater extends _BaseUpdater().BaseUpdater {
  constructor(options, app) {
    super(options, app);
    this.nativeUpdater = _electron().default.autoUpdater;
    this.updateInfoForPendingUpdateDownloadedEvent = null;
    this.nativeUpdater.on("error", it => {
      this._logger.warn(it);

      this.emit("error", it);
    });
    this.nativeUpdater.on("update-downloaded", () => {
      const updateInfo = this.updateInfoForPendingUpdateDownloadedEvent;
      this.updateInfoForPendingUpdateDownloadedEvent = null;
      this.dispatchUpdateDownloaded(updateInfo);
    });
  }

  doInstall(options) {
    throw new Error("Method not implemented.");
  }

  async differentialDownloadInstaller(fileInfo, downloadUpdateOptions, installerPath, provider) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload) {
        return true;
      }

      const newBlockMapUrl = (0, _main().newUrlFromBase)(`${fileInfo.url.pathname}.blockmap`, fileInfo.url);
      const oldBlockMapUrl = (0, _main().newUrlFromBase)(`${fileInfo.url.pathname.replace(new RegExp(downloadUpdateOptions.updateInfoAndProvider.info.version, "g"), this.app.version)}.blockmap`, fileInfo.url);

      this._logger.info(`Download block maps (old: "${oldBlockMapUrl.href}", new: ${newBlockMapUrl.href})`);

      const downloadBlockMap = async url => {
        const data = await this.httpExecutor.downloadToBuffer(url, {
          headers: downloadUpdateOptions.requestHeaders,
          cancellationToken: downloadUpdateOptions.cancellationToken
        });

        if (data == null || data.length === 0) {
          throw new Error(`Blockmap "${url.href}" is empty`);
        }

        try {
          return JSON.parse((0, _zlib().gunzipSync)(data).toString());
        } catch (e) {
          throw new Error(`Cannot parse blockmap "${url.href}", error: ${e}, raw data: ${data}`);
        }
      };

      const blockMapDataList = await Promise.all([downloadBlockMap(oldBlockMapUrl), downloadBlockMap(newBlockMapUrl)]);
      await new (_GenericDifferentialDownloader().GenericDifferentialDownloader)(fileInfo.info, this.httpExecutor, {
        newUrl: fileInfo.url,
        oldFile: _path.default.join(this.downloadedUpdateHelper.cacheDir, process.platform === "darwin" ? `${this.app.name}-${this.app.version}-mac.zip` : _builderUtilRuntime().CURRENT_APP_INSTALLER_FILE_NAME),
        logger: this._logger,
        newFile: installerPath,
        isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
        requestHeaders: downloadUpdateOptions.requestHeaders
      }).download(blockMapDataList[0], blockMapDataList[1], this.emit.bind(this));
      return false;
    } catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);

      if (this._testOnlyOptions != null) {
        // test mode
        throw e;
      }

      return true;
    }
  }

  doDownloadUpdate(downloadUpdateOptions) {
    this.updateInfoForPendingUpdateDownloadedEvent = null;
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const files = downloadUpdateOptions.updateInfoAndProvider.provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info);
    const zipFileInfo = (0, _Provider().findFile)(files, "zip", ["pkg", "dmg"]);

    if (zipFileInfo == null) {
      throw (0, _builderUtilRuntime().newError)(`ZIP file not provided: ${(0, _builderUtilRuntime().safeStringifyJson)(files)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    }

    const server = (0, _http().createServer)();
    server.on("close", () => {
      this._logger.info(`Proxy server for native Squirrel.Mac is closed (was started to download ${zipFileInfo.url.href})`);
    });

    function getServerUrl() {
      const address = server.address();
      return `http://127.0.0.1:${address.port}`;
    }

    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: zipFileInfo,
      downloadUpdateOptions,
      task: async (destinationFile, downloadOptions) => {
        try {
          if (await this.differentialDownloadInstaller(zipFileInfo, downloadUpdateOptions, destinationFile, provider)) {
            await this.httpExecutor.download(zipFileInfo.url, destinationFile, downloadOptions);
          }
        } catch (e) {
          console.log(e);
        }
      },
      done: async event => {
        const downloadedFile = event.downloadedFile;
        this.updateInfoForPendingUpdateDownloadedEvent = event;
        let updateFileSize = zipFileInfo.info.size;

        if (updateFileSize == null) {
          updateFileSize = (await (0, _fsExtra().stat)(downloadedFile)).size;
        }

        return await new Promise((resolve, reject) => {
          // insecure random is ok
          const fileUrl = "/" + Date.now() + "-" + Math.floor(Math.random() * 9999) + ".zip";
          server.on("request", (request, response) => {
            const requestUrl = request.url;

            this._logger.info(`${requestUrl} requested`);

            if (requestUrl === "/") {
              const data = Buffer.from(`{ "url": "${getServerUrl()}${fileUrl}" }`);
              response.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": data.length
              });
              response.end(data);
              return;
            }

            if (!requestUrl.startsWith(fileUrl)) {
              this._logger.warn(`${requestUrl} requested, but not supported`);

              response.writeHead(404);
              response.end();
              return;
            }

            this._logger.info(`${fileUrl} requested by Squirrel.Mac, pipe ${downloadedFile}`);

            let errorOccurred = false;
            response.on("finish", () => {
              try {
                setImmediate(() => server.close());
              } finally {
                if (!errorOccurred) {
                  this.nativeUpdater.removeListener("error", reject);
                  resolve([]);
                }
              }
            });
            const readStream = (0, _fs.createReadStream)(downloadedFile);
            readStream.on("error", error => {
              try {
                response.end();
              } catch (e) {
                this._logger.warn(`cannot end response: ${e}`);
              }

              errorOccurred = true;
              this.nativeUpdater.removeListener("error", reject);
              reject(new Error(`Cannot pipe "${downloadedFile}": ${error}`));
            });
            response.writeHead(200, {
              "Content-Type": "application/zip",
              "Content-Length": updateFileSize
            });
            readStream.pipe(response);
          });
          server.listen(0, "127.0.0.1", () => {
            this.nativeUpdater.setFeedURL({
              url: getServerUrl(),
              headers: {
                "Cache-Control": "no-cache"
              }
            });
            this.nativeUpdater.once("error", reject);
            this.nativeUpdater.checkForUpdates();
          });
        });
      }
    });
  }

  quitAndInstall() {
    this.nativeUpdater.quitAndInstall();
  }

} exports.MacUpdater = MacUpdater;
// __ts-babel@6.0.4
//# sourceMappingURL=MacUpdater.js.map