import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/providers/auth.service';
import { AddConsumptionDialogComponent } from 'src/app/shared/dialogs/add-consumption-dialog/add-consumption-dialog.component';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent {

  public authUser: any = {};

  constructor(
    private dialog: MatDialog,
    private $auth: AuthService,
  ) { 
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    })
  }

  /**
   * Open new consumption dialog via floating fab button
   * @returns {void}
   */
  public onAddConsumption(): void {
    const dialogRef = this.dialog.open(AddConsumptionDialogComponent, {
      panelClass: ['custom-dialog', 'w512'],
      data: {},
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((payload?: any) => {});
  }
}
