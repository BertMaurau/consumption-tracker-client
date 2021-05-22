import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/providers/auth.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {

  public formLogin: FormGroup;

  public isLoading: boolean = false;
  public hasSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private $auth: AuthService,
  ) {
    this.formLogin = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Check if allowed to display errors
   * @param {string} controlName 
   * @returns {boolean}
   */
  public controlHasError(controlName: string): boolean {
    // check if the user already touched the fields
    return !!(this.hasSubmitted && this.formLogin.get(controlName).invalid && (this.formLogin.get(controlName).dirty || this.formLogin.get(controlName).touched) && this.formLogin.get(controlName).errors);
  }

  /**
   * Remove any set errors for given control
   * @param {string} controlName 
   * @returns {void}
   */
  public clearControlErrors(controlName: string): void {
    this.formLogin.get(controlName).setErrors(null);
  }

  /**
   * Do form stuff and make the sign-in call
   * @returns {void}
   */
  public onSignIn(): void {

    // simple flag to allow for errors to only be displayed after first submit
    this.hasSubmitted = true;

    // mark them all as touched so that errors get triggered
    this.formLogin.markAllAsTouched();

    if (!this.formLogin.valid) {
      return;
    }

    this.isLoading = true;

    const payload: any = {
      email: this.formLogin.controls.email.value,
      password: Md5.hashStr(this.formLogin.controls.password.value),
    }

    this.$auth.login(payload).then((authUser: any) => {

      // do other stuff here
      // ..

      // send the user to the dashboard
      this.router.navigate(['/dashboard']);

    }, (err: any) => {

      this.isLoading = false;
      
      switch (err.error.code) {
        case 401:
          // Invalid password for given email combo
          this.formLogin.get('password').setErrors({ invalid: true });
          break;
        case 404:
          // No user account found for given email address
          this.formLogin.get('email').setErrors({ notFound: true });
          break;
        case 422:
          // Email value is an invalid email address
          this.formLogin.get('email').setErrors({ invalid: true });
          break;
        default:
          break;
      }
    });

  }

}
