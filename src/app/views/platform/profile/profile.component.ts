import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/providers/auth.service';
import { CountryService } from 'src/app/core/providers/country.service';
import { TimezoneService } from 'src/app/core/providers/timezone.service';
import { ImageUploadDialogComponent } from 'src/app/shared/dialogs/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public authUser: any = {};

  public formUser: FormGroup;

  public isEditing: boolean = false;
  public isLoadingAvatar: boolean = false;
  public isLoading: boolean = false;
  public isSavedState: boolean = false;
  public isHoveringAvatar: boolean = false;

  public hasSubmitted: boolean = false;
  public hasChanged: boolean = false;

  public countries: Array<any> = [];
  public timezones: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private $auth: AuthService,
    private $country: CountryService,
    private $timezone: TimezoneService,
  ) {

    this.formUser = this.formBuilder.group({
      first_name: [null, []],
      last_name: [null, []],
      email: [null, [Validators.required, Validators.email]],
      units: [null, []],
      timezone: [null, []],
      country_code: [null, []],
    });

    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;

      this.formUser.patchValue({
        first_name: authUser.first_name,
        last_name: authUser.last_name,
        email: authUser.email,
        units: authUser.units,
        timezone: authUser.timezone,
        country_code: authUser.country_code,
      });
    })
  }

  ngOnInit(): void {
    this.$country.get().then((countries: Array<any>) => this.countries = countries);
    this.$timezone.get().then((timezones: Array<any>) => this.timezones = timezones);
  }

  /**
   * Check if allowed to display errors
   * @param {string} controlName 
   * @returns {boolean}
   */
   public controlHasError(controlName: string): boolean {
    // check if the user already touched the fields
    return !!(this.hasSubmitted && this.formUser.get(controlName).invalid && (this.formUser.get(controlName).dirty || this.formUser.get(controlName).touched) && this.formUser.get(controlName).errors);
  }

  /**
   * Remove any set errors for given control
   * @param {string} controlName 
   * @returns {void}
   */
  public clearControlErrors(controlName: string): void {
    this.formUser.get(controlName).setErrors(null);
  }

  public onSaveChanges(): void {
    if (!this.hasChanged) {
      this.isEditing = false;
      return;
    }

    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formUser.markAllAsTouched();

    if (!this.formUser.valid) {
      return;
    }

    this.isLoading = true;

    const payload: any = this.formUser.value;

    this.$auth.update(payload).then((authUser: any) => {

      // do other stuff here
      // ..

      this.isLoading = false;
      this.isSavedState = true;
      this.hasChanged = false;
      this.isEditing = false;
      setTimeout(() => {
        this.isSavedState = false;
      }, 2000);
      
    }, (err: any) => {

      this.isLoading = false;

      switch (err.error.code) {
        case 406:
          // Already a user in the system with that email
          this.formUser.get('email').setErrors({ taken: true });
          break;
        case 422:
          // Email value is an invalid email address
          this.formUser.get('email').setErrors({ invalid: true });
          break;
        default:
          break;
      }
    });
  }

  public onLogout(): void {
    this.$auth.destroy().then(() => this.router.navigate(['/sign-in']));
  }

  public onChangeAvatar(): void {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
      panelClass: ['custom-dialog', 'w512'],
      data: {
        current: this.authUser.attributes.images_url + '/' + this.authUser.guid + '.jpg'
      },
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((baseString?: string) => {
      if (baseString) {
        this.isLoadingAvatar = true;
        this.$auth.avatar(baseString).then(() => {
          this.isLoadingAvatar = false;
        });
      }
    });
  }
}
