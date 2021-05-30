import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ServerService } from './server.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionsService {

  public summary: ReplaySubject<any> = new ReplaySubject(1);
  private summaryData: any = null;

  public consumptionsList: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private consumptionsListData: Array<any> = null;

  public consumptionsChart: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private consumptionsChartData: any = {};

  constructor(
    private $server: ServerService,
  ) {
    this.consumptionsList.subscribe((consumptionsList: Array<any>) => {
      this.consumptionsListData = consumptionsList;
    })
    this.consumptionsChart.subscribe((consumptionsChart: Array<any>) => {
      this.consumptionsChartData = consumptionsChart;
    })
  }

  public get(query?: any, take: number = 50, skip: number = 0): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      const uri = `/my/consumptions?display=default&take=${take}&skip=${skip}${this._buildQuerystring(query)}`;

      this.$server.get(uri).subscribe((userConsumptions: Array<any>) => {

        if (userConsumptions) {

          if (skip === 0) {
            this.consumptionsListData = userConsumptions;
          } else {
            // append
            this.consumptionsListData = [].concat(this.consumptionsListData, userConsumptions);
          }

          // trigger the subject
          this.consumptionsList.next(this.consumptionsListData);

          resolve(this.consumptionsListData);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public getSummary(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.summaryData) {
        resolve(this.summaryData);
        return;
      }
      this.$server.get(`/my/consumptions?display=summary`).subscribe((summary: any) => {

        if (summary) {

          this.summaryData = summary;

          // trigger the subject
          this.summary.next(this.summaryData);

          resolve(this.summaryData);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public getChart(cacheKey: string, from: string, until: string, group: string = 'day'): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      if (this.consumptionsChartData.hasOwnProperty(cacheKey)) {
        resolve(this.consumptionsChartData);
        return;
      }
      this.$server.get(`/my/consumptions?display=chart&period=custom&group=${group}&from=${from}&until=${until}`).subscribe((chartData: Array<any>) => {

        if (chartData) {

          this.consumptionsChartData[cacheKey] = chartData;

          // trigger the subject
          this.consumptionsChart.next(this.consumptionsChartData);

          resolve(this.consumptionsChartData);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  public create(itemId: number, volume: number, consumedAtUtc: string, notes?: string): Promise<Array<any>> {

    return new Promise<any>((resolve, reject) => {

      this.$server.post(`/my/consumptions`, {item_id: itemId, volume, consumed_at: consumedAtUtc, notes}).subscribe((userConsumption: any) => {

        if (userConsumption) {

          this.consumptionsListData.unshift(userConsumption);
          this.consumptionsList.next(this.consumptionsListData);

          // other lists..

          // update chart
          this._addToChart(userConsumption);

          resolve(userConsumption);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });

    
  }

  private _addToChart(userConsumption: any): void {

    // add the volume to the chart data

    // consumed at is UTC time
    const dateFormatConsumed = moment.utc(userConsumption.consumed_at.date).local().format('YYYY-MM-DD');

    for (const [key, value] of Object.entries(this.consumptionsChartData)) {

      const until = key.split('-')[1];

      if (until === dateFormatConsumed) {
        this.consumptionsChartData[key] = this.consumptionsChartData[key].map((series: any) => {
          if (series.item_id === userConsumption.item_id) {
            // last item in the series will always hold the volume for/until this day, so we
            // can safely add the volume to that total
            series.series[series.series.length - 1].value += userConsumption.volume;
          }
          return series;
        })
      }
    }

    // trigger the subject
    this.consumptionsChart.next(this.consumptionsChartData);
  }

  /**
   * Generate a query string from key-value items
   * @param {any} query
   */
   private _buildQuerystring(query: any): string {
    let qs = '';
    qs += query.orderBy ? `&orderBy=${query.orderBy || ''}` : '';
    return qs;
  }
}
