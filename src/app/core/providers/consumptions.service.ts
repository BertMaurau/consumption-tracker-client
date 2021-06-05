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
    this.summary.subscribe((summary: any) => {
      this.summaryData = summary;
    })
    this.consumptionsList.subscribe((consumptionsList: Array<any>) => {
      this.consumptionsListData = consumptionsList;
    })
    this.consumptionsChart.subscribe((consumptionsChart: Array<any>) => {
      this.consumptionsChartData = consumptionsChart;
    })
  }

  /**
   * Get list of suggested items and their volume based on recent consumptions
   * @returns {Array<any>} The list of items and their volume
   */
  public getSuggested(): Array<any> {

    let mapConsumptions: any = {};

    this.consumptionsListData.forEach((userConsumption: any) => {
      const itemId: number = userConsumption.item_id;
      const volume: number = userConsumption.volume;

      if (!mapConsumptions.hasOwnProperty(itemId)) {
        mapConsumptions[itemId] = {
          item_id: itemId,
          occurrences: 0,
          volumes: {}
        }
      }

      // increase occurrences
      mapConsumptions[itemId].occurrences += 1;

      // add volume to the list with times of occurrences
      if (mapConsumptions[itemId].volumes.hasOwnProperty(volume)) {
        mapConsumptions[itemId].volumes[volume] += 1;
      } else {
        mapConsumptions[itemId].volumes[volume] = 1;
      }
    })

    // strip "map"
    mapConsumptions = Object.values(mapConsumptions);

    // sort on occurrences
    mapConsumptions.sort((a: any, b: any) => b.occurrences - a.occurrences);

    // get the most used volume as recommended
    mapConsumptions = mapConsumptions.map((item: any) => {

      // get the volume with most occurrences
      const popularVolume = Object.keys(item.volumes).sort((a: any, b: any) => item.volumes[b] - item.volumes[a])[0]

      return {
        item_id: item.item_id,
        volume: parseInt(popularVolume),
      }
    });

    return mapConsumptions;
  }


  /**
   * Get the summary of the User's consumptions
   * @returns {Promise<any> }
   */
  public getSummary(): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      // check if already fetched before
      if (this.summaryData) {
        resolve(this.summaryData);
        return;
      }

      this.$server.get(`/my/consumptions?display=summary`).subscribe((summary: any) => {

        if (summary) {

          // store
          this.summaryData = summary;

          // trigger the subject
          this.summary.next(this.summaryData);

          // return the result
          resolve(this.summaryData);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Get a list of consumptions
   * @param {any} query The filter query
   * @param {number} take Pagination take
   * @param {number} skip Pagination skip
   * @returns {Promise<Array<any>>}
   */
  public get(query?: any, take: number = 50, skip: number = 0): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      const uri = `/my/consumptions?display=default&take=${take}&skip=${skip}${this._buildQuerystring(query)}`;

      this.$server.get(uri).subscribe((userConsumptions: Array<any>) => {

        if (userConsumptions) {

          if (skip === 0) {
            // reset the list, since we started a new result set
            this.consumptionsListData = userConsumptions;
          } else {
            // append to current list, since we expanded the list
            this.consumptionsListData = [].concat(this.consumptionsListData, userConsumptions);
          }

          // trigger the subject
          this.consumptionsList.next(this.consumptionsListData);

          // return the result
          resolve(userConsumptions);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Get consumptions (as Chart-data)
   * @param {string} cacheKey The cache-key (from#until#group)
   * @param {string} from The date-format from
   * @param {string} until The date format until
   * @param {string} group The grouping key
   * @returns {Promise<Array<any>>}
   */
  public getChart(cacheKey: string, from: string, until: string, group: string = 'day'): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      // check if specific date-range-grouping has been fetched before
      if (this.consumptionsChartData.hasOwnProperty(cacheKey)) {
        resolve(this.consumptionsChartData);
        return;
      }

      this.$server.get(`/my/consumptions?display=chart&period=custom&group=${group}&from=${from}&until=${until}`).subscribe((chartData: Array<any>) => {

        if (chartData) {

          // cache the result
          this.consumptionsChartData[cacheKey] = chartData;

          // trigger the subject
          this.consumptionsChart.next(this.consumptionsChartData);

          // return the result
          resolve(chartData);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Register a new User Consumption
   * @param {any} payload The payload
   * @returns {Promise<Array<any>>}
   */
  public create(payload: any): Promise<Array<any>> {

    return new Promise<any>((resolve, reject) => {

      this.$server.post(`/my/consumptions`, payload).subscribe((userConsumption: any) => {

        if (userConsumption) {

          // add to list of fetched consumptions
          this.consumptionsListData.unshift(userConsumption);

          // sort based on consumption date
          this.consumptionsListData.sort((a: any, b: any) => { return new Date(b.consumed_at.date).getTime() - new Date(a.consumed_at.date).getTime(); });

          // trigger subscriptions
          this.consumptionsList.next(this.consumptionsListData);

          // other actions..

          // update chart
          this._addToChart(userConsumption);

          // update the summary
          this._addToSummary(userConsumption);

          // return the result
          resolve(userConsumption);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  }

  /**
   * Update an existing consumption
   * @param {number} userConsumptionId The resource ID
   * @param {any} payload The new payload
   * @returns {Promise<Array<any>>}
   */
  public update(userConsumptionId: number, payload: any): Promise<Array<any>> {
    return new Promise<any>((resolve, reject) => {

      this.$server.patch(`/my/consumptions`, userConsumptionId, payload).subscribe((userConsumption: any) => {

        if (userConsumption) {

          // add to list of fetched consumptions
          this.consumptionsListData = this.consumptionsListData.map((uc: any) => {
            if (uc.id === userConsumptionId) {
              return userConsumption;
            }
            return uc;
          })

          // sort based on consumption date
          this.consumptionsListData.sort((a: any, b: any) => { return new Date(b.consumed_at.date).getTime() - new Date(a.consumed_at.date).getTime(); });

          // trigger subscriptions
          this.consumptionsList.next(this.consumptionsListData);

          // other actions..

          // we should update the chart and summary
          // but gets a bit tricky then. Have to keep track of
          // the changed volume, the change of an item, the date
          // .. Perfectly doable, just not in the mood

          // return the result
          resolve(userConsumption);
        }
      }, (err: HttpErrorResponse) => {
        reject(err);
      });
    });
  };

  /**
   * Add the user's consumption to the chart data
   * @param {any} userConsumption The returned consumption
   * @returns {void}
   */
  private _addToChart(userConsumption: any): void {

    // get the consumed item
    const consumedItem: any = userConsumption.relations.item;

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
          name: consumedItem.description,
          item_id: consumedItem.id,
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
   * Add the user's consumption to the summary data
   * @param {any} userConsumption The returned consumption
   * @returns {void}
   */
  private _addToSummary(userConsumption: any): void {

    const consumedItem: any = userConsumption.relations.item;

    // update the total
    this.summaryData.total += userConsumption.volume;

    // update specific category
    this.summaryData.categories.map((category: any) => {
      if (category.id === consumedItem.item_category_id) {
        category.total_volume += userConsumption.volume;

        // check if item is already listed there
        const item = category.items.find((item: any) => item.id === consumedItem.id);
        if (!item) {
          // create a new entry for this item
          category.items.push({
            avg_volume: userConsumption.volume,
            description: consumedItem.description,
            id: consumedItem.id,
            total_volume: userConsumption.volume,
          });
        } else {
          // add the volume to the already-set total
          item.total_volume += userConsumption.volume;

          // what do we do with the avg..?
        }
      }

      return category;
    })

    // trigger the subject
    this.summary.next(this.summaryData);
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
