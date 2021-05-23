import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/providers/auth.service';
import * as moment from 'moment';
import { ConsumptionsService } from 'src/app/core/providers/consumptions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public authUser: any = {};

  public chartData: Array<any> = [];
  public chartPeriod = 'custom';
  public chartDateStep: number = 1;
  public chartDateFrom: moment.Moment;
  public chartDateUntil: moment.Moment;

  // chart data query
  public chartGroupBy: any = { key: 'day', display: 'Daily' };

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

  public consumptionList: any = {
    take: 50,
    skip: 0,
    query: {orderBy: '-consumed_at'},
    results: [],
  };

  constructor(
    private $auth: AuthService,
    private $consumptions: ConsumptionsService,
  ) { 
    this.$auth.authUser.subscribe((authUser: any) => {
      this.authUser = authUser;
    });

    this.$consumptions.consumptionsList.subscribe((userConsumptions: Array<any>) => {
      this.consumptionList.results = userConsumptions;
    })
  }

  ngOnInit() {
    this.onChartGroupByChanged(this.chartGroupBy.key);

    this._getConsumptions();
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
    const cacheKey = `${from}-${until}-${group}`;
    this.$consumptions.getChart(cacheKey, from, until, group).then((chartData: Array<any>) => {
      this.chartData = chartData[cacheKey];
    })
  }

  private _getConsumptions(): void {
    this.$consumptions.get(this.consumptionList.query, this.consumptionList.take,this.consumptionList.skip).then(() => {});
  }

}
