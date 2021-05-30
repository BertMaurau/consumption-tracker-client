import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  public items: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private itemsData: any = null;

  constructor(
    private $server: ServerService,
  ) { 
    this.items.subscribe((items: Array<any>) => {
      this.itemsData = items;
    });
  }

  public get(): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      if (this.itemsData) {
        resolve(this.itemsData)
        return;
      }
      this.$server.get(`/items?take=500&orderBy=description`).subscribe((items: Array<any>) => {

        if (items) {

          // trigger the subject
          this.items.next(items);

          resolve(items);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public show(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.$server.get(`/items/${id}`).subscribe((item: any) => {

        if (item) {

          // update local
          this.itemsData = this.itemsData.map((o: any) => {
            if (o.id === item.id) {
              return item;
            }
            return o;
          })

          // trigger the subject
          this.items.next(this.itemsData);

          resolve(item);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }
}
