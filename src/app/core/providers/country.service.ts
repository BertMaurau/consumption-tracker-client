import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  public countries: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private countriesData: any = null;

  constructor(
    private $server: ServerService,
  ) { 
    this.countries.subscribe((countries: Array<any>) => {
      this.countriesData = countries;
    });
  }

  public get(): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      if (this.countriesData) {
        resolve(this.countriesData)
        return;
      }
      this.$server.get(`/countries?take=500&orderBy=name`).subscribe((items: Array<any>) => {

        if (items) {

          // trigger the subject
          this.countries.next(items);

          resolve(items);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public show(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.$server.get(`/countries/${id}`).subscribe((item: any) => {

        if (item) {

          // update local
          this.countriesData = this.countriesData.map((o: any) => {
            if (o.id === item.id) {
              return item;
            }
            return o;
          })

          // trigger the subject
          this.countries.next(this.countriesData);

          resolve(item);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }
}
