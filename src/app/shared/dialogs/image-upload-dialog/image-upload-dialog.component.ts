import { ElementRef } from '@angular/core';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-upload-dialog',
  templateUrl: './image-upload-dialog.component.html',
  styleUrls: ['./image-upload-dialog.component.scss']
})
export class ImageUploadDialogComponent {

  @ViewChild('fileSelect') fileSelect: ElementRef;

  public croppedImage: any = null;
  public newImage: string = null;

  public isLoading: boolean = false;

  public selectedFile: any;

  public dropConfig: any = {
    accept: '*',
    files: [],
    progress: 0,
    hasBaseDropZoneOver: false,
    httpEmitter: null,
    httpEvent: null,
    lastFileAt: null,
    sendableFormData: null,
    dragFiles: null,
    validComboDrag: null,
    lastInvalids: null,
    fileDropDisabled: null,
    maxSize: 2 * 1024 * 1024,
    baseDropValid: null,
  };

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data && data.hasOwnProperty('current')) {
      this.croppedImage = data.current;
    }
  }

  public fileChangeEvent(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.isLoading = true;
      const file = event.target.files[0];
      this.getBase64(file).then((baseString: string) => {
        this.newImage = baseString;
        this.isLoading = false;
      });
    }
  }

  /**
   * Close the dialog
   */
  public onClose(): void {
    this.dialogRef.close(this.croppedImage);
  }

  public onFileDrop(event: any): void {
    if (event.event.dataTransfer.files) {
      this.isLoading = true;
      const file = event.event.dataTransfer.files[0];
      this.getBase64(file).then((baseString: string) => {
        this.newImage = baseString;
        this.isLoading = false;
      });
    }
  }

  public imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  private getBase64(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result.toString());
      };
      reader.onerror = error => reject(error);
    });
  }

}
