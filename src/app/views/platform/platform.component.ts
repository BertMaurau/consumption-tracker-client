import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/providers/auth.service';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {

  public authUser: any = {};

  constructor(
    private $auth: AuthService,
  ) { 
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    })
  }

  ngOnInit(): void {
  }

}
