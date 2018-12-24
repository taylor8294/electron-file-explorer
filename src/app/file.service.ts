import { Injectable } from '@angular/core';
import { FileElement } from './file-explorer/file-element.class';
//import { IpcRenderer } from 'electron';

// Interface
export interface IFileService {
  readdir(dirPath?: string): Promise<FileElement[]>;
  mkdir(name: string, parentPath?:string): Promise<FileElement>;
  rename(oldPath: string, newPath: string): Promise<FileElement>;
  moveTo(path: string, newParentPath: string): Promise<FileElement>;
  rimraf(fullPath: string): Promise<boolean>;
}

// Implementation
@Injectable({
  providedIn: 'root'
})
export class FileService implements IFileService{
  private ipc;

  constructor() {
    if (Object.prototype.hasOwnProperty.call(<any>window,'require')) {
      try {
        this.ipc = (<any>window).require("electron").ipcRenderer;
        console.log("Got a handle to electron's ipcRenderer succussfully");
      } catch (error) {
        console.error("Error thrown trying to get a handle to electron's ipcRenderer - not running in electron?");
        throw error;
      }
    } else {
      console.warn("Could not get a handle to electron's ipcRenderer - not running in electron?");
    }
  }

  /*
   * @todo Check for timeout
   * @todo Give requests an id to identify which request has been answered
   */
  async readdir(dirPath?:string) {
    return new Promise<FileElement[]>((resolve, reject) => {
      this.ipc.once("readdirResponse", (event, elements) => {
        resolve(elements);
      });
      this.ipc.send("readdir", dirPath);
    });
  }
  async mkdir(name:string,parentPath:string) {
    return new Promise<FileElement>((resolve, reject) => {
      this.ipc.once("mkdirResponse", (event, folder) => {
        resolve(folder);
      });
      this.ipc.send("mkdir", name, parentPath);
    });
  }
  async rename(filePath:string,newName:string) {
    return new Promise<FileElement>((resolve, reject) => {
      this.ipc.once("renameResponse", (event, fileElement) => {
        resolve(fileElement);
      });
      this.ipc.send("rename", filePath, newName);
    });
  }
  async moveTo(oldPath:string,newParentPath:string) {
    return new Promise<FileElement>((resolve, reject) => {
      this.ipc.once("moveToResponse", (event, newFileElement) => {
        resolve(newFileElement);
      });
      this.ipc.send("moveTo", oldPath, newParentPath);
    });
  }
  async rimraf(fullPath:string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once("rimrafResponse", (event, result) => {
        resolve(result);
      });
      this.ipc.send("rimraf", fullPath);
    });
  }
  open(fullPath:string) {
    this.ipc.send("open", fullPath);
  }
  
}
