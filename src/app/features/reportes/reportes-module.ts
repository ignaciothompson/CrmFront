import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ReportesRoutingModule } from './reportes-routing-module';
import { Reportes } from './reportes';


@NgModule({
  declarations: [
    Reportes
  ],
  imports: [
    CommonModule,
    NgxChartsModule,
    ReportesRoutingModule
  ]
})
export class ReportesModule { }


