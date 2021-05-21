import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlatformComponent } from './platform.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/core/guards/auth-guard.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  {
    path: '',
    component: PlatformComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
    ],
    canActivate: [AuthGuardService],
  },
];


@NgModule({
  declarations: [DashboardComponent, PlatformComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class PlatformModule { }
