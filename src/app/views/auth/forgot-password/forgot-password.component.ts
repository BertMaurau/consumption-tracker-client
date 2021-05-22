import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/providers/auth.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  public formReset: FormGroup;

  public isLoading: boolean = false;
  public hasSubmitted: boolean = false;
  public hasSentEmail: boolean = false;

  public error: string = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private $auth: AuthService,
  ) {
    this.formReset = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }

  /**
   * Check if allowed to display errors
   * @param {string} controlName 
   * @returns {boolean}
   */
  public controlHasError(controlName: string): boolean {
    // check if the user already touched the fields
    return !!(this.hasSubmitted && this.formReset.get(controlName).invalid && (this.formReset.get(controlName).dirty || this.formReset.get(controlName).touched) && this.formReset.get(controlName).errors);
  }

  /**
   * Remove any set errors for given control
   * @param {string} controlName 
   * @returns {void}
   */
  public clearControlErrors(controlName: string): void {
    this.formReset.get(controlName).setErrors(null);
  }

  /**
   * Do form stuff and make the sign-in call
   * @returns {void}
   */
  public onSendReset(): void {

    this.error = null;

    // simple flag to allow for errors to only be displayed after first submit
    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formReset.markAllAsTouched();

    if (!this.formReset.valid) {
      return;
    }

    this.isLoading = true;

    const payload: any = {
      email: this.formReset.controls.email.value,
    }

    this.$auth.requestPasswordReset(payload).then((userPasswordReset: any) => {

      // do other stuff here
      // ..

      this.hasSentEmail = true;

    }, (err: any) => {

      this.isLoading = false;
      
      switch (err.error.code) {
        case 404:
          // No user account found for given email address
          this.formReset.get('email').setErrors({ notFound: true });
          break;
        case 422:
          // Email value is an invalid email address
          this.formReset.get('email').setErrors({ invalid: true });
          break;
        default:
          this.error = err.error.message;
          break;
      }
    });

  }
}
