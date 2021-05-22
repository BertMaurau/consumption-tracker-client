import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from 'src/app/core/providers/auth.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

  public formReset: FormGroup;

  public isLoading: boolean = false;
  public hasSubmitted: boolean = false;
  public hasResetSent: boolean = false;

  public error: string = null;

  private _resetToken: string = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private $auth: AuthService,
  ) {
    this.formReset = this.formBuilder.group({
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
    }, { validator: this._validatePasswords('password', 'confirm_password') });

    this.activatedRoute.queryParamMap.subscribe((queryParamMap: ParamMap) => {
      this._resetToken = queryParamMap.get('token');
    })
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
   * Do form stuff and make the reset call
   * @returns {void}
   */
  public onReset(): void {

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
      token: this._resetToken,
      password: Md5.hashStr(this.formReset.controls.password.value),
    }

    this.$auth.resetPassword(payload).then((authUser: any) => {
      // do other stuff here
      // ..

      this.hasResetSent = true;

    }, (err: any) => {
      this.isLoading = false;
      this.error = err.error.message;
    });

  }

  /**
   * Validate that both passwords are matching and set the error on the form if not
   * @param {string} password 
   * @param {string} passwordConfirmation 
   * @returns {void}
   */
  private _validatePasswords(password: string, passwordConfirmation: string): (group: FormGroup) => void {
    return (group: FormGroup) => {
      const input = group.controls[password];
      const confirmationInput = group.controls[passwordConfirmation];
      return confirmationInput.setErrors(
        input.value !== confirmationInput.value ? { noMatch: true } : null
      );
    };
  }

}
