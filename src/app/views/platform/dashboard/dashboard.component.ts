import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/providers/auth.service';
import * as moment from 'moment';
import { ConsumptionsService } from 'src/app/core/providers/consumptions.service';
import { ItemService } from 'src/app/core/providers/item.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { curveBasis } from 'd3-shape';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public authUser: any = {};

  public chartData: Array<any> = null;
  public chartPeriod = 'custom';
  public chartDateStep: number = 1;
  public chartDateFrom: moment.Moment;
  public chartDateUntil: moment.Moment;
  public chartCurve: any = curveBasis;

  public chartDataCacheKey: string = null;

  // chart data query
  public chartGroupBy: any = { key: 'day', display: 'Daily' };

  // chart grouping options
  public groupOptions: Array<any> = [
    {
      key: 'day',
      display: 'Daily'
    },
    {
      key: 'week',
      display: 'Weekly'
    },
    {
      key: 'month',
      display: 'Monthly'
    }
  ];

  // holds the list of the recent consumptions
  public consumptionList: any = {
    take: 50,
    skip: 0,
    query: { orderBy: '-consumed_at' },
    results: [],
  };

  // basic summary item
  public summary: any = {
    total: 0,
    categories: [],
  }

  // mapped items from the ID -> the item
  public itemsMap: Map<number, any> = new Map();

  constructor(
    private $auth: AuthService,
    private $consumptions: ConsumptionsService,
    private $item: ItemService,
  ) {
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    });
    this.$consumptions.summary.subscribe((summary: any) => {
      this.summary = summary;
    })
    this.$consumptions.consumptionsChart.subscribe((chartData: Array<any>) => {
      this.chartData = chartData[this.chartDataCacheKey];
    })

    combineLatest([this.$consumptions.consumptionsList, this.$item.items]).subscribe(([consumptions, items]) => {

        // build item map
        const itemMap = new Map();
        items.forEach((item: any) => {
          itemMap.set(item.id, item);
        });

        // process consumptions
        this.consumptionList.results = consumptions.map((consumption: any) => {
          consumption.attributes.item = itemMap.get(consumption.item_id);
          return consumption;
        })
      }
    );
  }

  ngOnInit() {
    this.onChartGroupByChanged(this.chartGroupBy.key);

    this._getConsumptions();
    this._getSummary();
    this._getItems();
  }

  public onChartGroupByChanged(groupBy: string, step?: number): void {

    step = step || 1;

    this.chartDateStep = step;

    switch (groupBy) {
      case 'day':
        this.chartDateFrom = ((this.chartDateStep === 1) ? moment().subtract(10, 'day') : moment().subtract((10 * this.chartDateStep + 1), 'day'));
        this.chartDateUntil = ((this.chartDateStep === 1) ? moment() : moment().subtract((10 * this.chartDateStep), 'day'));
        break;
      case 'week':
        this.chartDateFrom = ((this.chartDateStep === 1) ? moment().subtract(10, 'week') : moment().subtract((10 * this.chartDateStep + 1), 'week'));
        this.chartDateUntil = ((this.chartDateStep === 1) ? moment() : moment().subtract((10 * this.chartDateStep), 'week'));
        break;
      case 'month':
        this.chartDateFrom = ((this.chartDateStep === 1) ? moment().subtract(10, 'month') : moment().subtract((10 * this.chartDateStep + 1), 'month'));
        this.chartDateUntil = ((this.chartDateStep === 1) ? moment() : moment().subtract((10 * this.chartDateStep), 'month'));
        break;
      default:
        break;
    }

    this._getChart(groupBy, this.chartDateFrom.format('YYYY-MM-DD'), this.chartDateUntil.format('YYYY-MM-DD'));

  }

  private _getChart(group: string, from: string, until: string) {
    this.chartDataCacheKey = `${from}#${until}#${group}`;
    this.$consumptions.getChart(this.chartDataCacheKey, from, until, group).then(() => {})
  }

  private _getItems() {
    this.$item.get().then(() => {})
  }

  private _getSummary() {
    this.$consumptions.getSummary().then(() => {})
  }

  private _getConsumptions(): void {
    this.$consumptions.get(this.consumptionList.query, this.consumptionList.take, this.consumptionList.skip).then(() => { });
  }

}
