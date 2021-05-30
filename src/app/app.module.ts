import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppService } from './core/providers/app.service';
import { ServerService } from './core/providers/server.service';
import { StorageService } from './core/providers/storage.service';
import { AuthGuardService } from './core/guards/auth-guard.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CountryService } from './core/providers/country.service';
import { TimezoneService } from './core/providers/timezone.service';
import { ConsumptionsComponent } from './views/platform/consumptions/consumptions.component';
import { ItemService } from './core/providers/item.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [
    AuthGuardService,
    AppService,
    ServerService,
    StorageService,
    CountryService,
    TimezoneService,
    ConsumptionsComponent,
    ItemService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
