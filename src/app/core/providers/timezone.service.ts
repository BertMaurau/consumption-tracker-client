import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  public timezones: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private timezonesData: any = null;

  constructor(
    private $server: ServerService,
  ) { 
    this.timezones.subscribe((timezones: Array<any>) => {
      this.timezonesData = timezones;
    });
  }

  public get(): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      if (this.timezonesData) {
        resolve(this.timezonesData)
        return;
      }
      this.$server.get(`/timezones?take=500&orderBy=country_code`).subscribe((items: Array<any>) => {

        if (items) {

          // trigger the subject
          this.timezones.next(items);

          resolve(items);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public show(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.$server.get(`/timezones/${id}`).subscribe((item: any) => {

        if (item) {

          // update local
          this.timezonesData = this.timezonesData.map((o: any) => {
            if (o.id === item.id) {
              return item;
            }
            return o;
          })

          // trigger the subject
          this.timezones.next(this.timezonesData);

          resolve(item);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }
}
