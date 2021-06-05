import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsumptionsService } from 'src/app/core/providers/consumptions.service';
import { ImageUploadDialogComponent } from '../image-upload-dialog/image-upload-dialog.component';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { ItemService } from 'src/app/core/providers/item.service';

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

  public suggestedConsumptions: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private $consumption: ConsumptionsService,
    private $item: ItemService,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.$item.items.subscribe((items: Array<any>) => {
      this.items = items;

      // get suggestions and add the item as attribute
      this.suggestedConsumptions = this.$consumption.getSuggested().map((suggestion: any) => {
        suggestion.item = this.items.find((item: any) => item.id === suggestion.item_id);
        return suggestion;
      });
    })

    this.formConsumption = this.formBuilder.group({
      item_id: [1, [Validators.required]],
      volume: [150, [Validators.required]],
      consumed_at: [null, [Validators.required]],
      notes: [null, []],
    });
  }

  ngOnInit(): void {
    // set the default time
    this.formConsumption.patchValue({consumed_at: moment().format('YYYY-MM-DD[T]HH:mm')});
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

  /**
   * Handle the selection of a suggestion
   * @param {any} suggestion The clicked suggestion
   */
  public onSuggestionSelected(suggestion: any): void {
    this.formConsumption.patchValue({
      volume: suggestion.volume,
      item_id: suggestion.item_id,
    });

    this.onAdd();
  }

  /**
   * Add the consumption
   * @returns {void}
   */
  public onAdd(): void {

    this.error = null;

    // simple flag to allow for errors to only be displayed after first submit
    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formConsumption.markAllAsTouched();

    if (!this.formConsumption.valid) {
      return;
    }

    this.isLoading = true;

    // build the payload
    const payload = this.formConsumption.value;
    const consumedAt = moment(payload.consumed_at).utc().format();

    this.$consumption.create(payload.item_id, payload.volume, consumedAt, payload.notes).then((userConsumption: any) => {

      // do stuff?

      // close the dialog
      this.onClose();

    }, (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.error = err.error.message;
    })
  }

}
