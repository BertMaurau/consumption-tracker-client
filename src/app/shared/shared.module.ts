import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';


const modules = [
  CommonModule,
  FormsModule,
  FlexLayoutModule,
  ReactiveFormsModule,
];

@NgModule({
  declarations: [],
  imports: [
    ...modules,
  ],
  exports: [
    ...modules,
  ]
})
export class SharedModule { }
