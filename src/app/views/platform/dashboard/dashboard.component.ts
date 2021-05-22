import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/providers/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public authUser: any = {};

  constructor(
    private $auth: AuthService,
  ) { 
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    })
  }

  ngOnInit() {
    
  }

}
