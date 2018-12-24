import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";

import { FileElement } from './file-element.class';
import { ElementNameDialogComponent } from './element-name-dialog/element-name-dialog.component';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent {

  //Dumb Component
  @Input() fileElements: FileElement[];
  @Input() canNavigateUp: boolean;
  @Input() currentPath: string;

  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<FileElement>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<FileElement>();
  @Output() navigatedUp = new EventEmitter();
  icons: string[]
  extMap: any;

  constructor(public dialog: MatDialog, private matIconRegistry:MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.icons = ["ai","sesx","avi","css","csv","dbf","doc","dots","dwg","exe","file","fla","html","iso","js","jpg","json","mp3","mp4","none","pdf","png","ppt","psd","py","rtf","search","svg","txt","xls","xml","yml","zip","zip-alt"]
    for(let ext of this.icons){
      this.matIconRegistry.addSvgIcon(
        `${ext}_file`,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${ext}.svg`)
      );
    }
    this.extMap = {
      "doc":["docx"],
      "ppt":["pptx"],
      "search": [],
      "svg": ["svgz"],
      "xls": ["xlsx"],
      "yml": ["yaml"],
      "zip-alt": ["rar","gzip","gz","7zip"]
    }
  }

  //Functions to call outputs
  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }
  navigate(element: FileElement) {
    this.navigatedDown.emit(element);
  }
  navigateUp() {
    this.navigatedUp.emit();
  }
  moveElement(element: FileElement, moveTo: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
  }
  openNewFolderDialog() {
    let dialogRef = this.dialog.open(ElementNameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }
  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(ElementNameDialogComponent,{
        data: {
            element: element
        }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.elementRenamed.emit(element);
      }
    });
  }
  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    //let element = viewChild.menuData.element;
    viewChild.openMenu();
  }

  // Icons
  getFileIconLabel(ext:string){
    if(!ext) return 'none_file'
    if(this.icons.includes(ext.toLowerCase()))
      return ext.toLowerCase()+'_file'
    let mapKeys = Object.keys(this.extMap)
    for(let i=0;i<mapKeys.length;i++){
      if(this.extMap[mapKeys[i]].includes(ext.toLowerCase()))
        return mapKeys[i].toLowerCase()+'_file'
    }
    return 'dots_file'
  }
}
