import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageUploadDialogComponent } from './dialogs/image-upload-dialog/image-upload-dialog.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DndModule } from 'ngx-drag-drop';
import { FilterPipe } from '../core/pipes/filter.pipe';

const modules = [
  CommonModule,
  FormsModule,
  FlexLayoutModule,
  ReactiveFormsModule,
  MatDialogModule,
  MatTooltipModule,
  ImageCropperModule,
  DndModule,
];

@NgModule({
  declarations: [
    ImageUploadDialogComponent,
    FilterPipe,
  ],
  imports: [
    ...modules,
  ],
  exports: [
    ...modules,
    FilterPipe,
  ],
  entryComponents: [
    ImageUploadDialogComponent
  ],
})
export class SharedModule { }
