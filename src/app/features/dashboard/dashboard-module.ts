import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';


@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    FullCalendarModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
