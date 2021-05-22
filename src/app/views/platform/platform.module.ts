import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlatformComponent } from './platform.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/core/guards/auth-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ConsumptionsComponent } from './consumptions/consumptions.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  {
    path: '',
    component: PlatformComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'consumptions', component: ConsumptionsComponent },
    ],
    canActivate: [AuthGuardService],
  },
];


@NgModule({
  declarations: [DashboardComponent, PlatformComponent, ProfileComponent, ConsumptionsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class PlatformModule { }
