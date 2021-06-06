import { ApplicationRef, Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'consumption-tracker';

  constructor(
    private snackBar: MatSnackBar,
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef,
  ) {
    if (this.swUpdate.isEnabled) {

      // allow the app to stabilize first, before starting polling for updates with `interval()`.
      const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => { console.log('[SW] App stabilized!'); return isStable === true; }));
      const everySixHours$ = interval(30 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(() => this.swUpdate.checkForUpdate());

      this.swUpdate.available.subscribe((event: any) => {
        console.log('[SW] Running current version:', event.current);
        console.log('[SW] Available version is:', event.available);

        // let's check if the browser supports notifications
        if (!("Notification" in window)) {
          console.log('Web Notification not supported');
          // show custom notification
          this._newVersionNotification(true);
        }

        // let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
          console.log('Granted notification permissions.');
          // If it's okay let's create a notification
          this._newVersionNotification();
        }

        // otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(function (permission) {
            // if the user accepts, let's create a notification
            this._newVersionNotification(permission !== "granted");
          });
        } else {
          console.log('Denied notification permissions.');
          // show custom notification
          this._newVersionNotification(true);
        }

      });
      this.swUpdate.activated.subscribe((event: any) => {
        console.log('[SW] Old version was:', event.previous);
        console.log('[SW] New version is:', event.current);
      });
    }
  }

  /**
   * Notify the user about a new version to reload the page
   * @param {boolean} isCustom Custom notification or use browser one
   * @returns {void}
   */
  private _newVersionNotification(isCustom?: boolean): void {
    if (isCustom) {
      const snackBarRef = this.snackBar.open('New version available!', 'Reload', { verticalPosition: 'top' });
      snackBarRef.onAction().subscribe(() => {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      });
    } else {
      const notification = new Notification('New version available!', {
        body: 'Click here to reload the application.',
        dir: 'auto',
        requireInteraction: true,
      });
      notification.onclick = (event) => {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      };

      // show the custom one as well, just to be sure
      this._newVersionNotification(true);
    }
  }
}
