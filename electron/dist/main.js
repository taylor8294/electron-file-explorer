"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var fs = require("fs");
var readChunk = require("read-chunk");
var fileType = require("file-type");
var rimraf = require("rimraf");
var child_process_1 = require("child_process");
var win;
electron_1.app.on("ready", createWindow);
electron_1.app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
function createWindow() {
    win = new electron_1.BrowserWindow({ width: 800, height: 600 });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/../../dist/file-explorer/index.html"),
        protocol: "file:",
        slashes: true
    }));
    win.webContents.openDevTools();
    win.on("closed", function () {
        win = null;
    });
}
/*
 * Files IPC
 */
var mimes_1 = require("./mimes");
var availablePaths = ["home", "appData", "userData", "temp", "exe", "module", "desktop", "documents", "downloads", "music", "pictures", "videos", "logs"];
electron_1.ipcMain.on("readdir", function (event, dirPath) {
    if (dirPath === 'appPath')
        dirPath = electron_1.app.getAppPath();
    else if (availablePaths.includes(dirPath))
        dirPath = electron_1.app.getPath(dirPath);
    else
        dirPath = dirPath ? dirPath : electron_1.app.getPath('documents');
    fs.readdir(dirPath, function (err, fileNames) {
        var elements = fileNames.map(function (fileName) { return pathToFileElement(path.join(dirPath, fileName)); });
        win.webContents.send("readdirResponse", elements);
    });
});
electron_1.ipcMain.on("mkdir", function (event, name, parentPath) {
    parentPath = parentPath ? parentPath : electron_1.app.getAppPath(); //app.getAppPath('assets');
    fs.mkdir(path.join(parentPath, name), '0777', function (err) {
        if (err)
            win.webContents.send("mkdirResponse", null);
        else {
            var newFolder = pathToFileElement(path.join(parentPath, name));
            win.webContents.send("mkdirResponse", newFolder);
        }
    });
});
electron_1.ipcMain.on("rename", function (event, oldPath, name) {
    var newPath = path.dirname(oldPath) + '/' + name;
    fs.rename(oldPath, newPath, function (err) {
        if (err)
            win.webContents.send("renameResponse", null);
        else {
            var newFileElement = pathToFileElement(newPath);
            win.webContents.send("renameResponse", newFileElement);
        }
    });
});
electron_1.ipcMain.on("moveTo", function (event, oldPath, newParentPath) {
    var newPath = newParentPath + '/' + path.basename(oldPath);
    fs.rename(oldPath, newPath, function (err) {
        if (err)
            win.webContents.send("moveToResponse", null);
        else {
            var newFileElement = pathToFileElement(newPath);
            win.webContents.send("moveToResponse", newFileElement);
        }
    });
});
electron_1.ipcMain.on("rimraf", function (event, path) {
    rimraf(path, function (err) {
        if (err)
            win.webContents.send("rimrafResponse", false);
        else
            win.webContents.send("rimrafResponse", true);
    });
});
// To Open
function getCommandToOpen() {
    switch (process.platform) {
        case 'darwin': return 'open';
        case 'win32':
        case 'win64': return 'start';
        default: return 'xdg-open';
    }
}
electron_1.ipcMain.on("open", function (event, filePath) {
    child_process_1.exec(getCommandToOpen() + ' ' + filePath);
});
function pathToFileElement(filePath) {
    var stat = fs.lstatSync(filePath);
    var info = {
        name: path.basename(filePath),
        dir: path.dirname(filePath),
        path: filePath,
        size: stat.size,
        mtime: stat.mtime,
        birthtime: stat.birthtime,
        atime: stat.atime,
        perm: '0' + (stat.mode & parseInt('777', 8)).toString(8),
        isFile: stat.isFile(),
        isDir: stat.isDirectory(),
        isSymLink: stat.isSymbolicLink(),
        isSocket: stat.isSocket(),
        IsFIFO: stat.isFIFO(),
        ext: path.extname(filePath).substring(1).toLowerCase(),
        mime: ''
    };
    if (info.isFile) {
        try {
            var buffer = readChunk.sync(filePath, 0, fileType.minimumBytes);
            info.mime = fileType(buffer).mime;
        }
        catch (err) {
            info.mime = Object.prototype.hasOwnProperty.call(mimes_1.default, info.ext) ? mimes_1.default[info.ext] : false;
        }
    }
    return info;
}
//# sourceMappingURL=main.js.map