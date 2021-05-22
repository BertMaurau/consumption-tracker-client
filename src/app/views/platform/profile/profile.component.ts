import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/providers/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public authUser: any = {};

  public isEditing: boolean = false;
  public hasChanged: boolean = false;

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
