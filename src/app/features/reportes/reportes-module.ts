import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportesRoutingModule } from './reportes-routing-module';
import { Reportes } from './reportes';


@NgModule({
  declarations: [
    Reportes
  ],
  imports: [
    CommonModule,
    ReportesRoutingModule
  ]
})
export class ReportesModule { }


