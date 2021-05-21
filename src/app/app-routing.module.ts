import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  {
    path: '',
    loadChildren: () => import('./views/auth/auth.module')
      .then(mod => mod.AuthModule)
  },
  {
    path: '',
    loadChildren: () => import('./views/platform/platform.module')
      .then(mod => mod.PlatformModule)
  },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
