import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
} from '@angular/material';
import { HttpClientModule } from "@angular/common/http"; // Require for MatIcon


@NgModule({
  imports: [
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
  exports: [
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ]
})


export class MaterialModule{}