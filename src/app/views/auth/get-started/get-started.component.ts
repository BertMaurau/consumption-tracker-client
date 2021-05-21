import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/providers/auth.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent {

  public formRegister: FormGroup;

  public isLoading: boolean = false;
  public hasSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private $auth: AuthService,
  ) {
    this.formRegister = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
      terms: [false, [Validators.required, Validators.requiredTrue]],
    }, { validator: this._validatePasswords('password', 'confirm_password') });
  }

  /**
   * Check if allowed to display errors
   * @param {string} controlName 
   * @returns {boolean}
   */
  public controlHasError(controlName: string): boolean {
    // check if the user already touched the fields
    return !!(this.hasSubmitted && this.formRegister.get(controlName).invalid && (this.formRegister.get(controlName).dirty || this.formRegister.get(controlName).touched) && this.formRegister.get(controlName).errors);
  }

  /**
   * Remove any set errors for given control
   * @param {string} controlName 
   * @returns {void}
   */
  public clearControlErrors(controlName: string): void {
    this.formRegister.get(controlName).setErrors(null);
  }

  /**
   * Do form stuff and make the register call
   * @returns {void}
   */
  public onRegister(): void {

    // simple flag to allow for errors to only be displayed after first submit
    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formRegister.markAllAsTouched();

    if (!this.formRegister.valid) {
      return;
    }

    this.isLoading = true;

    const payload: any = {
      email: this.formRegister.controls.email.value,
      password: Md5.hashStr(this.formRegister.controls.password.value),
    }

    this.$auth.register(payload).then((authUser: any) => {
      // do other stuff here
      // ..

      // send the user to the dashboard
      this.router.navigate(['/dashboard']);
    }, (err: any) => {

      this.isLoading = false;

      switch (err.error.code) {
        case 406:
          // Already a user in the system with that email
          this.formRegister.get('email').setErrors({ taken: true });
          break;
        case 422:
          // Email value is an invalid email address
          this.formRegister.get('email').setErrors({ invalid: true });
          break;
        default:
          break;
      }
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
