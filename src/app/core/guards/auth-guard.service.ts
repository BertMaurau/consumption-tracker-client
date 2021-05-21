import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './../providers/auth.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class AuthGuardService implements CanActivate {

  // private userSubscription: any = null;

  constructor(
    private $auth: AuthService,
    private router: Router,
  ) {
  }

  /**
   * Can activate guarded route
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
   */
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkPermissions(route);
  }

  /**
   * Check actual permissions for routing
   * @param {ActivatedRouteSnapshot} route
   * @returns {boolean}
   */
  private checkPermissions(route: ActivatedRouteSnapshot): Promise<boolean> | boolean {

    // no subscription checks, just if valid and authenticated user
    if (!this.$auth.isAuthenticated) {

      this.router.navigate(['/sign-in']);
      return false;
    } else {

      // check if authUser has been loaded, if not, get user info
      if (!this.$auth.isLoaded) {

        return new Promise<boolean>((resolve, reject) => {

          this.$auth.me().then((authUser: any) => {
            resolve(true);
          }, (err: any) => {
            this.router.navigate(['/sign-in']);
          });
        });
      } else {
        return true;
      }
    }
  }
}
