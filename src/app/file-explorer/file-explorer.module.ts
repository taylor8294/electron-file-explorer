import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { FileExplorerComponent } from './file-explorer.component';
import { ElementNameDialogComponent } from './element-name-dialog/element-name-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [FileExplorerComponent, ElementNameDialogComponent],
  exports: [FileExplorerComponent],
  entryComponents: [ElementNameDialogComponent]
})
export class FileExplorerModule {}
