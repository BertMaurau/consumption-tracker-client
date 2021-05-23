import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsumptionsService } from 'src/app/core/providers/consumptions.service';
import { ImageUploadDialogComponent } from '../image-upload-dialog/image-upload-dialog.component';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-consumption-dialog',
  templateUrl: './add-consumption-dialog.component.html',
  styleUrls: ['./add-consumption-dialog.component.scss']
})
export class AddConsumptionDialogComponent implements OnInit {

  public formConsumption: FormGroup;

  public isLoading: boolean = false;
  public hasSubmitted: boolean = false;

  public error: string = null;

  public items: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private $consumption: ConsumptionsService,
  ) {
    this.formConsumption = this.formBuilder.group({
      item_id: [1, [Validators.required]],
      volume: [150, [Validators.required]],
      consumed_at: [Date.now(), [Validators.required]],
      notes: [null, []],
    });
  }

  ngOnInit(): void {
  }

  /**
   * Close the dialog
   */
  public onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Check if allowed to display errors
   * @param {string} controlName 
   * @returns {boolean}
   */
   public controlHasError(controlName: string): boolean {
    // check if the user already touched the fields
    return !!(this.hasSubmitted && this.formConsumption.get(controlName).invalid && (this.formConsumption.get(controlName).dirty || this.formConsumption.get(controlName).touched) && this.formConsumption.get(controlName).errors);
  }

  /**
   * Remove any set errors for given control
   * @param {string} controlName 
   * @returns {void}
   */
  public clearControlErrors(controlName: string): void {
    this.formConsumption.get(controlName).setErrors(null);
  }

  public onAdd() {

    this.error = null;

    // simple flag to allow for errors to only be displayed after first submit
    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formConsumption.markAllAsTouched();

    if (!this.formConsumption.valid) {
      return;
    }

    this.isLoading = true;

    const payload = this.formConsumption.value;

    const consumedAt = moment(payload.consumed_at).utc().format();

    this.$consumption.create(payload.item_id, payload.volume, consumedAt, payload.notes).then((con: any) => {
      this.onClose();
    }, (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.error = err.error.message;
    })
  }

}
