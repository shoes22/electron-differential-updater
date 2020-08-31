const {
  autoUpdater,
  CancellationToken
} = require("@imjs/electron-differential-updater");

const { dialog, ipcMain, app, BrowserWindow } = require("electron");
const electronLog = require("electron-log");

let mainWindow;
const log = electronLog.scope("auto-update");
// const isDev = () => app.isPackaged;

class AutoUpdater {
  constructor() {}

  onError(error) {
    log.error(error);
  }

  sendToUpdateWindow(channel, arg = null) {
    mainWindow = mainWindow ? mainWindow : BrowserWindow.getAllWindows()[0];
    mainWindow.webContents.send(channel, arg);
    return true;
  }

  onUpdateError(error) {
    log.info("onUpdateError");

    this.onError(error); // Send last so other notifications have a chance to get sent before main process reacts
  }

  onCheckingForUpdateStarted() {
    log.info("onCheckingForUpdateStarted");

    this.sendToUpdateWindow("startedChecking");
  }

  async onUpdateAvailable(info) {
    log.info("onUpdateAvailable", info);
    this.sendToUpdateWindow("action:update-available", info);
    ipcMain.once("action:download-update", async () => {
      dialog.showErrorBox(
        "Testing Auto-Update",
        `About to download version ${info.version}`
      );
      this.fCancellationToken = new CancellationToken();
      try {
        await autoUpdater.downloadUpdate(this.fCancellationToken);
      } catch (error) {
        const err = error;
        dialog.showErrorBox(
          "An error occured attempting to download the update",
          err.message
        );
      }
    });
  }

  onUpdateNotAvailable() {
    log.info("onUpdateNotAvailable");

    this.sendToUpdateWindow("updateNotAvailable");
  }

  onDownloadProgressChanged(progress) {
    this.sendToUpdateWindow("action:download-progress", progress);
  }

  onUpdateDownloaded() {
    log.info("onUpdateDownloaded");

    this.sendToUpdateWindow("updateDownloaded", info);
    autoUpdater.quitAndInstall();
  }

  async checkForUpdates() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = true;
    autoUpdater.on("error", error => this.onUpdateError(error));
    autoUpdater.on("checking-for-update", () =>
      this.onCheckingForUpdateStarted()
    );
    autoUpdater.on("update-available", info => this.onUpdateAvailable(info));
    autoUpdater.on("update-not-available", () => this.onUpdateNotAvailable());
    autoUpdater.on("download-progress", progress =>
      this.onDownloadProgressChanged(progress)
    );
    autoUpdater.on("update-downloaded", info => this.onUpdateDownloaded(info));
    // if (isDev()) {
    //   await Promise.resolve();
    // } else {
    log.info("Checking for updates");
    await autoUpdater.checkForUpdates();
    // }
  }
}

module.exports = new AutoUpdater();