import { app, BrowserWindow, ipcMain } from "electron";

import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import * as readChunk from "read-chunk";
import * as fileType from "file-type";
import * as rimraf from "rimraf";
import { exec } from "child_process";

let win: BrowserWindow;

app.on("ready", createWindow);

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 600 });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/file-explorer/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });

}

/*
 * Files IPC
 */
import mimes from './mimes';
var availablePaths = ["home","appData","userData","temp","exe","module","desktop","documents","downloads","music","pictures","videos","logs"]
ipcMain.on("readdir", (event, dirPath:string) => {
  if(dirPath === 'appPath') dirPath = app.getAppPath();
  else if(availablePaths.includes(dirPath)) dirPath = app.getPath(dirPath);
  else dirPath = dirPath ? dirPath : app.getPath('documents');
  fs.readdir(dirPath, function(err, fileNames) {
    let elements = fileNames.map(fileName => pathToFileElement(path.join(dirPath,fileName)))
    win.webContents.send("readdirResponse", elements);
  });
});
ipcMain.on("mkdir", (event, name:string, parentPath?:string) => {
  parentPath = parentPath ? parentPath : app.getAppPath();//app.getAppPath('assets');
  fs.mkdir(path.join(parentPath,name), '0777', function(err) {
    if(err) win.webContents.send("mkdirResponse", null);
    else {
      let newFolder = pathToFileElement(path.join(parentPath,name))
      win.webContents.send("mkdirResponse", newFolder);
    }
  });
});
ipcMain.on("rename", (event, oldPath:string, name:string) => {
  let newPath = path.dirname(oldPath)+'/'+name
  fs.rename(oldPath, newPath, function(err) {
    if(err) win.webContents.send("renameResponse", null);
    else {
      let newFileElement = pathToFileElement(newPath)
      win.webContents.send("renameResponse", newFileElement);
    }
  });
});
ipcMain.on("moveTo", (event, oldPath:string, newParentPath?:string) => {
  let newPath = newParentPath+'/'+path.basename(oldPath)
  fs.rename(oldPath, newPath, function(err) {
    if(err) win.webContents.send("moveToResponse", null);
    else {
      let newFileElement = pathToFileElement(newPath)
      win.webContents.send("moveToResponse", newFileElement);
    }
  });
});
ipcMain.on("rimraf", (event, path:string) => {
  rimraf(path, function (err) {
    if(err) win.webContents.send("rimrafResponse", false);
    else win.webContents.send("rimrafResponse", true);
  });
});
// To Open
function getCommandToOpen() {
  switch (<any>process.platform) { 
     case 'darwin' : return 'open';
     case 'win32' :
     case 'win64' : return 'start';
     default : return 'xdg-open';
  }
}
ipcMain.on("open", (event, filePath:string) => {
  exec(getCommandToOpen() + ' ' + filePath);
});

function pathToFileElement(filePath:string){
  let stat = fs.lstatSync(filePath)
  let info = {
    name: path.basename(filePath),
    dir: path.dirname(filePath),
    path: filePath,
    size: stat.size,
    mtime: stat.mtime,
    birthtime: stat.birthtime,
    atime: stat.atime,
    perm: '0'+(stat.mode & parseInt('777', 8)).toString(8),
    isFile: stat.isFile(),
    isDir: stat.isDirectory(),
    isSymLink: stat.isSymbolicLink(),
    isSocket: stat.isSocket(),
    IsFIFO: stat.isFIFO(),
    ext: path.extname(filePath).substring(1).toLowerCase(),
    mime: ''
  }
  if(info.isFile){
    try{
      let buffer = readChunk.sync(filePath, 0, fileType.minimumBytes);
      info.mime = fileType(buffer).mime
    } catch(err){
      info.mime = Object.prototype.hasOwnProperty.call(mimes,info.ext) ? mimes[info.ext] : false
    }
  }
  return info;
}