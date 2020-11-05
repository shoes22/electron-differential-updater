"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isZipAvailabeForDifferentialDownload = isZipAvailabeForDifferentialDownload;

function _ElectronAppAdapter() {
  const data = require("./ElectronAppAdapter");

  _ElectronAppAdapter = function () {
    return data;
  };

  return data;
}

const path = require("path");

const fs = require("fs");

const {
  exec
} = require("child_process");

const {
  getAppCacheDir
} = require("./AppAdapter");

const app = new (_ElectronAppAdapter().ElectronAppAdapter)();
let APP_NAME;
let APP_VERSION;
let isZipCreatedForDiffDownload = false;

(() => {
  APP_NAME = app.name;
  APP_VERSION = app.version;

  if (process.platform === "win32") {
    console.log("This method only supports MAC, windows create default app installer on installation");
    isZipCreatedForDiffDownload = true;
    return;
  }

  const appCacheDirName = path.join(getAppCacheDir(), app.isPackaged ? `belouga-live-updater` : "Electron");
  const zipName = `${APP_NAME}-${APP_VERSION}-mac.zip`;
  const cacheCurrentFile = path.join(appCacheDirName, zipName);

  if (fs.existsSync(cacheCurrentFile)) {
    isZipCreatedForDiffDownload = true;
    return;
  }

  try {
    if (!fs.existsSync(appCacheDirName)) {
      fs.mkdirSync(appCacheDirName);
    }

    let files = fs.readdirSync(appCacheDirName);

    for (const fileName of files) {
      if (fileName.endsWith(".zip") && fileName !== zipName) {
        fs.unlinkSync(path.join(appCacheDirName, fileName));
      }
    }

    let appZipPath = path.normalize(app.appPath + "/../../..");
    console.log("App zip file does not exist, Creting zip file in cache");
    let createZip = exec(`ditto -c -k --sequesterRsrc --keepParent "${appZipPath}" "${cacheCurrentFile}"`);
    createZip.stderr.on("close", code => {
      if (code) {
        console.error("Error while creating zip for differential download", code);
        isZipCreatedForDiffDownload = true;
        throw new Error("Error while creating zip for differential download");
      } else {
        isZipCreatedForDiffDownload = true;
        console.log("Successfully generated zip file for differential download");
      }
    });
  } catch (e) {
    console.error(e);
    isZipCreatedForDiffDownload = true;
    throw new Error(e);
  }
})();

function isZipAvailabeForDifferentialDownload() {
  return isZipCreatedForDiffDownload;
} 
// __ts-babel@6.0.4
//# sourceMappingURL=prepareAppZip.js.map