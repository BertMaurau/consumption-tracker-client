import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { ServerService } from './server.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public authUser: ReplaySubject<any> = new ReplaySubject(1);
  private authUserData: any = null;
  private authUserLoaded: boolean = false;

  constructor(
    private $server: ServerService,
    private $storage: StorageService,
  ) {
    this.authUser.subscribe((authUser: any) => {

      // keep track of local data
      this.authUserData = authUser;

      if (authUser) {
        this.authUserLoaded = true;
      }
    });
  }

  get isLoaded(): boolean {
    return !!(this.authUserLoaded);
  }
  get isAuthenticated(): boolean {
    return !!(this.$server.getToken());
  }
  get userId(): number {
    return this.authUserData?.id;
  }


  /**
   * Get the current auth-user's information
   */
  public me(): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.get(`/me`).subscribe((user: any) => {

        if (user) {

          // trigger the subject
          this.authUser.next(user);

          resolve(user);

        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Login
   */
  public login(payload: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/login`, payload).subscribe((user: any) => {

        if (user) {

          // check for token
          if (user.hasOwnProperty('attributes') && user.attributes.hasOwnProperty('access_token')) {
            this.$server.setToken(user.attributes.access_token, true);
          }

          // trigger the subject
          this.authUser.next(user);

          resolve(user);

        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Register
   */
  public async register(payload: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/register`, payload).subscribe((user: any) => {

        if (user) {

          // check for token
          if (user.hasOwnProperty('attributes') && user.attributes.hasOwnProperty('access_token')) {
            this.$server.setToken(user.attributes.access_token, true);
          }

          // trigger the subject
          this.authUser.next(user);

          resolve(user);

        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Update the current user information
   */
  public update(payload: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.patch(`/me`, null, payload).subscribe((user: any) => {
        if (user) {

          delete user.attributes;

          this.authUserData = Object.assign(this.authUserData, user);

          // trigger the subject
          this.authUser.next(this.authUserData);

          resolve(user);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Set/Update the user's avatar
   */
  public avatar(baseString: string): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/avatar`, { base64_string: baseString }).subscribe((user: any) => {
        if (user) {

          this.authUserData.avatar = user.avatar;

          // trigger the subject
          this.authUser.next(this.authUserData);

          resolve(user);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Request reset password
   */
  public requestPasswordReset(payload: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/password-resets/request`, payload).subscribe((userPasswordReset: any) => {
        if (userPasswordReset) {
          resolve(userPasswordReset);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Reset password
   */
  public resetPassword(payload: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/password-resets/reset`, payload).subscribe((userPasswordReset: any) => {
        if (userPasswordReset) {
          resolve(userPasswordReset);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Deactivate given auth token
   */
  public destroy(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // get users from API
      this.$server.post(`/logout`, {}).subscribe((userToken: any) => {

        // clear token from device
        this.$server.unsetToken();

        // clear any other stored information
        this.$storage.clear();

        // clear session user
        this.authUser.next(null);

        resolve(userToken);
      }, (err: HttpErrorResponse) => {
        // we don't care if error or not
        resolve(true);
      });

    });
  }

}
