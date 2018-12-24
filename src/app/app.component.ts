import { Component, OnInit } from '@angular/core';
import { FileService } from './file.service';
import { FileElement } from './file-explorer/file-element.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  fileElements: FileElement[];
  root: string;
  currentPath: string;
  canNavigateUp = false;

  constructor(private fileService: FileService){}
  
  ngOnInit() {
    var self = this;
    this.fileService.readdir().then(function(dirContents:FileElement[]){
      self.fileElements = dirContents.filter(function(item){return item.isDir || item.ext || item.mime})
      self.root = self.fileElements.length > 0 ? self.fileElements[0].dir : 'desktop'
      self.currentPath = self.root
    });
  }

  // Functions passing actions to the file service
  readdir(dirPath?:string){
    var self = this;
    this.fileService.readdir(dirPath).then(function(dirContents:FileElement[]){
      self.fileElements = dirContents.filter(function(item){return item.isDir || item.ext || item.mime})
      self.currentPath = self.fileElements.length > 0 ? self.fileElements[0].dir : dirPath
    });
  }
  addFolder(folder: { name: string }) {
    var self = this;
    this.fileService.mkdir(folder.name, this.currentPath ? this.currentPath : this.root).
      then(function(newFolderElement){
        self.fileElements.push(newFolderElement);
      })
  }
  removeElement(element: FileElement) {
    var self = this;
    this.fileService.rimraf(element.path).
    then(function(success){
      if(success)
        self.fileElements = self.fileElements.filter(function(el){return el.path !== element.path})
    })
  }
  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    var self = this;
    this.fileService.moveTo(event.element.path, event.moveTo.path).
    then(function(movedFileElement){
      if(movedFileElement){
        self.fileElements = self.fileElements.filter(function(el){return el.path !== event.element.path})
        self.fileElements.push(movedFileElement)
      }
    });
  }
  renameElement(element: FileElement) {
    var self = this
    this.fileService.rename(element.path, element.name).
    then(function(renamedFileElement){
      if(renamedFileElement){
        self.fileElements = self.fileElements.filter(function(el){return el.path !== element.path})
        self.fileElements.push(renamedFileElement)
      }
    });
  }
  navigateUp() {
    if(!this.canNavigateUp) return false
    if(this.popPath(this.currentPath) === this.root) {
      this.currentPath = this.root;
      this.canNavigateUp = false;
      this.readdir(this.root);
    } else {
      this.currentPath = this.popPath(this.currentPath);
      this.readdir(this.currentPath);
    }
  }
  navigateTo(element: FileElement) {
    if(element.isDir){
      if(this.currentPath == element.path) return false
      this.currentPath = element.path
      this.readdir(this.currentPath);
      this.canNavigateUp = true;
    } else {
      this.fileService.open(element.path)
    }
  }
  // Path
  pushToPath(path: string, folderName: string) {
    return path.replace(/\\/g, '/').replace(/\/+ *$/g, '') + '/' + folderName.replace(/\\/g, '/').replace(/\/+ *$/g, '');
  }
  popPath(path:string) {
    path = path.replace(/\\/g, '/').replace(/\/+ *$/g, '')
    let split = path.split(/\\|\//);
    split.splice(split.length - 1, 1);
    return split.join('\\');
  }
}
