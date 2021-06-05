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

      this.$server.post(`/my/consumptions`, { item_id: itemId, volume, consumed_at: consumedAtUtc, notes }).subscribe((userConsumption: any) => {

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

  /**
   * Add the user's consumption to the chart data
   * @param {any} userConsumption The returned consumption
   * @returns {void}
   */
  private _addToChart(userConsumption: any): void {

    // get the consumed item
    const item: any = userConsumption.relations.item;

    // add the volume to the chart data
    for (const [key, value] of Object.entries(this.consumptionsChartData)) {

      const cacheKeyParts = key.split('#');

      let chartData: Array<any> = <Array<any>>value;
      let dateFormatConsumed: string = null;
      let itemSeries: Array<any> = [];
      let seriesFormat: string;

      // check the grouping
      switch (cacheKeyParts[2]) {
        case 'day':
          seriesFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          seriesFormat = 'YYYY-[W]WW';
          break;
        case 'month':
          seriesFormat = 'YYYY-MM';
          break;
        default:
          break;
      }

      // create the label for week of consumption (consumed at is UTC time)
      dateFormatConsumed = moment.utc(userConsumption.consumed_at.date).local().format(seriesFormat);

      // check if there is already a series listed for that item
      itemSeries = chartData.find((item: any) => item.item_id === userConsumption.item_id);
      if (!itemSeries) {

        // no series yet, so we need to generate/build a full one
        const dateEmptySeries: Array<any> = [];

        // build the series' range
        let dateFrom = moment(cacheKeyParts[0]);
        let dateUntil = moment(cacheKeyParts[1]);
        let seriesUnit: moment.unitOfTime.DurationConstructor = <moment.unitOfTime.DurationConstructor>cacheKeyParts[2];

        // logic for getting rest of the dates between two dates("FromDate" to "EndDate")
        while (dateFrom.isSameOrBefore(dateUntil)) {
          // push series to list
          dateEmptySeries.push({ name: dateFrom.format(seriesFormat), value: 0 });

          // step to next series
          dateFrom = dateFrom.add(1, seriesUnit);
        }

        // add the item to the series with empty values (gets added later)
        chartData.push({
          name: item.description,
          item_id: item.id,
          series: dateEmptySeries,
        });

      }

      // reached the part where we update the series value
      chartData = chartData.map((itemSeries: any) => {
        if (itemSeries.item_id === userConsumption.item_id) {
          itemSeries.series = itemSeries.series.map((series: any) => {
            if (series.name === dateFormatConsumed) {
              series.value += userConsumption.volume;
            }
            return series;
          });
        }
        return itemSeries;
      });

      // update final object
      this.consumptionsChartData[key] = chartData;

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
