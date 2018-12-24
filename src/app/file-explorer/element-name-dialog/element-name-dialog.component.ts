import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-element-name-dialog',
  templateUrl: './element-name-dialog.component.html',
  styleUrls: ['./element-name-dialog.component.scss']
})
export class ElementNameDialogComponent implements OnInit {
  elementName: string;
  isDir: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if(this.data && Object.prototype.hasOwnProperty.call(this.data,'element')){
      this.elementName = this.data.element.name
      this.isDir = this.data.element.isDir
    } else {
      this.elementName = ''; this.isDir = true;
    }
  }

}
