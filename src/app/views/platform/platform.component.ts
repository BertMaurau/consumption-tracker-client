import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/providers/auth.service';
import { ConsumptionsService } from 'src/app/core/providers/consumptions.service';
import { AddConsumptionDialogComponent } from 'src/app/shared/dialogs/add-consumption-dialog/add-consumption-dialog.component';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {

  public authUser: any = {};

  constructor(
    private dialog: MatDialog,
    private $auth: AuthService,
    private $consumption: ConsumptionsService,
  ) { 
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    })
  }

  ngOnInit(): void {
  }

  public onAddConsumption(): void {
    const dialogRef = this.dialog.open(AddConsumptionDialogComponent, {
      panelClass: ['custom-dialog', 'w512'],
      data: {},
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((payload?: any) => {
      
    });
  }
}
