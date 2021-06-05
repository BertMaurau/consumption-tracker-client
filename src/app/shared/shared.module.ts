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
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MomentModule } from 'ngx-moment';
import { AddConsumptionDialogComponent } from './dialogs/add-consumption-dialog/add-consumption-dialog.component';
import { ItemCategoryIconPipe } from '../core/pipes/item-category-icon.pipe';
import { InUnitsPipe } from '../core/pipes/in-units.pipe';

const modules = [
  CommonModule,
  FormsModule,
  FlexLayoutModule,
  ReactiveFormsModule,
  MatDialogModule,
  MatTooltipModule,
  ImageCropperModule,
  DndModule,
  NgxChartsModule,
  MomentModule,
];

@NgModule({
  declarations: [
    ImageUploadDialogComponent,
    FilterPipe,
    InUnitsPipe,
    ItemCategoryIconPipe,
    AddConsumptionDialogComponent,
  ],
  imports: [
    ...modules,
  ],
  exports: [
    ...modules,
    FilterPipe,
    InUnitsPipe,
    ItemCategoryIconPipe,
  ],
  entryComponents: [
    ImageUploadDialogComponent,
    AddConsumptionDialogComponent
  ],
})
export class SharedModule { }
